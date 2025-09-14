-- Drop the existing primary key constraint
ALTER TABLE student_mastery DROP CONSTRAINT student_mastery_pkey;

-- Add a new primary key that includes course_id
ALTER TABLE student_mastery ADD PRIMARY KEY (user_id, entity_type, entity_id, course_id);