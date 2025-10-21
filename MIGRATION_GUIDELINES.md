# Database Migration Guidelines

## Overview

This document provides guidelines for creating and managing database migrations in the Malaysian Finance Tracker project using Supabase/PostgreSQL.

---

## 1. Migration File Naming

### Format
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

### Examples
✅ **Good**:
- `20251021120000_add_admin_authorized_emails.sql`
- `20251021151000_fix_admin_table_permissions.sql`

❌ **Bad**:
- `migration.sql` (no timestamp)
- `20251021_fix.sql` (incomplete timestamp)
- `fix_admin.sql.sql` (double extension)

### Timestamp Rules
- Use UTC timezone
- Format: `YYYYMMDDHHMMSS` (14 digits)
- Ensure uniqueness (no two migrations with same timestamp)
- Maintain chronological order

---

## 2. Migration Structure

### Required Sections

Every migration file should include:

```sql
/*
  # Migration Title

  ## Purpose
  Brief description of what this migration does and why

  ## Changes
  - List of specific changes
  - One bullet per major change

  ## Context
  - Related issues/tickets
  - Dependencies on other migrations
  - Breaking changes (if any)

  ## Safety
  - Idempotency: Can this be run multiple times safely?
  - Rollback: Is there a down migration?
  - Data impact: Does this modify existing data?
*/

-- =====================================================
-- 1. FIRST SECTION
-- =====================================================

-- Code here...

-- =====================================================
-- 2. SECOND SECTION
-- =====================================================

-- Code here...

-- =====================================================
-- SUMMARY
-- =====================================================

/*
  Summary of what was accomplished
*/
```

---

## 3. Idempotency Requirements

### All migrations MUST be idempotent

Migrations should be safe to run multiple times without causing errors or duplicate data.

### Use These Patterns:

#### Tables
```sql
CREATE TABLE IF NOT EXISTS public.my_table (...);
```

#### Columns
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'my_table'
    AND column_name = 'my_column'
  ) THEN
    ALTER TABLE public.my_table ADD COLUMN my_column TEXT;
  END IF;
END $$;
```

#### Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_my_table_column ON public.my_table(column_name);
```

#### Functions
```sql
CREATE OR REPLACE FUNCTION public.my_function() ...
```

#### Policies
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'my_table'
    AND policyname = 'My Policy Name'
  ) THEN
    CREATE POLICY "My Policy Name" ON public.my_table ...;
  END IF;
END $$;
```

#### Triggers
```sql
DROP TRIGGER IF EXISTS my_trigger ON public.my_table;
CREATE TRIGGER my_trigger ...;
```

#### Grants
```sql
-- Grants are idempotent by nature, but wrap in DO block for safety
DO $$
BEGIN
  GRANT SELECT ON TABLE public.my_table TO authenticated;
EXCEPTION WHEN others THEN
  NULL; -- Ignore if already granted
END $$;
```

---

## 4. Function Definitions

### Security Requirements

```sql
CREATE OR REPLACE FUNCTION public.my_function()
RETURNS return_type
LANGUAGE plpgsql
SECURITY DEFINER  -- Required for accessing auth schema
SET search_path = 'public', 'auth', 'pg_temp'  -- Prevent search_path attacks
AS $$
BEGIN
  -- Function body
END;
$$;

