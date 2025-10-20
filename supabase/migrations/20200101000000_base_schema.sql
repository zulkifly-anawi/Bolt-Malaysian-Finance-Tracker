--
-- PostgreSQL database dump
--

-- \restrict 97bDg3mCde6rVlQgF48eHbzqk8hiehTz0hKAjdd0m9NHjLcGTqaYFR8wXldbFA7

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA IF NOT EXISTS "graphql_public";


ALTER SCHEMA "graphql_public" OWNER TO "supabase_admin";

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
RETURN EXISTS (
SELECT 1 FROM profiles
WHERE id = auth.uid() AND is_admin = true
);
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

--
-- Name: sync_asb_units_held(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."sync_asb_units_held"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
IF NEW.asb_unit_price IS NOT NULL AND NEW.asb_unit_price > 0 THEN
NEW.asb_units_held := NEW.current_balance / NEW.asb_unit_price;
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_asb_units_held"() OWNER TO "postgres";

--
-- Name: FUNCTION "sync_asb_units_held"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."sync_asb_units_held"() IS 'Automatically synchronizes units_held with current_balance for ASB accounts. ASB units are always valued at RM1.00 per unit.';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: account_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."account_goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "goal_id" "uuid" NOT NULL,
    "allocation_percentage" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "account_goals_allocation_percentage_check" CHECK ((("allocation_percentage" >= (0)::numeric) AND ("allocation_percentage" <= (100)::numeric)))
);


ALTER TABLE "public"."account_goals" OWNER TO "postgres";

--
-- Name: account_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."account_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."account_types" OWNER TO "postgres";

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "account_type_id" "uuid",
    "institution_name" "text",
    "current_balance" numeric(15,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "units_held" numeric DEFAULT 0,
    "monthly_contribution" numeric DEFAULT 0,
    "dividend_rate" numeric DEFAULT 0,
    "account_type" "text",
    "institution" "text",
    "employee_contribution_percentage" numeric,
    "employer_contribution_percentage" numeric,
    "use_total_contribution" boolean DEFAULT true,
    "is_manual_contribution" boolean DEFAULT false,
    "pilgrimage_goal_type" "text",
    "epf_savings_type" "text",
    "epf_dividend_rate_method" "text" DEFAULT 'latest'::"text",
    CONSTRAINT "accounts_current_balance_check" CHECK (("current_balance" >= (0)::numeric)),
    CONSTRAINT "accounts_employee_contribution_check" CHECK ((("employee_contribution_percentage" IS NULL) OR (("employee_contribution_percentage" >= (0)::numeric) AND ("employee_contribution_percentage" <= (20)::numeric)))),
    CONSTRAINT "accounts_employer_contribution_check" CHECK ((("employer_contribution_percentage" IS NULL) OR (("employer_contribution_percentage" >= (0)::numeric) AND ("employer_contribution_percentage" <= (20)::numeric)))),
    CONSTRAINT "accounts_epf_rate_method_check" CHECK ((("epf_dividend_rate_method" IS NULL) OR ("epf_dividend_rate_method" = ANY (ARRAY['latest'::"text", '3-year-average'::"text", '5-year-average'::"text", 'historical-average'::"text"])))),
    CONSTRAINT "accounts_epf_savings_type_check" CHECK ((("epf_savings_type" IS NULL) OR ("epf_savings_type" = ANY (ARRAY['Conventional'::"text", 'Syariah'::"text"])))),
    CONSTRAINT "pilgrimage_goal_type_check" CHECK ((("pilgrimage_goal_type" IS NULL) OR ("pilgrimage_goal_type" = ANY (ARRAY['Hajj'::"text", 'Umrah'::"text"]))))
);


ALTER TABLE "public"."accounts" OWNER TO "postgres";

--
-- Name: COLUMN "accounts"."pilgrimage_goal_type"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."accounts"."pilgrimage_goal_type" IS 'Pilgrimage goal type for Tabung Haji accounts: Hajj or Umrah';


--
-- Name: achievement_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."achievement_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "achievement_type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "criteria" "jsonb" NOT NULL,
    "points" integer DEFAULT 10,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."achievement_definitions" OWNER TO "postgres";

--
-- Name: admin_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_user_id" "uuid" NOT NULL,
    "admin_email" "text" NOT NULL,
    "action_type" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "text",
    "old_value" "jsonb",
    "new_value" "jsonb",
    "ip_address" "text",
    "user_agent" "text",
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";

--
-- Name: admin_audit_log_with_retention; Type: VIEW; Schema: public; Owner: postgres
--

