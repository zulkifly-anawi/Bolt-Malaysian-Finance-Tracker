drop trigger if exists "enforce_admin_email_check" on "public"."profiles";

revoke delete on table "public"."account_goals" from "anon";

revoke insert on table "public"."account_goals" from "anon";

revoke references on table "public"."account_goals" from "anon";

revoke select on table "public"."account_goals" from "anon";

revoke trigger on table "public"."account_goals" from "anon";

revoke truncate on table "public"."account_goals" from "anon";

revoke update on table "public"."account_goals" from "anon";

revoke delete on table "public"."account_goals" from "authenticated";

revoke insert on table "public"."account_goals" from "authenticated";

revoke references on table "public"."account_goals" from "authenticated";

revoke select on table "public"."account_goals" from "authenticated";

revoke trigger on table "public"."account_goals" from "authenticated";

revoke truncate on table "public"."account_goals" from "authenticated";

revoke update on table "public"."account_goals" from "authenticated";

revoke delete on table "public"."account_goals" from "service_role";

revoke insert on table "public"."account_goals" from "service_role";

revoke references on table "public"."account_goals" from "service_role";

revoke select on table "public"."account_goals" from "service_role";

revoke trigger on table "public"."account_goals" from "service_role";

revoke truncate on table "public"."account_goals" from "service_role";

revoke update on table "public"."account_goals" from "service_role";

revoke delete on table "public"."account_types" from "anon";

revoke insert on table "public"."account_types" from "anon";

revoke references on table "public"."account_types" from "anon";

revoke select on table "public"."account_types" from "anon";

revoke trigger on table "public"."account_types" from "anon";

revoke truncate on table "public"."account_types" from "anon";

revoke update on table "public"."account_types" from "anon";

revoke delete on table "public"."account_types" from "authenticated";

revoke insert on table "public"."account_types" from "authenticated";

revoke references on table "public"."account_types" from "authenticated";

revoke select on table "public"."account_types" from "authenticated";

revoke trigger on table "public"."account_types" from "authenticated";

revoke truncate on table "public"."account_types" from "authenticated";

revoke update on table "public"."account_types" from "authenticated";

revoke delete on table "public"."account_types" from "service_role";

revoke insert on table "public"."account_types" from "service_role";

revoke references on table "public"."account_types" from "service_role";

revoke select on table "public"."account_types" from "service_role";

revoke trigger on table "public"."account_types" from "service_role";

revoke truncate on table "public"."account_types" from "service_role";

revoke update on table "public"."account_types" from "service_role";

revoke delete on table "public"."accounts" from "anon";

revoke insert on table "public"."accounts" from "anon";

revoke references on table "public"."accounts" from "anon";

revoke select on table "public"."accounts" from "anon";

revoke trigger on table "public"."accounts" from "anon";

revoke truncate on table "public"."accounts" from "anon";

revoke update on table "public"."accounts" from "anon";

revoke delete on table "public"."accounts" from "authenticated";

revoke insert on table "public"."accounts" from "authenticated";

revoke references on table "public"."accounts" from "authenticated";

revoke select on table "public"."accounts" from "authenticated";

revoke trigger on table "public"."accounts" from "authenticated";

revoke truncate on table "public"."accounts" from "authenticated";

revoke update on table "public"."accounts" from "authenticated";

revoke delete on table "public"."accounts" from "service_role";

revoke insert on table "public"."accounts" from "service_role";

revoke references on table "public"."accounts" from "service_role";

revoke select on table "public"."accounts" from "service_role";

revoke trigger on table "public"."accounts" from "service_role";

revoke truncate on table "public"."accounts" from "service_role";

revoke update on table "public"."accounts" from "service_role";

revoke delete on table "public"."achievement_definitions" from "anon";

revoke insert on table "public"."achievement_definitions" from "anon";

revoke references on table "public"."achievement_definitions" from "anon";

revoke select on table "public"."achievement_definitions" from "anon";

revoke trigger on table "public"."achievement_definitions" from "anon";

revoke truncate on table "public"."achievement_definitions" from "anon";

revoke update on table "public"."achievement_definitions" from "anon";

revoke delete on table "public"."achievement_definitions" from "authenticated";

revoke insert on table "public"."achievement_definitions" from "authenticated";