-- Always grant execute permission
GRANT EXECUTE ON FUNCTION public.my_function() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.my_function() IS 'Description of what this function does';
```

### Critical Rules:
1. ✅ **Always use `SECURITY DEFINER` for functions accessing `auth` schema**
2. ✅ **Always set explicit `search_path`**
3. ✅ **Grant `EXECUTE` permission to appropriate roles**
4. ✅ **Add comments explaining function purpose**
5. ❌ **Never trust `search_path` from caller**

---

## 5. RLS Policy Best Practices

### Policy Naming Convention

```
[Role] can [action] [scope]
```

**Examples**:
- `Users can view own goals`
- `Admins can manage all goals`
- `Anyone can read system settings`

### Policy Creation Pattern

```sql
-- 1. Enable RLS on table
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- 2. Create policies with IF NOT EXISTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'my_table'
    AND policyname = 'Users can view own records'
  ) THEN
    CREATE POLICY "Users can view own records"
      ON public.my_table
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;
```

### Policy Optimization

✅ **Use subquery for auth.uid()**:
```sql
USING ((select auth.uid()) = user_id)
```

❌ **Don't call auth.uid() for each row**:
```sql
USING (auth.uid() = user_id)  -- Slower
```

### Complete CRUD Policies

Always create all 4 policies for full table access:

```sql
-- SELECT
CREATE POLICY "Policy name for select" ON table FOR SELECT ...
-- INSERT
CREATE POLICY "Policy name for insert" ON table FOR INSERT ...
-- UPDATE
CREATE POLICY "Policy name for update" ON table FOR UPDATE ...
-- DELETE
CREATE POLICY "Policy name for delete" ON table FOR DELETE ...
```

---

## 6. Common Pitfalls to Avoid

### ❌ Don't Do This:

#### 1. Modifying Base Schema
```sql
-- DON'T edit 20200101000000_base_schema.sql
-- Always create a new migration instead
```

#### 2. Non-Idempotent Operations
```sql
-- DON'T
INSERT INTO my_table VALUES ('value');  -- Fails on second run

-- DO
INSERT INTO my_table VALUES ('value')
ON CONFLICT (unique_column) DO NOTHING;
```

#### 3. Dropping Policies Without Checking
```sql
-- DON'T
DROP POLICY "My Policy" ON my_table;  -- Fails if doesn't exist

-- DO
DROP POLICY IF EXISTS "My Policy" ON my_table;
```

#### 4. Unsafe Function Definitions
```sql
-- DON'T
CREATE FUNCTION my_func() AS $$ ... $$ LANGUAGE plpgsql;

-- DO
CREATE FUNCTION my_func() AS $$ ... $$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp';
```

#### 5. Redundant Grants
```sql
-- DON'T grant if base schema already does it
-- Check base_schema.sql first before adding grants

-- If table already has GRANT ALL, don't add:
GRANT SELECT ON TABLE my_table TO authenticated;  -- Redundant
```

---

## 7. Testing Migrations

### Before Committing

1. **Test on fresh database**:
   ```bash
   supabase db reset
   ```

2. **Test idempotency** - run migration twice:
   ```bash
   supabase migration up
   supabase migration up  # Should not error
   ```

3. **Test rollback** (if applicable):
   ```bash
   supabase migration down
   ```

4. **Verify data integrity**:
   ```bash
   supabase db dump --data-only
   ```

### Validation Checklist

- [ ] Migration file named correctly
- [ ] Header comment explains purpose
- [ ] All operations are idempotent
- [ ] Functions have SECURITY DEFINER + search_path
- [ ] Policies use IF NOT EXISTS pattern
- [ ] Tested on clean database
- [ ] Tested running twice (idempotency)
- [ ] No hardcoded UUIDs or emails (use variables)
- [ ] Comments explain non-obvious logic

---

## 8. Migration Dependencies

### Document Dependencies

If migration depends on another, document it:

```sql
/*
  ## Dependencies
  - Requires: 20251021120000_add_admin_authorized_emails.sql
  - Modifies: is_admin() function created in prior migration
*/
```

### Check Dependencies

```sql
-- Fail fast if dependency missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'required_table'
  ) THEN
    RAISE EXCEPTION 'Migration requires required_table from prior migration';
  END IF;