CREATE OR REPLACE VIEW "public"."admin_audit_log_with_retention" WITH ("security_invoker"='on') AS
 SELECT "id",
    "admin_user_id",
    "admin_email",
    "action_type",
    "table_name",
    "record_id",
    "old_value",
    "new_value",
    "ip_address",
    "user_agent",
    "timestamp",
    ("timestamp" + '7 years'::interval) AS "retention_date",
        CASE
            WHEN ((("timestamp" + '7 years'::interval) - '30 days'::interval) < "now"()) THEN true
            ELSE false
        END AS "approaching_retention"
   FROM "public"."admin_audit_log";


ALTER VIEW "public"."admin_audit_log_with_retention" OWNER TO "postgres";

--
-- Name: VIEW "admin_audit_log_with_retention"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW "public"."admin_audit_log_with_retention" IS 'Audit log view with retention tracking. Uses SECURITY INVOKER to prevent privilege escalation. Only accessible to admin users via RLS policies on the base table.';


--
-- Name: admin_config_account_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."admin_config_account_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_config_account_types" OWNER TO "postgres";

--
-- Name: admin_config_goal_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."admin_config_goal_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_config_goal_categories" OWNER TO "postgres";

--
-- Name: admin_config_institutions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."admin_config_institutions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "institution_type" "text",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_config_institutions" OWNER TO "postgres";

--
-- Name: admin_config_system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."admin_config_system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "text" NOT NULL,
    "value_type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_config_system_settings" OWNER TO "postgres";

--
-- Name: admin_config_validation_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."admin_config_validation_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rule_name" "text" NOT NULL,
    "field_name" "text" NOT NULL,
    "rule_type" "text" NOT NULL,
    "rule_value" "jsonb" NOT NULL,
    "error_message" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_config_validation_rules" OWNER TO "postgres";

--
-- Name: balance_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."balance_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "entry_date" "date" NOT NULL,
    "balance" numeric(15,2) NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "balance_entries_balance_check" CHECK (("balance" >= (0)::numeric))
);


ALTER TABLE "public"."balance_entries" OWNER TO "postgres";

--
-- Name: dividend_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."dividend_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_type" "text" NOT NULL,
    "year" integer NOT NULL,
    "dividend_rate" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "dividend_component" numeric,
    "bonus_component" numeric,
    "notes" "text",
    "is_historical" boolean DEFAULT true,
    "updated_by" "uuid",
    "is_projection" boolean DEFAULT false
);


ALTER TABLE "public"."dividend_history" OWNER TO "postgres";

--
-- Name: family_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."family_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "primary_user_id" "uuid" NOT NULL,
    "member_user_id" "uuid",
    "member_email" "text",
    "member_name" "text" NOT NULL,
    "relationship" "text",
    "permission_level" "text" DEFAULT 'view'::"text",
    "is_active" boolean DEFAULT true,
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "joined_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."family_members" OWNER TO "postgres";

--
-- Name: goal_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."goal_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."goal_categories" OWNER TO "postgres";

--
-- Name: goal_progress_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."goal_progress_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "goal_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "entry_type" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "previous_manual_amount" numeric DEFAULT 0 NOT NULL,
    "new_manual_amount" numeric NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "goal_progress_entries_entry_type_check" CHECK (("entry_type" = ANY (ARRAY['add'::"text", 'subtract'::"text", 'set'::"text"])))
);


ALTER TABLE "public"."goal_progress_entries" OWNER TO "postgres";

--
-- Name: TABLE "goal_progress_entries"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."goal_progress_entries" IS 'Audit trail of all manual progress updates to goals. Entries are never deleted.';


--
-- Name: goal_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."goal_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "default_amount" numeric NOT NULL,
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "updated_by" "uuid"
);


ALTER TABLE "public"."goal_templates" OWNER TO "postgres";

--
-- Name: goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "target_amount" numeric(15,2) NOT NULL,
    "target_date" "date" NOT NULL,
    "category_id" "uuid",
    "photo_url" "text",
    "is_achieved" boolean DEFAULT false,
    "achieved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "category" "text",
    "description" "text",
    "priority" "text" DEFAULT 'medium'::"text",
    "current_amount" numeric DEFAULT 0,
    "manual_amount" numeric DEFAULT 0,
    "last_progress_update" timestamp with time zone,
    CONSTRAINT "goals_target_amount_check" CHECK (("target_amount" > (0)::numeric))
);


ALTER TABLE "public"."goals" OWNER TO "postgres";