revoke references on table "public"."achievement_definitions" from "authenticated";

revoke select on table "public"."achievement_definitions" from "authenticated";

revoke trigger on table "public"."achievement_definitions" from "authenticated";

revoke truncate on table "public"."achievement_definitions" from "authenticated";

revoke update on table "public"."achievement_definitions" from "authenticated";

revoke delete on table "public"."achievement_definitions" from "service_role";

revoke insert on table "public"."achievement_definitions" from "service_role";

revoke references on table "public"."achievement_definitions" from "service_role";

revoke select on table "public"."achievement_definitions" from "service_role";

revoke trigger on table "public"."achievement_definitions" from "service_role";

revoke truncate on table "public"."achievement_definitions" from "service_role";

revoke update on table "public"."achievement_definitions" from "service_role";

revoke delete on table "public"."admin_audit_log" from "anon";

revoke insert on table "public"."admin_audit_log" from "anon";

revoke references on table "public"."admin_audit_log" from "anon";

revoke select on table "public"."admin_audit_log" from "anon";

revoke trigger on table "public"."admin_audit_log" from "anon";

revoke truncate on table "public"."admin_audit_log" from "anon";

revoke update on table "public"."admin_audit_log" from "anon";

revoke delete on table "public"."admin_audit_log" from "authenticated";

revoke insert on table "public"."admin_audit_log" from "authenticated";

revoke references on table "public"."admin_audit_log" from "authenticated";

revoke select on table "public"."admin_audit_log" from "authenticated";

revoke trigger on table "public"."admin_audit_log" from "authenticated";

revoke truncate on table "public"."admin_audit_log" from "authenticated";

revoke update on table "public"."admin_audit_log" from "authenticated";

revoke delete on table "public"."admin_audit_log" from "service_role";

revoke insert on table "public"."admin_audit_log" from "service_role";

revoke references on table "public"."admin_audit_log" from "service_role";

revoke select on table "public"."admin_audit_log" from "service_role";

revoke trigger on table "public"."admin_audit_log" from "service_role";

revoke truncate on table "public"."admin_audit_log" from "service_role";

revoke update on table "public"."admin_audit_log" from "service_role";

revoke delete on table "public"."admin_config_account_types" from "anon";

revoke insert on table "public"."admin_config_account_types" from "anon";

revoke references on table "public"."admin_config_account_types" from "anon";

revoke select on table "public"."admin_config_account_types" from "anon";

revoke trigger on table "public"."admin_config_account_types" from "anon";

revoke truncate on table "public"."admin_config_account_types" from "anon";

revoke update on table "public"."admin_config_account_types" from "anon";

revoke delete on table "public"."admin_config_account_types" from "authenticated";

revoke insert on table "public"."admin_config_account_types" from "authenticated";

revoke references on table "public"."admin_config_account_types" from "authenticated";

revoke select on table "public"."admin_config_account_types" from "authenticated";

revoke trigger on table "public"."admin_config_account_types" from "authenticated";

revoke truncate on table "public"."admin_config_account_types" from "authenticated";

revoke update on table "public"."admin_config_account_types" from "authenticated";

revoke delete on table "public"."admin_config_account_types" from "service_role";

revoke insert on table "public"."admin_config_account_types" from "service_role";

revoke references on table "public"."admin_config_account_types" from "service_role";

revoke select on table "public"."admin_config_account_types" from "service_role";

revoke trigger on table "public"."admin_config_account_types" from "service_role";

revoke truncate on table "public"."admin_config_account_types" from "service_role";

revoke update on table "public"."admin_config_account_types" from "service_role";

revoke delete on table "public"."admin_config_goal_categories" from "anon";

revoke insert on table "public"."admin_config_goal_categories" from "anon";

revoke references on table "public"."admin_config_goal_categories" from "anon";

revoke select on table "public"."admin_config_goal_categories" from "anon";

revoke trigger on table "public"."admin_config_goal_categories" from "anon";

revoke truncate on table "public"."admin_config_goal_categories" from "anon";

revoke update on table "public"."admin_config_goal_categories" from "anon";

revoke delete on table "public"."admin_config_goal_categories" from "authenticated";

revoke insert on table "public"."admin_config_goal_categories" from "authenticated";

revoke references on table "public"."admin_config_goal_categories" from "authenticated";

