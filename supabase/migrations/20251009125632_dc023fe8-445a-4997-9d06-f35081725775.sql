-- Add new columns to user_statistics table for weekly energy points tracking

-- Add JSON column to store weekly energy points history
ALTER TABLE user_statistics 
ADD COLUMN IF NOT EXISTS energy_points_history JSONB DEFAULT '[]'::jsonb;

-- Add timestamp column to track when weekly goal was set
ALTER TABLE user_statistics 
ADD COLUMN IF NOT EXISTS weekly_goal_set_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comment explaining the columns
COMMENT ON COLUMN user_statistics.energy_points_history IS 'JSON array storing weekly energy points history with timestamps';
COMMENT ON COLUMN user_statistics.weekly_goal_set_at IS 'Timestamp when user last set their weekly goal, used to calculate 7-day reset cycle';