--
-- Name: COLUMN "goals"."manual_amount"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."goals"."manual_amount" IS 'Manual contributions added by user, works additively with account allocations';


--
-- Name: monthly_summaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."monthly_summaries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "year" integer NOT NULL,
    "month" integer NOT NULL,
    "net_worth_start" numeric DEFAULT 0,
    "net_worth_end" numeric DEFAULT 0,
    "net_worth_change" numeric DEFAULT 0,
    "best_performing_account" "text",
    "total_contributions" numeric DEFAULT 0,
    "total_dividends" numeric DEFAULT 0,
    "goals_on_track" integer DEFAULT 0,
    "goals_behind" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."monthly_summaries" OWNER TO "postgres";

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "action_url" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "age" integer,
    "monthly_salary" numeric DEFAULT 0,
    "notifications_enabled" boolean DEFAULT true,
    "email_reminders_enabled" boolean DEFAULT true,
    "last_balance_update" timestamp with time zone,
    "onboarding_completed" boolean DEFAULT false,
    "onboarding_completed_at" timestamp with time zone,
    "help_tips_dismissed" "jsonb" DEFAULT '[]'::"jsonb",
    "epf_employee_contribution_percentage" numeric DEFAULT 11,
    "epf_employer_contribution_percentage" numeric DEFAULT 12,
    "use_custom_epf_contribution" boolean DEFAULT false,
    "include_employer_contribution" boolean DEFAULT true,
    "is_admin" boolean DEFAULT false,
    CONSTRAINT "profiles_employee_contribution_check" CHECK ((("epf_employee_contribution_percentage" >= (0)::numeric) AND ("epf_employee_contribution_percentage" <= (20)::numeric))),
    CONSTRAINT "profiles_employer_contribution_check" CHECK ((("epf_employer_contribution_percentage" >= (0)::numeric) AND ("epf_employer_contribution_percentage" <= (20)::numeric)))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";

--
-- Name: reminders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."reminders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reminder_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text",
    "frequency" "text" DEFAULT 'monthly'::"text",
    "next_reminder_date" timestamp with time zone NOT NULL,
    "last_sent_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reminders" OWNER TO "postgres";

--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_type" "text" NOT NULL,
    "achievement_name" "text" NOT NULL,
    "achievement_description" "text",
    "icon" "text",
    "earned_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_achievements" OWNER TO "postgres";

--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."user_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "feedback_type" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "message" "text" NOT NULL,
    "rating" integer,
    "email" "text",
    "status" "text" DEFAULT 'new'::"text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_feedback_feedback_type_check" CHECK (("feedback_type" = ANY (ARRAY['bug'::"text", 'feature_request'::"text", 'general'::"text", 'other'::"text"]))),
    CONSTRAINT "user_feedback_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "user_feedback_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'reviewed'::"text", 'in_progress'::"text", 'resolved'::"text"])))
);


ALTER TABLE "public"."user_feedback" OWNER TO "postgres";

--
-- Name: account_goals account_goals_account_id_goal_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."account_goals"
    ADD CONSTRAINT "account_goals_account_id_goal_id_key" UNIQUE ("account_id", "goal_id");


--
-- Name: account_goals account_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."account_goals"
    ADD CONSTRAINT "account_goals_pkey" PRIMARY KEY ("id");


--
-- Name: account_types account_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."account_types"
    ADD CONSTRAINT "account_types_name_key" UNIQUE ("name");


--
-- Name: account_types account_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."account_types"
    ADD CONSTRAINT "account_types_pkey" PRIMARY KEY ("id");


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");


--
-- Name: achievement_definitions achievement_definitions_achievement_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."achievement_definitions"
    ADD CONSTRAINT "achievement_definitions_achievement_type_key" UNIQUE ("achievement_type");


--
-- Name: achievement_definitions achievement_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."achievement_definitions"
    ADD CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id");


--
-- Name: admin_audit_log admin_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");


--
-- Name: admin_config_account_types admin_config_account_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_account_types"
    ADD CONSTRAINT "admin_config_account_types_name_key" UNIQUE ("name");


--
-- Name: admin_config_account_types admin_config_account_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_account_types"
    ADD CONSTRAINT "admin_config_account_types_pkey" PRIMARY KEY ("id");


--
-- Name: admin_config_goal_categories admin_config_goal_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_goal_categories"
    ADD CONSTRAINT "admin_config_goal_categories_name_key" UNIQUE ("name");


--
-- Name: admin_config_goal_categories admin_config_goal_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_goal_categories"
    ADD CONSTRAINT "admin_config_goal_categories_pkey" PRIMARY KEY ("id");