revoke select on table "public"."admin_config_goal_categories" from "authenticated";

revoke trigger on table "public"."admin_config_goal_categories" from "authenticated";

revoke truncate on table "public"."admin_config_goal_categories" from "authenticated";

revoke update on table "public"."admin_config_goal_categories" from "authenticated";

revoke delete on table "public"."admin_config_goal_categories" from "service_role";

revoke insert on table "public"."admin_config_goal_categories" from "service_role";

revoke references on table "public"."admin_config_goal_categories" from "service_role";

revoke select on table "public"."admin_config_goal_categories" from "service_role";

revoke trigger on table "public"."admin_config_goal_categories" from "service_role";

revoke truncate on table "public"."admin_config_goal_categories" from "service_role";

revoke update on table "public"."admin_config_goal_categories" from "service_role";

revoke delete on table "public"."admin_config_institutions" from "anon";

revoke insert on table "public"."admin_config_institutions" from "anon";

revoke references on table "public"."admin_config_institutions" from "anon";

revoke select on table "public"."admin_config_institutions" from "anon";

revoke trigger on table "public"."admin_config_institutions" from "anon";

revoke truncate on table "public"."admin_config_institutions" from "anon";

revoke update on table "public"."admin_config_institutions" from "anon";

revoke delete on table "public"."admin_config_institutions" from "authenticated";

revoke insert on table "public"."admin_config_institutions" from "authenticated";

revoke references on table "public"."admin_config_institutions" from "authenticated";

revoke select on table "public"."admin_config_institutions" from "authenticated";

revoke trigger on table "public"."admin_config_institutions" from "authenticated";

revoke truncate on table "public"."admin_config_institutions" from "authenticated";

revoke update on table "public"."admin_config_institutions" from "authenticated";

revoke delete on table "public"."admin_config_institutions" from "service_role";

revoke insert on table "public"."admin_config_institutions" from "service_role";

revoke references on table "public"."admin_config_institutions" from "service_role";

revoke select on table "public"."admin_config_institutions" from "service_role";

revoke trigger on table "public"."admin_config_institutions" from "service_role";

revoke truncate on table "public"."admin_config_institutions" from "service_role";

revoke update on table "public"."admin_config_institutions" from "service_role";

revoke delete on table "public"."admin_config_system_settings" from "anon";

revoke insert on table "public"."admin_config_system_settings" from "anon";

revoke references on table "public"."admin_config_system_settings" from "anon";

revoke select on table "public"."admin_config_system_settings" from "anon";

revoke trigger on table "public"."admin_config_system_settings" from "anon";

revoke truncate on table "public"."admin_config_system_settings" from "anon";

revoke update on table "public"."admin_config_system_settings" from "anon";

revoke delete on table "public"."admin_config_system_settings" from "authenticated";

revoke insert on table "public"."admin_config_system_settings" from "authenticated";

revoke references on table "public"."admin_config_system_settings" from "authenticated";

revoke select on table "public"."admin_config_system_settings" from "authenticated";

revoke trigger on table "public"."admin_config_system_settings" from "authenticated";

revoke truncate on table "public"."admin_config_system_settings" from "authenticated";

revoke update on table "public"."admin_config_system_settings" from "authenticated";

revoke delete on table "public"."admin_config_system_settings" from "service_role";

revoke insert on table "public"."admin_config_system_settings" from "service_role";

revoke references on table "public"."admin_config_system_settings" from "service_role";

revoke select on table "public"."admin_config_system_settings" from "service_role";

revoke trigger on table "public"."admin_config_system_settings" from "service_role";

revoke truncate on table "public"."admin_config_system_settings" from "service_role";

revoke update on table "public"."admin_config_system_settings" from "service_role";

revoke delete on table "public"."admin_config_validation_rules" from "anon";

revoke insert on table "public"."admin_config_validation_rules" from "anon";

revoke references on table "public"."admin_config_validation_rules" from "anon";

revoke select on table "public"."admin_config_validation_rules" from "anon";

revoke trigger on table "public"."admin_config_validation_rules" from "anon";

revoke truncate on table "public"."admin_config_validation_rules" from "anon";

revoke update on table "public"."admin_config_validation_rules" from "anon";

revoke delete on table "public"."admin_config_validation_rules" from "authenticated";

