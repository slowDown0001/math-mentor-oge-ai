-- Add performance indexes for student_activity table
CREATE INDEX IF NOT EXISTS idx_student_activity_user_id 
ON student_activity (user_id);

CREATE INDEX IF NOT EXISTS idx_student_activity_skills 
ON student_activity USING GIN (skills);

CREATE INDEX IF NOT EXISTS idx_student_activity_user_problem_type 
ON student_activity (user_id, problem_number_type, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_activity_user_updated_at 
ON student_activity (user_id, updated_at DESC);

-- Add indexes for student_mastery table to optimize alpha/beta lookups
CREATE INDEX IF NOT EXISTS idx_student_mastery_user_entity 
ON student_mastery (user_id, entity_type, entity_id, course_id);

-- Add index for student_mastery_status table
CREATE INDEX IF NOT EXISTS idx_student_mastery_status_user_entity 
ON student_mastery_status (user_id, entity_type, entity_id, course_id);