--
-- Name: admin_config_institutions admin_config_institutions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_institutions"
    ADD CONSTRAINT "admin_config_institutions_name_key" UNIQUE ("name");


--
-- Name: admin_config_institutions admin_config_institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_institutions"
    ADD CONSTRAINT "admin_config_institutions_pkey" PRIMARY KEY ("id");


--
-- Name: admin_config_system_settings admin_config_system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_system_settings"
    ADD CONSTRAINT "admin_config_system_settings_pkey" PRIMARY KEY ("id");


--
-- Name: admin_config_system_settings admin_config_system_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_system_settings"
    ADD CONSTRAINT "admin_config_system_settings_setting_key_key" UNIQUE ("setting_key");


--
-- Name: admin_config_validation_rules admin_config_validation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_validation_rules"
    ADD CONSTRAINT "admin_config_validation_rules_pkey" PRIMARY KEY ("id");


--
-- Name: admin_config_validation_rules admin_config_validation_rules_rule_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_validation_rules"
    ADD CONSTRAINT "admin_config_validation_rules_rule_name_key" UNIQUE ("rule_name");


--
-- Name: balance_entries balance_entries_account_id_entry_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."balance_entries"
    ADD CONSTRAINT "balance_entries_account_id_entry_date_key" UNIQUE ("account_id", "entry_date");


--
-- Name: balance_entries balance_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."balance_entries"
    ADD CONSTRAINT "balance_entries_pkey" PRIMARY KEY ("id");


--
-- Name: dividend_history dividend_history_account_type_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."dividend_history"
    ADD CONSTRAINT "dividend_history_account_type_year_key" UNIQUE ("account_type", "year");


--
-- Name: dividend_history dividend_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."dividend_history"
    ADD CONSTRAINT "dividend_history_pkey" PRIMARY KEY ("id");


--
-- Name: family_members family_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."family_members"
    ADD CONSTRAINT "family_members_pkey" PRIMARY KEY ("id");


--
-- Name: goal_categories goal_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goal_categories"
    ADD CONSTRAINT "goal_categories_name_key" UNIQUE ("name");


--
-- Name: goal_categories goal_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goal_categories"
    ADD CONSTRAINT "goal_categories_pkey" PRIMARY KEY ("id");


--
-- Name: goal_progress_entries goal_progress_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goal_progress_entries"
    ADD CONSTRAINT "goal_progress_entries_pkey" PRIMARY KEY ("id");


--
-- Name: goal_templates goal_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goal_templates"
    ADD CONSTRAINT "goal_templates_pkey" PRIMARY KEY ("id");


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_pkey" PRIMARY KEY ("id");


--
-- Name: monthly_summaries monthly_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."monthly_summaries"
    ADD CONSTRAINT "monthly_summaries_pkey" PRIMARY KEY ("id");


--
-- Name: monthly_summaries monthly_summaries_user_id_year_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."monthly_summaries"
    ADD CONSTRAINT "monthly_summaries_user_id_year_month_key" UNIQUE ("user_id", "year", "month");


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "reminders_pkey" PRIMARY KEY ("id");


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_feedback"
    ADD CONSTRAINT "user_feedback_pkey" PRIMARY KEY ("id");


--
-- Name: idx_account_goals_account_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_account_goals_account_id" ON "public"."account_goals" USING "btree" ("account_id");


--
-- Name: idx_account_goals_goal_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_account_goals_goal_id" ON "public"."account_goals" USING "btree" ("goal_id");


--
-- Name: idx_accounts_account_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_accounts_account_type_id" ON "public"."accounts" USING "btree" ("account_type_id");


--
-- Name: idx_accounts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_accounts_user_id" ON "public"."accounts" USING "btree" ("user_id");


--
-- Name: idx_admin_audit_log_admin_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_admin_audit_log_admin_user_id" ON "public"."admin_audit_log" USING "btree" ("admin_user_id");


--
-- Name: idx_admin_audit_log_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_admin_audit_log_timestamp" ON "public"."admin_audit_log" USING "btree" ("timestamp");


--
-- Name: idx_admin_config_account_types_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_admin_config_account_types_active" ON "public"."admin_config_account_types" USING "btree" ("is_active", "sort_order");


--
-- Name: idx_admin_config_goal_categories_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_admin_config_goal_categories_active" ON "public"."admin_config_goal_categories" USING "btree" ("is_active", "sort_order");


--
-- Name: idx_admin_config_institutions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_admin_config_institutions_active" ON "public"."admin_config_institutions" USING "btree" ("is_active", "sort_order");