revoke insert on table "public"."admin_config_validation_rules" from "authenticated";

revoke references on table "public"."admin_config_validation_rules" from "authenticated";

revoke select on table "public"."admin_config_validation_rules" from "authenticated";

revoke trigger on table "public"."admin_config_validation_rules" from "authenticated";

revoke truncate on table "public"."admin_config_validation_rules" from "authenticated";

revoke update on table "public"."admin_config_validation_rules" from "authenticated";

revoke delete on table "public"."admin_config_validation_rules" from "service_role";

revoke insert on table "public"."admin_config_validation_rules" from "service_role";

revoke references on table "public"."admin_config_validation_rules" from "service_role";

revoke select on table "public"."admin_config_validation_rules" from "service_role";

revoke trigger on table "public"."admin_config_validation_rules" from "service_role";

revoke truncate on table "public"."admin_config_validation_rules" from "service_role";

revoke update on table "public"."admin_config_validation_rules" from "service_role";

revoke delete on table "public"."balance_entries" from "anon";

revoke insert on table "public"."balance_entries" from "anon";

revoke references on table "public"."balance_entries" from "anon";

revoke select on table "public"."balance_entries" from "anon";

revoke trigger on table "public"."balance_entries" from "anon";

revoke truncate on table "public"."balance_entries" from "anon";

revoke update on table "public"."balance_entries" from "anon";

revoke delete on table "public"."balance_entries" from "authenticated";

revoke insert on table "public"."balance_entries" from "authenticated";

revoke references on table "public"."balance_entries" from "authenticated";

revoke select on table "public"."balance_entries" from "authenticated";

revoke trigger on table "public"."balance_entries" from "authenticated";

revoke truncate on table "public"."balance_entries" from "authenticated";

revoke update on table "public"."balance_entries" from "authenticated";

revoke delete on table "public"."balance_entries" from "service_role";

revoke insert on table "public"."balance_entries" from "service_role";

revoke references on table "public"."balance_entries" from "service_role";

revoke select on table "public"."balance_entries" from "service_role";

revoke trigger on table "public"."balance_entries" from "service_role";

revoke truncate on table "public"."balance_entries" from "service_role";

revoke update on table "public"."balance_entries" from "service_role";

revoke delete on table "public"."dividend_history" from "anon";

revoke insert on table "public"."dividend_history" from "anon";

revoke references on table "public"."dividend_history" from "anon";

revoke select on table "public"."dividend_history" from "anon";

revoke trigger on table "public"."dividend_history" from "anon";

revoke truncate on table "public"."dividend_history" from "anon";

revoke update on table "public"."dividend_history" from "anon";

revoke delete on table "public"."dividend_history" from "authenticated";

revoke insert on table "public"."dividend_history" from "authenticated";

revoke references on table "public"."dividend_history" from "authenticated";

revoke select on table "public"."dividend_history" from "authenticated";

revoke trigger on table "public"."dividend_history" from "authenticated";

revoke truncate on table "public"."dividend_history" from "authenticated";

revoke update on table "public"."dividend_history" from "authenticated";

revoke delete on table "public"."dividend_history" from "service_role";

revoke insert on table "public"."dividend_history" from "service_role";

revoke references on table "public"."dividend_history" from "service_role";

revoke select on table "public"."dividend_history" from "service_role";

revoke trigger on table "public"."dividend_history" from "service_role";

revoke truncate on table "public"."dividend_history" from "service_role";

revoke update on table "public"."dividend_history" from "service_role";

revoke delete on table "public"."family_members" from "anon";

revoke insert on table "public"."family_members" from "anon";

revoke references on table "public"."family_members" from "anon";

revoke select on table "public"."family_members" from "anon";

revoke trigger on table "public"."family_members" from "anon";

revoke truncate on table "public"."family_members" from "anon";

revoke update on table "public"."family_members" from "anon";

revoke delete on table "public"."family_members" from "authenticated";

revoke insert on table "public"."family_members" from "authenticated";

revoke references on table "public"."family_members" from "authenticated";

revoke select on table "public"."family_members" from "authenticated";

revoke trigger on table "public"."family_members" from "authenticated";

revoke truncate on table "public"."family_members" from "authenticated";

revoke update on table "public"."family_members" from "authenticated";

revoke delete on table "public"."family_members" from "service_role";

