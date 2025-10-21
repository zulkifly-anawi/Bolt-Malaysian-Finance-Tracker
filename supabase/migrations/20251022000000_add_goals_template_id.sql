/*
  # Add template_id to goals table
  
  - Adds template_id column to goals table to link with goal_templates
  - Creates foreign key constraint to goal_templates
  - Adds index for performance
  - Idempotent: safe to run multiple times
*/

-- Add template_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'goals' 
    AND column_name = 'template_id'
  ) THEN
    ALTER TABLE public.goals 
    ADD COLUMN template_id uuid REFERENCES public.goal_templates(id) ON DELETE SET NULL;
    
    -- Add index for performance
    CREATE INDEX IF NOT EXISTS idx_goals_template_id ON public.goals(template_id);
    
    RAISE NOTICE 'Added template_id column to goals table';
  ELSE
    RAISE NOTICE 'template_id column already exists in goals table';
  END IF;
END $$;