--
-- Name: idx_balance_entries_account_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_balance_entries_account_date" ON "public"."balance_entries" USING "btree" ("account_id", "entry_date" DESC);


--
-- Name: idx_goal_progress_entries_goal_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_goal_progress_entries_goal_created" ON "public"."goal_progress_entries" USING "btree" ("goal_id", "created_at" DESC);


--
-- Name: idx_goal_progress_entries_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_goal_progress_entries_user_id" ON "public"."goal_progress_entries" USING "btree" ("user_id");


--
-- Name: idx_goals_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_goals_category_id" ON "public"."goals" USING "btree" ("category_id");


--
-- Name: idx_goals_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_goals_user_id" ON "public"."goals" USING "btree" ("user_id");


--
-- Name: idx_monthly_summaries_user_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_monthly_summaries_user_period" ON "public"."monthly_summaries" USING "btree" ("user_id", "year", "month");


--
-- Name: idx_notifications_user_id_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_notifications_user_id_unread" ON "public"."notifications" USING "btree" ("user_id", "is_read");


--
-- Name: idx_reminders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_reminders_user_id" ON "public"."reminders" USING "btree" ("user_id");


--
-- Name: idx_user_achievements_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_achievements_user_id" ON "public"."user_achievements" USING "btree" ("user_id");


--
-- Name: idx_user_feedback_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_user_feedback_user_id" ON "public"."user_feedback" USING "btree" ("user_id");


--
-- Name: accounts trigger_sync_asb_units_held; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trigger_sync_asb_units_held" BEFORE INSERT OR UPDATE ON "public"."accounts" FOR EACH ROW EXECUTE FUNCTION "public"."sync_asb_units_held"();


--
-- Name: accounts update_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_accounts_updated_at" BEFORE UPDATE ON "public"."accounts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: goals update_goals_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_goals_updated_at" BEFORE UPDATE ON "public"."goals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Name: account_goals account_goals_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."account_goals"
    ADD CONSTRAINT "account_goals_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;


--
-- Name: account_goals account_goals_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."account_goals"
    ADD CONSTRAINT "account_goals_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE CASCADE;


--
-- Name: accounts accounts_account_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_account_type_id_fkey" FOREIGN KEY ("account_type_id") REFERENCES "public"."account_types"("id") ON DELETE RESTRICT;


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: admin_audit_log admin_audit_log_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_account_types admin_config_account_types_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_account_types"
    ADD CONSTRAINT "admin_config_account_types_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_account_types admin_config_account_types_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_account_types"
    ADD CONSTRAINT "admin_config_account_types_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_goal_categories admin_config_goal_categories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_goal_categories"
    ADD CONSTRAINT "admin_config_goal_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_goal_categories admin_config_goal_categories_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_goal_categories"
    ADD CONSTRAINT "admin_config_goal_categories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_institutions admin_config_institutions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_institutions"
    ADD CONSTRAINT "admin_config_institutions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_institutions admin_config_institutions_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_institutions"
    ADD CONSTRAINT "admin_config_institutions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_system_settings admin_config_system_settings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_system_settings"
    ADD CONSTRAINT "admin_config_system_settings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_system_settings admin_config_system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_system_settings"
    ADD CONSTRAINT "admin_config_system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_validation_rules admin_config_validation_rules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_validation_rules"
    ADD CONSTRAINT "admin_config_validation_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");


--
-- Name: admin_config_validation_rules admin_config_validation_rules_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."admin_config_validation_rules"
    ADD CONSTRAINT "admin_config_validation_rules_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");


--
-- Name: balance_entries balance_entries_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."balance_entries"
    ADD CONSTRAINT "balance_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE;


--
-- Name: dividend_history dividend_history_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."dividend_history"
    ADD CONSTRAINT "dividend_history_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");