revoke insert on table "public"."family_members" from "service_role";

revoke references on table "public"."family_members" from "service_role";

revoke select on table "public"."family_members" from "service_role";

revoke trigger on table "public"."family_members" from "service_role";

revoke truncate on table "public"."family_members" from "service_role";

revoke update on table "public"."family_members" from "service_role";

revoke delete on table "public"."goal_categories" from "anon";

revoke insert on table "public"."goal_categories" from "anon";

revoke references on table "public"."goal_categories" from "anon";

revoke select on table "public"."goal_categories" from "anon";

revoke trigger on table "public"."goal_categories" from "anon";

revoke truncate on table "public"."goal_categories" from "anon";

revoke update on table "public"."goal_categories" from "anon";

revoke delete on table "public"."goal_categories" from "authenticated";

revoke insert on table "public"."goal_categories" from "authenticated";

revoke references on table "public"."goal_categories" from "authenticated";

revoke select on table "public"."goal_categories" from "authenticated";

revoke trigger on table "public"."goal_categories" from "authenticated";

revoke truncate on table "public"."goal_categories" from "authenticated";

revoke update on table "public"."goal_categories" from "authenticated";

revoke delete on table "public"."goal_categories" from "service_role";

revoke insert on table "public"."goal_categories" from "service_role";

revoke references on table "public"."goal_categories" from "service_role";

revoke select on table "public"."goal_categories" from "service_role";

revoke trigger on table "public"."goal_categories" from "service_role";

revoke truncate on table "public"."goal_categories" from "service_role";

revoke update on table "public"."goal_categories" from "service_role";

revoke delete on table "public"."goal_progress_entries" from "anon";

revoke insert on table "public"."goal_progress_entries" from "anon";

revoke references on table "public"."goal_progress_entries" from "anon";

revoke select on table "public"."goal_progress_entries" from "anon";

revoke trigger on table "public"."goal_progress_entries" from "anon";

revoke truncate on table "public"."goal_progress_entries" from "anon";

revoke update on table "public"."goal_progress_entries" from "anon";

revoke delete on table "public"."goal_progress_entries" from "authenticated";

revoke insert on table "public"."goal_progress_entries" from "authenticated";

revoke references on table "public"."goal_progress_entries" from "authenticated";

revoke select on table "public"."goal_progress_entries" from "authenticated";

revoke trigger on table "public"."goal_progress_entries" from "authenticated";

revoke truncate on table "public"."goal_progress_entries" from "authenticated";

revoke update on table "public"."goal_progress_entries" from "authenticated";

revoke delete on table "public"."goal_progress_entries" from "service_role";

revoke insert on table "public"."goal_progress_entries" from "service_role";

revoke references on table "public"."goal_progress_entries" from "service_role";

revoke select on table "public"."goal_progress_entries" from "service_role";

revoke trigger on table "public"."goal_progress_entries" from "service_role";

revoke truncate on table "public"."goal_progress_entries" from "service_role";

revoke update on table "public"."goal_progress_entries" from "service_role";

revoke delete on table "public"."goal_templates" from "anon";

revoke insert on table "public"."goal_templates" from "anon";

revoke references on table "public"."goal_templates" from "anon";

revoke select on table "public"."goal_templates" from "anon";

revoke trigger on table "public"."goal_templates" from "anon";

revoke truncate on table "public"."goal_templates" from "anon";

revoke update on table "public"."goal_templates" from "anon";

revoke delete on table "public"."goal_templates" from "authenticated";

revoke insert on table "public"."goal_templates" from "authenticated";

revoke references on table "public"."goal_templates" from "authenticated";

revoke select on table "public"."goal_templates" from "authenticated";

revoke trigger on table "public"."goal_templates" from "authenticated";

revoke truncate on table "public"."goal_templates" from "authenticated";

revoke update on table "public"."goal_templates" from "authenticated";

revoke delete on table "public"."goal_templates" from "service_role";

revoke insert on table "public"."goal_templates" from "service_role";

revoke references on table "public"."goal_templates" from "service_role";

revoke select on table "public"."goal_templates" from "service_role";

revoke trigger on table "public"."goal_templates" from "service_role";

revoke truncate on table "public"."goal_templates" from "service_role";

revoke update on table "public"."goal_templates" from "service_role";

