# API Documentation

This document provides comprehensive documentation for Supabase database functions, RPC endpoints, and service APIs used in the Malaysian Financial Tracker.

## Table of Contents

- [Database Functions](#database-functions)
  - [is_admin()](#is_admin)
  - [sync_asb_units_held()](#sync_asb_units_held)
  - [handle_account_goal_removal()](#handle_account_goal_removal)
  - [update_updated_at_column()](#update_updated_at_column)
  - [prevent_unauthorized_admin_changes()](#prevent_unauthorized_admin_changes)
- [Service APIs](#service-apis)
  - [Admin Config Service](#admin-config-service)
  - [Audit Service](#audit-service)
  - [Config Service](#config-service)
- [Database Schema](#database-schema)

---

## Database Functions

### is_admin()

**Purpose:** Checks if the current authenticated user has admin privileges.

**Returns:** `boolean`

**Security:** `SECURITY DEFINER` with restricted search path

**Description:**
Dual-source admin verification function that checks both `profiles.is_admin` flag and `admin_authorized_emails` table. This provides flexible admin management where admins can be designated either through the database flag or email authorization list.

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth', 'pg_temp'
```

**Logic:**
1. Gets current authenticated user's UUID via `auth.uid()`
2. Returns `false` if user is not authenticated
3. Retrieves user's email from `auth.users` table
4. Checks if user has `profiles.is_admin = true` OR email exists in `admin_authorized_emails`
5. Returns `true` if either condition is met

**Usage:**
```typescript
// In TypeScript/JavaScript
const { data, error } = await supabase.rpc('is_admin');

// In RLS policies
CREATE POLICY "Admins can view all"
ON table_name FOR SELECT
TO authenticated
USING (is_admin());
```

**Related:**
- Used in RLS policies for admin tables
- Referenced by `adminAuth.ts` utility
- Powers admin panel access control

---

### sync_asb_units_held()

**Purpose:** Automatically synchronizes `units_held` with `current_balance` for ASB accounts.

**Type:** Trigger function

**Returns:** `TRIGGER`

**Description:**
ASB (Amanah Saham Bumiputera) units are always valued at RM 1.00 per unit. This function enforces this business rule by ensuring `units_held` equals `current_balance` for all ASB account types.

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION sync_asb_units_held()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_type = 'ASB' THEN
    NEW.units_held := NEW.current_balance;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Trigger:**
```sql
CREATE TRIGGER trigger_sync_asb_units_held
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_asb_units_held();
```

**Business Rule:**
- ASB unit price = RM 1.00 (fixed by Malaysian government)
- `units_held` = `current_balance` / 1.00
- Automatically maintained on insert/update

**Example:**
```typescript
// When creating/updating an ASB account:
await supabase.from('accounts').insert({
  account_type: 'ASB',
  current_balance: 5000.00,
  // units_held will automatically be set to 5000.00
});
```

**Related:**
- Migration: `20251016170510_add_asb_units_held_sync.sql`
- Component: `ASBCalculator.tsx`
- Type: `Account` interface with `units_held` field

---

### handle_account_goal_removal()

**Purpose:** Handles automatic goal mode switching when the last linked account is removed.

**Type:** Trigger function

**Returns:** `TRIGGER`

**Description:**
When an account-goal link is deleted and it was the last account funding that goal, this function:
1. Switches the goal to manual tracking mode (`is_manual_goal = true`)
2. Preserves the current progress in `manual_amount`
3. Creates a notification to inform the user

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION handle_account_goal_removal()
RETURNS TRIGGER AS $$
DECLARE
  remaining_accounts INTEGER;
  goal_name TEXT;
  goal_user_id UUID;
  final_amount NUMERIC;
BEGIN
  -- Count remaining accounts for this goal
  SELECT COUNT(*) INTO remaining_accounts
  FROM account_goals
  WHERE goal_id = OLD.goal_id AND id != OLD.id;
  
  -- If last account, switch to manual mode
  IF remaining_accounts = 0 THEN
    -- Calculate final amount and switch mode
    UPDATE goals 
    SET is_manual_goal = true,
        manual_amount = final_amount
    WHERE id = OLD.goal_id;
    
    -- Create notification
    INSERT INTO notifications (...);
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```

**Trigger:**
```sql
CREATE TRIGGER trigger_handle_account_goal_removal
  AFTER DELETE ON account_goals
  FOR EACH ROW
  EXECUTE FUNCTION handle_account_goal_removal();
```

**Use Case:**
Prevents orphaned goals when users delete all linked accounts. The goal remains trackable in manual mode with preserved progress.

**Related:**
- Migration: `20251024001531_add_account_goal_removal_trigger.sql`
- Component: `AccountGoalLinker.tsx`
- Table: `account_goals`, `goals`, `notifications`

---

### update_updated_at_column()

**Purpose:** Automatically updates the `updated_at` timestamp when a row is modified.

**Type:** Trigger function

**Returns:** `TRIGGER`

**Description:**
Generic trigger function that sets `updated_at = now()` on any row update. Applied to all tables that track modification time.

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Usage Example:**
```sql
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Applied To:**
- `profiles`
- `accounts`
- `goals`
- `admin_config_*` tables
- Other timestamped tables

**Note:** Only triggers on UPDATE operations, not INSERT.

---

### prevent_unauthorized_admin_changes()

**Purpose:** Prevents non-admin users from setting or removing admin privileges.

**Type:** Trigger function

**Returns:** `TRIGGER`

**Description:**
Security function that blocks unauthorized attempts to modify the `is_admin` flag in the profiles table. Only existing admins can grant or revoke admin privileges.

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION prevent_unauthorized_admin_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- If is_admin is being changed
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    -- Check if current user is admin
    IF NOT is_admin() THEN
      RAISE EXCEPTION 'Only administrators can modify admin privileges';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Trigger:**
```sql
CREATE TRIGGER check_admin_changes
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_admin_changes();
```

**Security Layer:**
- Prevents privilege escalation
- Works alongside RLS policies
- Raises exception to block unauthorized changes

**Related:**
- Migration: `20251017103000_enhance_admin_email_security.sql`
- Used by: Admin user management

---

## Service APIs

### Admin Config Service

**File:** `src/services/adminConfigService.ts`

**Purpose:** Centralized service for managing admin configuration data.

#### Methods

##### `getAllAccountTypes()`
```typescript
async getAllAccountTypes(): Promise<AccountType[]>
```
Fetches all account types from `admin_config_account_types` table.

**Returns:** Array of account type objects

**Example:**
```typescript
const types = await adminConfigService.getAllAccountTypes();
// Returns: [{ id, name, description, is_active, ... }]
```

---

##### `createAccountType(data)`
```typescript
async createAccountType(data: Omit<AccountType, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>): Promise<void>
```
Creates a new account type configuration.

**Parameters:**
- `name`: Account type name (e.g., "Cryptocurrency")
- `description`: Optional description
- `icon`: Icon name from Lucide React
- `is_active`: Active status (default: true)
- `sort_order`: Display order

**Throws:** Error if creation fails

**Example:**
```typescript
await adminConfigService.createAccountType({
  name: 'Cryptocurrency',
  description: 'Digital currency holdings',
  icon: 'Coins',
  is_active: true,
  sort_order: 10
});
```

---

##### `updateAccountType(id, data)`
```typescript
async updateAccountType(id: string, data: Partial<AccountType>): Promise<void>
```
Updates an existing account type.

**Parameters:**
- `id`: Account type UUID
- `data`: Partial account type object

**Example:**
```typescript
await adminConfigService.updateAccountType(accountTypeId, {
  is_active: false,
  description: 'Updated description'
});
```

---

##### `deleteAccountType(id)`
```typescript
async deleteAccountType(id: string): Promise<void>
```
Soft deletes an account type by setting `is_active = false`.

**Note:** Hard delete not recommended due to foreign key relationships.

---

##### `getAllInstitutions()`
Fetches all financial institutions.

##### `createInstitution(data)`
Creates a new institution configuration.

##### `updateInstitution(id, data)`
Updates institution details.

##### `deleteInstitution(id)`
Soft deletes an institution.

##### `getAllGoalCategories()`
Fetches all goal categories.

##### `createGoalCategory(data)`
Creates a new goal category.

##### `updateGoalCategory(id, data)`
Updates goal category.

##### `deleteGoalCategory(id)`
Soft deletes a goal category.

##### `createGoalTemplate(data)`
Creates a new goal template.

##### `updateGoalTemplate(id, data)`
Updates goal template.

##### `deleteGoalTemplate(id)`
Deletes a goal template.

---

### Audit Service

**File:** `src/services/auditService.ts`

**Purpose:** Comprehensive audit logging for administrative actions.

#### Methods

##### `logAction(params)`
```typescript
async logAction(params: {
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  old_value?: any;
  new_value?: any;
}): Promise<void>
```

Logs an administrative action to `admin_audit_log` table.

**Parameters:**
- `action_type`: Type of action performed
- `table_name`: Database table affected
- `record_id`: ID of the record modified
- `old_value`: Previous state (for UPDATE/DELETE)
- `new_value`: New state (for CREATE/UPDATE)

**Example:**
```typescript
await auditService.logAction({
  action_type: 'UPDATE',
  table_name: 'admin_config_account_types',
  record_id: accountTypeId,
  old_value: { is_active: true },
  new_value: { is_active: false }
});
```

**Automatic Fields:**
- `user_id`: Current authenticated user
- `action_timestamp`: Current timestamp
- `ip_address`: User's IP (if available)

---

### Config Service

**File:** `src/services/configService.ts`

**Purpose:** Frontend configuration data access (non-admin).

#### Types

```typescript
interface AccountType {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Institution {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface GoalCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}
```

#### Methods

##### `getActiveAccountTypes()`
Returns only active account types, sorted by `sort_order`.

##### `getActiveInstitutions()`
Returns only active institutions, sorted by name.

##### `getActiveGoalCategories()`
Returns only active goal categories, sorted by `sort_order`.

---

## Database Schema

### Core Tables

#### `profiles`
User profile information and settings.

**Key Columns:**
- `id` (UUID, PK): User ID from auth.users
- `email` (TEXT): User email
- `is_admin` (BOOLEAN): Admin flag
- `monthly_salary` (NUMERIC): Used for EPF calculations
- `epf_employee_contribution_percentage` (NUMERIC): Default 11%
- `epf_employer_contribution_percentage` (NUMERIC): Default 13%

**RLS Policies:**
- Users can view/edit own profile
- Admins can view all profiles

---

#### `accounts`
Financial accounts tracking.

**Key Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK): Owner
- `name` (TEXT): Account name
- `account_type` (TEXT): ASB, EPF, Tabung Haji, etc.
- `current_balance` (NUMERIC): Current value
- `units_held` (NUMERIC): For unit-based accounts
- `monthly_contribution` (NUMERIC): Regular contribution amount
- `dividend_rate` (NUMERIC): Interest/dividend rate

**Indexes:**
- `idx_accounts_user_id` on `user_id`
- `idx_accounts_type` on `account_type`

**RLS Policies:**
- Users can only access own accounts
- Admins can view all

---

#### `goals`
Financial goals and targets.

**Key Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK): Owner
- `name` (TEXT): Goal name
- `target_amount` (NUMERIC): Target savings
- `current_amount` (NUMERIC): Calculated progress
- `manual_amount` (NUMERIC): Manual tracking amount
- `target_date` (DATE): Target completion date
- `is_manual_goal` (BOOLEAN): Manual vs account-linked
- `is_achieved` (BOOLEAN): Completion status

**RLS Policies:**
- Users can only access own goals
- Admins can view all

---

#### `account_goals`
Junction table linking accounts to goals.

**Key Columns:**
- `id` (UUID, PK)
- `account_id` (UUID, FK): Linked account
- `goal_id` (UUID, FK): Linked goal
- `allocation_percentage` (NUMERIC): Percentage of account allocated to goal

**RLS Policies:**
- Users can only manage own allocations

---

### Admin Tables

#### `admin_authorized_emails`
Email-based admin authorization.

**Columns:**
- `id` (UUID, PK)
- `email` (TEXT, UNIQUE): Authorized email
- `is_active` (BOOLEAN): Active status
- `added_by` (UUID, FK): Admin who added

**RLS Policies:**
- Only admins can view/modify

---

#### `admin_config_account_types`
Configurable account types.

#### `admin_config_institutions`
Configurable financial institutions.

#### `admin_config_goal_categories`
Configurable goal categories.

#### `admin_audit_log`
Complete audit trail of admin actions.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK): Admin who performed action
- `action_type` (TEXT): CREATE, UPDATE, DELETE
- `table_name` (TEXT): Affected table
- `record_id` (TEXT): Record ID
- `old_value` (JSONB): Previous state
- `new_value` (JSONB): New state
- `action_timestamp` (TIMESTAMPTZ): When action occurred

**RLS Policies:**
- Only admins can view logs
- No one can delete logs (append-only)

---

## Error Handling

### Database Errors

```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
} catch (err: unknown) {
  if (err instanceof Error) {
    console.error('Database error:', err.message);
  }
}
```

### Common Error Codes

- `23505`: Unique constraint violation
- `23503`: Foreign key violation
- `42501`: Insufficient privilege (RLS)
- `PGRST301`: JWT expired

---

## Security Considerations

1. **Always use RLS policies** - Never expose tables without policies
2. **SECURITY DEFINER functions** - Use `SET search_path` to prevent injection
3. **Type validation** - Validate all inputs before database operations
4. **Audit logging** - Log all admin actions
5. **Email verification** - Verify admin email exists in auth.users

---

## Related Documentation

- [MIGRATION_GUIDELINES.md](../MIGRATION_GUIDELINES.md) - Database migration best practices
- [SECURITY.md](../SECURITY.md) - Security policies and practices
- [Database Types](../src/types/database.ts) - TypeScript type definitions

---

*Last updated: November 26, 2025*