--
-- Name: family_members family_members_member_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."family_members"
    ADD CONSTRAINT "family_members_member_user_id_fkey" FOREIGN KEY ("member_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: family_members family_members_primary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."family_members"
    ADD CONSTRAINT "family_members_primary_user_id_fkey" FOREIGN KEY ("primary_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: goal_progress_entries goal_progress_entries_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goal_progress_entries"
    ADD CONSTRAINT "goal_progress_entries_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE CASCADE;


--
-- Name: goal_progress_entries goal_progress_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goal_progress_entries"
    ADD CONSTRAINT "goal_progress_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: goal_templates goal_templates_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goal_templates"
    ADD CONSTRAINT "goal_templates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");


--
-- Name: goals goals_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."goal_categories"("id") ON DELETE SET NULL;


--
-- Name: goals goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: monthly_summaries monthly_summaries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."monthly_summaries"
    ADD CONSTRAINT "monthly_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: reminders reminders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: user_feedback user_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_feedback"
    ADD CONSTRAINT "user_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;


--
-- Name: account_types Anyone authenticated can view account types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone authenticated can view account types" ON "public"."account_types" FOR SELECT TO "authenticated" USING (true);


--
-- Name: goal_categories Anyone authenticated can view goal categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone authenticated can view goal categories" ON "public"."goal_categories" FOR SELECT TO "authenticated" USING (true);


--
-- Name: admin_config_account_types Anyone can read account types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read account types" ON "public"."admin_config_account_types" FOR SELECT TO "authenticated" USING (true);


--
-- Name: achievement_definitions Anyone can read achievement definitions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read achievement definitions" ON "public"."achievement_definitions" FOR SELECT TO "authenticated" USING (true);


--
-- Name: dividend_history Anyone can read dividend history; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read dividend history" ON "public"."dividend_history" FOR SELECT TO "authenticated" USING (true);


--
-- Name: admin_config_goal_categories Anyone can read goal categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read goal categories" ON "public"."admin_config_goal_categories" FOR SELECT TO "authenticated" USING (true);


--
-- Name: goal_templates Anyone can read goal templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read goal templates" ON "public"."goal_templates" FOR SELECT TO "authenticated" USING (true);


--
-- Name: admin_config_institutions Anyone can read institutions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read institutions" ON "public"."admin_config_institutions" FOR SELECT TO "authenticated" USING (true);


--
-- Name: admin_config_system_settings Anyone can read system settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read system settings" ON "public"."admin_config_system_settings" FOR SELECT TO "authenticated" USING (true);


--
-- Name: admin_config_validation_rules Anyone can read validation rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read validation rules" ON "public"."admin_config_validation_rules" FOR SELECT TO "authenticated" USING (true);


--
-- Name: user_feedback Anyone can submit feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can submit feedback" ON "public"."user_feedback" FOR INSERT WITH CHECK (true);


--
-- Name: admin_config_account_types Only admins can delete account types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can delete account types" ON "public"."admin_config_account_types" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: admin_config_goal_categories Only admins can delete goal categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can delete goal categories" ON "public"."admin_config_goal_categories" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: admin_config_institutions Only admins can delete institutions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can delete institutions" ON "public"."admin_config_institutions" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: admin_config_system_settings Only admins can delete system settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can delete system settings" ON "public"."admin_config_system_settings" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: admin_config_validation_rules Only admins can delete validation rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can delete validation rules" ON "public"."admin_config_validation_rules" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: admin_config_account_types Only admins can insert account types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can insert account types" ON "public"."admin_config_account_types" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: admin_audit_log Only admins can insert audit log; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can insert audit log" ON "public"."admin_audit_log" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: admin_config_goal_categories Only admins can insert goal categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can insert goal categories" ON "public"."admin_config_goal_categories" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: admin_config_institutions Only admins can insert institutions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can insert institutions" ON "public"."admin_config_institutions" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: admin_config_system_settings Only admins can insert system settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can insert system settings" ON "public"."admin_config_system_settings" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: admin_config_validation_rules Only admins can insert validation rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can insert validation rules" ON "public"."admin_config_validation_rules" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: admin_audit_log Only admins can read audit log; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can read audit log" ON "public"."admin_audit_log" FOR SELECT TO "authenticated" USING ("public"."is_admin"());


--
-- Name: admin_config_account_types Only admins can update account types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can update account types" ON "public"."admin_config_account_types" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: admin_config_goal_categories Only admins can update goal categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can update goal categories" ON "public"."admin_config_goal_categories" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: admin_config_institutions Only admins can update institutions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can update institutions" ON "public"."admin_config_institutions" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: admin_config_system_settings Only admins can update system settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can update system settings" ON "public"."admin_config_system_settings" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: admin_config_validation_rules Only admins can update validation rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can update validation rules" ON "public"."admin_config_validation_rules" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: family_members Primary user can add family members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Primary user can add family members" ON "public"."family_members" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "primary_user_id"));


--
-- Name: family_members Primary user can delete family members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Primary user can delete family members" ON "public"."family_members" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "primary_user_id"));


--
-- Name: family_members Primary user can update family members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Primary user can update family members" ON "public"."family_members" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "primary_user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "primary_user_id"));