revoke delete on table "public"."goals" from "anon";

revoke insert on table "public"."goals" from "anon";

revoke references on table "public"."goals" from "anon";

revoke select on table "public"."goals" from "anon";

revoke trigger on table "public"."goals" from "anon";

revoke truncate on table "public"."goals" from "anon";

revoke update on table "public"."goals" from "anon";

revoke delete on table "public"."goals" from "authenticated";

revoke insert on table "public"."goals" from "authenticated";

revoke references on table "public"."goals" from "authenticated";

revoke select on table "public"."goals" from "authenticated";

revoke trigger on table "public"."goals" from "authenticated";

revoke truncate on table "public"."goals" from "authenticated";

revoke update on table "public"."goals" from "authenticated";

revoke delete on table "public"."goals" from "service_role";

revoke insert on table "public"."goals" from "service_role";

revoke references on table "public"."goals" from "service_role";

revoke select on table "public"."goals" from "service_role";

revoke trigger on table "public"."goals" from "service_role";

revoke truncate on table "public"."goals" from "service_role";

revoke update on table "public"."goals" from "service_role";

revoke delete on table "public"."monthly_summaries" from "anon";

revoke insert on table "public"."monthly_summaries" from "anon";

revoke references on table "public"."monthly_summaries" from "anon";

revoke select on table "public"."monthly_summaries" from "anon";

revoke trigger on table "public"."monthly_summaries" from "anon";

revoke truncate on table "public"."monthly_summaries" from "anon";

revoke update on table "public"."monthly_summaries" from "anon";

revoke delete on table "public"."monthly_summaries" from "authenticated";

revoke insert on table "public"."monthly_summaries" from "authenticated";

revoke references on table "public"."monthly_summaries" from "authenticated";

revoke select on table "public"."monthly_summaries" from "authenticated";

revoke trigger on table "public"."monthly_summaries" from "authenticated";

revoke truncate on table "public"."monthly_summaries" from "authenticated";

revoke update on table "public"."monthly_summaries" from "authenticated";

revoke delete on table "public"."monthly_summaries" from "service_role";

revoke insert on table "public"."monthly_summaries" from "service_role";

revoke references on table "public"."monthly_summaries" from "service_role";

revoke select on table "public"."monthly_summaries" from "service_role";

revoke trigger on table "public"."monthly_summaries" from "service_role";

revoke truncate on table "public"."monthly_summaries" from "service_role";

revoke update on table "public"."monthly_summaries" from "service_role";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."notifications" from "authenticated";

revoke insert on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke select on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke delete on table "public"."notifications" from "service_role";

revoke insert on table "public"."notifications" from "service_role";

revoke references on table "public"."notifications" from "service_role";

revoke select on table "public"."notifications" from "service_role";

revoke trigger on table "public"."notifications" from "service_role";

revoke truncate on table "public"."notifications" from "service_role";

revoke update on table "public"."notifications" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."reminders" from "anon";

revoke insert on table "public"."reminders" from "anon";

revoke references on table "public"."reminders" from "anon";

revoke select on table "public"."reminders" from "anon";

revoke trigger on table "public"."reminders" from "anon";

revoke truncate on table "public"."reminders" from "anon";

revoke update on table "public"."reminders" from "anon";

revoke delete on table "public"."reminders" from "authenticated";

revoke insert on table "public"."reminders" from "authenticated";

revoke references on table "public"."reminders" from "authenticated";

revoke select on table "public"."reminders" from "authenticated";

revoke trigger on table "public"."reminders" from "authenticated";

revoke truncate on table "public"."reminders" from "authenticated";

revoke update on table "public"."reminders" from "authenticated";

revoke delete on table "public"."reminders" from "service_role";

revoke insert on table "public"."reminders" from "service_role";

revoke references on table "public"."reminders" from "service_role";

revoke select on table "public"."reminders" from "service_role";

revoke trigger on table "public"."reminders" from "service_role";

revoke truncate on table "public"."reminders" from "service_role";

revoke update on table "public"."reminders" from "service_role";

revoke delete on table "public"."user_achievements" from "anon";

revoke insert on table "public"."user_achievements" from "anon";

revoke references on table "public"."user_achievements" from "anon";

revoke select on table "public"."user_achievements" from "anon";

