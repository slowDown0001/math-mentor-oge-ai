-- Add unique constraint for student_mastery table to support ON CONFLICT
ALTER TABLE public.student_mastery 
ADD CONSTRAINT student_mastery_user_entity_course_unique 
UNIQUE (user_id, entity_type, entity_id, course_id);