--
-- Name: account_goals Users can delete own account goals; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own account goals" ON "public"."account_goals" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "account_goals"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: accounts Users can delete own accounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own accounts" ON "public"."accounts" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: balance_entries Users can delete own balance entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own balance entries" ON "public"."balance_entries" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "balance_entries"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: goals Users can delete own goals; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own goals" ON "public"."goals" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: reminders Users can delete own reminders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own reminders" ON "public"."reminders" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: account_goals Users can insert own account goals; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own account goals" ON "public"."account_goals" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "account_goals"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: accounts Users can insert own accounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own accounts" ON "public"."accounts" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: user_achievements Users can insert own achievements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own achievements" ON "public"."user_achievements" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: balance_entries Users can insert own balance entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own balance entries" ON "public"."balance_entries" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "balance_entries"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: goals Users can insert own goals; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own goals" ON "public"."goals" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: notifications Users can insert own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own notifications" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));


--
-- Name: goal_progress_entries Users can insert own progress entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own progress entries" ON "public"."goal_progress_entries" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."goals"
  WHERE (("goals"."id" = "goal_progress_entries"."goal_id") AND ("goals"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));


--
-- Name: reminders Users can insert own reminders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own reminders" ON "public"."reminders" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: monthly_summaries Users can insert own summaries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own summaries" ON "public"."monthly_summaries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: user_feedback Users can read own feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read own feedback" ON "public"."user_feedback" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: account_goals Users can update own account goals; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own account goals" ON "public"."account_goals" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "account_goals"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "account_goals"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: accounts Users can update own accounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own accounts" ON "public"."accounts" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: balance_entries Users can update own balance entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own balance entries" ON "public"."balance_entries" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "balance_entries"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "balance_entries"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: goals Users can update own goals; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own goals" ON "public"."goals" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));