revoke trigger on table "public"."user_achievements" from "anon";

revoke truncate on table "public"."user_achievements" from "anon";

revoke update on table "public"."user_achievements" from "anon";

revoke delete on table "public"."user_achievements" from "authenticated";

revoke insert on table "public"."user_achievements" from "authenticated";

revoke references on table "public"."user_achievements" from "authenticated";

revoke select on table "public"."user_achievements" from "authenticated";

revoke trigger on table "public"."user_achievements" from "authenticated";

revoke truncate on table "public"."user_achievements" from "authenticated";

revoke update on table "public"."user_achievements" from "authenticated";

revoke delete on table "public"."user_achievements" from "service_role";

revoke insert on table "public"."user_achievements" from "service_role";

revoke references on table "public"."user_achievements" from "service_role";

revoke select on table "public"."user_achievements" from "service_role";

revoke trigger on table "public"."user_achievements" from "service_role";

revoke truncate on table "public"."user_achievements" from "service_role";

revoke update on table "public"."user_achievements" from "service_role";

revoke delete on table "public"."user_feedback" from "anon";

revoke insert on table "public"."user_feedback" from "anon";

revoke references on table "public"."user_feedback" from "anon";

revoke select on table "public"."user_feedback" from "anon";

revoke trigger on table "public"."user_feedback" from "anon";

revoke truncate on table "public"."user_feedback" from "anon";

revoke update on table "public"."user_feedback" from "anon";

revoke delete on table "public"."user_feedback" from "authenticated";

revoke insert on table "public"."user_feedback" from "authenticated";

revoke references on table "public"."user_feedback" from "authenticated";

revoke select on table "public"."user_feedback" from "authenticated";

revoke trigger on table "public"."user_feedback" from "authenticated";

revoke truncate on table "public"."user_feedback" from "authenticated";

revoke update on table "public"."user_feedback" from "authenticated";

revoke delete on table "public"."user_feedback" from "service_role";

revoke insert on table "public"."user_feedback" from "service_role";

revoke references on table "public"."user_feedback" from "service_role";

revoke select on table "public"."user_feedback" from "service_role";

revoke trigger on table "public"."user_feedback" from "service_role";

revoke truncate on table "public"."user_feedback" from "service_role";

revoke update on table "public"."user_feedback" from "service_role";

alter table "public"."dividend_history" drop constraint "dividend_history_account_scheme_year_key";

alter table "public"."dividend_history" drop constraint "dividend_history_scheme_type_check";

drop function if exists "public"."prevent_unauthorized_admin_changes"();

drop index if exists "public"."dividend_history_account_scheme_year_key";

drop index if exists "public"."idx_dividend_history_account_scheme_year";

-- Collapse EPF scheme-specific rows before removing the scheme_type column to
-- avoid duplicate (account_type, year) entries when aligning to cloud schema.
-- Prefer keeping 'Conventional' rows and remove 'Syariah' rows.
DELETE FROM public.dividend_history
WHERE account_type = 'EPF' AND scheme_type = 'Syariah';

-- As an extra safety, if any duplicates still exist for EPF after the above
-- (shouldn't happen), keep a single row per (account_type, year) and remove the rest.
WITH ranked AS (
	SELECT ctid,
				 ROW_NUMBER() OVER (
					 PARTITION BY account_type, year
					 ORDER BY dividend_rate DESC NULLS LAST, year DESC
				 ) AS rn
	FROM public.dividend_history
	WHERE account_type = 'EPF'
)
DELETE FROM public.dividend_history d
USING ranked r
WHERE d.ctid = r.ctid AND r.rn > 1;

alter table "public"."dividend_history" drop column "scheme_type";

CREATE UNIQUE INDEX dividend_history_account_type_year_key ON public.dividend_history USING btree (account_type, year);

alter table "public"."dividend_history" add constraint "dividend_history_account_type_year_key" UNIQUE using index "dividend_history_account_type_year_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
RETURN EXISTS (
SELECT 1 FROM profiles
WHERE id = auth.uid() AND is_admin = true
);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_asb_units_held()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
IF NEW.asb_unit_price IS NOT NULL AND NEW.asb_unit_price > 0 THEN
NEW.asb_units_held := NEW.current_balance / NEW.asb_unit_price;
END IF;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;


