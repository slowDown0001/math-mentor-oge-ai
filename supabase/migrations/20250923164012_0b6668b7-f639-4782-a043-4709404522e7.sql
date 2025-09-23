-- Create mastery_snapshots table for storing historical mastery data
CREATE TABLE mastery_snapshots (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    course_id TEXT,
    run_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_data JSONB NOT NULL,
    computed_summary JSONB NOT NULL
);

-- Enable Row Level Security
ALTER TABLE mastery_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own mastery snapshots" 
ON mastery_snapshots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mastery snapshots" 
ON mastery_snapshots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- GIN index for fast JSON queries
CREATE INDEX idx_mastery_snapshots_raw_data
    ON mastery_snapshots USING GIN (raw_data jsonb_path_ops);

-- Composite index for efficient filtering by user, course, and time
CREATE INDEX idx_mastery_snapshots_user_course_time
    ON mastery_snapshots (user_id, course_id, run_timestamp DESC);