--
-- Name: reminders Users can update own reminders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own reminders" ON "public"."reminders" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: account_goals Users can view own account goals; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own account goals" ON "public"."account_goals" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "account_goals"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: accounts Users can view own accounts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own accounts" ON "public"."accounts" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: user_achievements Users can view own achievements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own achievements" ON "public"."user_achievements" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: balance_entries Users can view own balance entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own balance entries" ON "public"."balance_entries" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."accounts"
  WHERE (("accounts"."id" = "balance_entries"."account_id") AND ("accounts"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: family_members Users can view own family members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own family members" ON "public"."family_members" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "primary_user_id") OR (( SELECT "auth"."uid"() AS "uid") = "member_user_id")));


--
-- Name: goals Users can view own goals; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own goals" ON "public"."goals" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));


--
-- Name: goal_progress_entries Users can view own progress entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own progress entries" ON "public"."goal_progress_entries" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."goals"
  WHERE (("goals"."id" = "goal_progress_entries"."goal_id") AND ("goals"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));


--
-- Name: reminders Users can view own reminders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own reminders" ON "public"."reminders" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: monthly_summaries Users can view own summaries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own summaries" ON "public"."monthly_summaries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));


--
-- Name: account_goals; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."account_goals" ENABLE ROW LEVEL SECURITY;

--
-- Name: account_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."account_types" ENABLE ROW LEVEL SECURITY;

--
-- Name: accounts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;

--
-- Name: achievement_definitions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."achievement_definitions" ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_audit_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_config_account_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."admin_config_account_types" ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_config_goal_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."admin_config_goal_categories" ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_config_institutions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."admin_config_institutions" ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_config_system_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."admin_config_system_settings" ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_config_validation_rules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."admin_config_validation_rules" ENABLE ROW LEVEL SECURITY;

--
-- Name: balance_entries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."balance_entries" ENABLE ROW LEVEL SECURITY;

--
-- Name: dividend_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."dividend_history" ENABLE ROW LEVEL SECURITY;

--
-- Name: family_members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."family_members" ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."goal_categories" ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_progress_entries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."goal_progress_entries" ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."goal_templates" ENABLE ROW LEVEL SECURITY;

--
-- Name: goals; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."goals" ENABLE ROW LEVEL SECURITY;

--
-- Name: monthly_summaries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."monthly_summaries" ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: reminders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."reminders" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_feedback; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_feedback" ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "is_admin"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";


--
-- Name: FUNCTION "sync_asb_units_held"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."sync_asb_units_held"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_asb_units_held"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_asb_units_held"() TO "service_role";


--
-- Name: FUNCTION "update_updated_at_column"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


--
-- Name: TABLE "account_goals"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."account_goals" TO "anon";
GRANT ALL ON TABLE "public"."account_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."account_goals" TO "service_role";


--
-- Name: TABLE "account_types"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."account_types" TO "anon";
GRANT ALL ON TABLE "public"."account_types" TO "authenticated";
GRANT ALL ON TABLE "public"."account_types" TO "service_role";


--
-- Name: TABLE "accounts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."accounts" TO "anon";
GRANT ALL ON TABLE "public"."accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts" TO "service_role";


--
-- Name: TABLE "achievement_definitions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."achievement_definitions" TO "anon";
GRANT ALL ON TABLE "public"."achievement_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."achievement_definitions" TO "service_role";


--
-- Name: TABLE "admin_audit_log"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";


--
-- Name: TABLE "admin_audit_log_with_retention"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."admin_audit_log_with_retention" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log_with_retention" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log_with_retention" TO "service_role";


--
-- Name: TABLE "admin_config_account_types"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."admin_config_account_types" TO "anon";
GRANT ALL ON TABLE "public"."admin_config_account_types" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_config_account_types" TO "service_role";


--
-- Name: TABLE "admin_config_goal_categories"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."admin_config_goal_categories" TO "anon";
GRANT ALL ON TABLE "public"."admin_config_goal_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_config_goal_categories" TO "service_role";


--
-- Name: TABLE "admin_config_institutions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."admin_config_institutions" TO "anon";
GRANT ALL ON TABLE "public"."admin_config_institutions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_config_institutions" TO "service_role";


--
-- Name: TABLE "admin_config_system_settings"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."admin_config_system_settings" TO "anon";
GRANT ALL ON TABLE "public"."admin_config_system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_config_system_settings" TO "service_role";


--
-- Name: TABLE "admin_config_validation_rules"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."admin_config_validation_rules" TO "anon";
GRANT ALL ON TABLE "public"."admin_config_validation_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_config_validation_rules" TO "service_role";


--
-- Name: TABLE "balance_entries"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."balance_entries" TO "anon";
GRANT ALL ON TABLE "public"."balance_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."balance_entries" TO "service_role";


--
-- Name: TABLE "dividend_history"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."dividend_history" TO "anon";
GRANT ALL ON TABLE "public"."dividend_history" TO "authenticated";
GRANT ALL ON TABLE "public"."dividend_history" TO "service_role";


--
-- Name: TABLE "family_members"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."family_members" TO "anon";
GRANT ALL ON TABLE "public"."family_members" TO "authenticated";
GRANT ALL ON TABLE "public"."family_members" TO "service_role";


--
-- Name: TABLE "goal_categories"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."goal_categories" TO "anon";
GRANT ALL ON TABLE "public"."goal_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."goal_categories" TO "service_role";


--
-- Name: TABLE "goal_progress_entries"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."goal_progress_entries" TO "anon";
GRANT ALL ON TABLE "public"."goal_progress_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."goal_progress_entries" TO "service_role";


--
-- Name: TABLE "goal_templates"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."goal_templates" TO "anon";
GRANT ALL ON TABLE "public"."goal_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."goal_templates" TO "service_role";


--
-- Name: TABLE "goals"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."goals" TO "anon";
GRANT ALL ON TABLE "public"."goals" TO "authenticated";
GRANT ALL ON TABLE "public"."goals" TO "service_role";


--
-- Name: TABLE "monthly_summaries"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."monthly_summaries" TO "anon";
GRANT ALL ON TABLE "public"."monthly_summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_summaries" TO "service_role";


--
-- Name: TABLE "notifications"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";


--
-- Name: TABLE "profiles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";


--
-- Name: TABLE "reminders"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."reminders" TO "anon";
GRANT ALL ON TABLE "public"."reminders" TO "authenticated";
GRANT ALL ON TABLE "public"."reminders" TO "service_role";


--
-- Name: TABLE "user_achievements"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";


--
-- Name: TABLE "user_feedback"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_feedback" TO "anon";
GRANT ALL ON TABLE "public"."user_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."user_feedback" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON SEQUENCES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON SEQUENCES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON SEQUENCES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON FUNCTIONS TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON FUNCTIONS TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON FUNCTIONS TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON TABLES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON TABLES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON TABLES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "graphql_public" GRANT ALL ON TABLES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- PostgreSQL database dump complete
--

-- \unrestrict 97bDg3mCde6rVlQgF48eHbzqk8hiehTz0hKAjdd0m9NHjLcGTqaYFR8wXldbFA7

RESET ALL;
