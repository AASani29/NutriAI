-- Rename 'mode' to 'sessionMode' safely to avoid aggregate function conflicts
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='ChatSession' AND column_name='mode') THEN
    ALTER TABLE "ChatSession" RENAME COLUMN "mode" TO "sessionMode";
  END IF;
END $$;