END $$;
```

---

## 9. Rollback Strategy

### Down Migrations (Optional)

If creating reversible migrations, create a down file:

```
20251021120000_add_feature.sql       (up)
20251021120000_add_feature.down.sql  (down)
```

### What to Rollback

✅ **Safe to rollback**:
- Adding columns (if nullable)
- Adding indexes
- Adding policies
- Creating new tables

❌ **Dangerous to rollback**:
- Dropping columns (data loss)
- Changing data types
- Removing constraints

---

## 10. Security Considerations

### RLS Must Be Enabled

```sql
-- Always enable RLS on user-accessible tables
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
```

### Grant Least Privilege

```sql
-- Don't grant more than needed
GRANT SELECT ON TABLE config_table TO authenticated;  -- Read only

-- Not:
GRANT ALL ON TABLE config_table TO authenticated;  -- Too permissive
```

### Admin Functions Security

```sql
-- Admin functions should check authorization
CREATE OR REPLACE FUNCTION admin_operation()
RETURNS void AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;
  -- ... perform admin operation
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public', 'pg_temp';
```

---

## 11. Performance Considerations

### Indexes

Add indexes for:
- Foreign keys
- Columns used in WHERE clauses
- Columns used in JOINs
- Columns used in ORDER BY

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_my_table_user_id
ON public.my_table(user_id);
```

Use `CONCURRENTLY` for existing large tables (doesn't lock table).

### RLS Policy Performance

Optimize policies with subqueries:

```sql
-- Fast
USING ((select auth.uid()) = user_id)

-- Slow (evaluates for each row)
USING (auth.uid() = user_id)
```

---

## 12. Data Migrations

### Backfill Pattern

```sql
-- Add column with default
ALTER TABLE my_table ADD COLUMN new_column TEXT DEFAULT 'default_value';

-- Backfill existing rows (if different logic needed)
UPDATE my_table
SET new_column = some_calculation(old_column)
WHERE new_column IS NULL;

-- Remove default if temporary
ALTER TABLE my_table ALTER COLUMN new_column DROP DEFAULT;
```

### Batch Updates

For large tables, batch updates to avoid locks:

```sql
DO $$
DECLARE
  batch_size INT := 1000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE my_table
    SET new_column = old_column
    WHERE new_column IS NULL
    LIMIT batch_size;

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;

    -- Allow other transactions to proceed
    COMMIT;
  END LOOP;
END $$;
```

---

## 13. Migration Review Checklist

Before merging:

- [ ] Migration follows naming convention
- [ ] Header comment is complete and accurate
- [ ] All operations are idempotent
- [ ] Security best practices followed
- [ ] Tested on clean database
- [ ] Tested for idempotency
- [ ] No sensitive data in migration
- [ ] Performance impact considered
- [ ] RLS policies created/updated as needed
- [ ] Grants follow least privilege
- [ ] Code reviewed by another developer
- [ ] Related documentation updated

---

## 14. Common Patterns

### Add Admin-Only Table

```sql
-- 1. Create table
CREATE TABLE IF NOT EXISTS public.admin_config_xyz (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.admin_config_xyz ENABLE ROW LEVEL SECURITY;

-- 3. Add policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_config_xyz' AND policyname = 'Anyone can read xyz') THEN
    CREATE POLICY "Anyone can read xyz"
      ON public.admin_config_xyz FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_config_xyz' AND policyname = 'Admins can modify xyz') THEN
    CREATE POLICY "Admins can modify xyz"
      ON public.admin_config_xyz FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END $$;

-- 4. Grant permissions
GRANT SELECT ON TABLE public.admin_config_xyz TO authenticated;
```

### Add User-Owned Table

```sql
CREATE TABLE IF NOT EXISTS public.user_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data"
  ON public.user_data FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
```

---

## Summary

Following these guidelines ensures:
- ✅ Migrations are safe and idempotent
- ✅ Database security is maintained
- ✅ Performance is optimized
- ✅ Team can understand migration history
- ✅ Rollbacks are possible when needed

**When in doubt**, ask for review before merging!

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/ddl-priv.html)
- [Migration Best Practices](https://www.postgresql.org/docs/current/ddl-schemas.html)
- Project: `MIGRATION_ANALYSIS.md` for historical analysis
