-- Create edge function for deleting course data
CREATE OR REPLACE FUNCTION delete_course_data(p_user_id uuid, p_course_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from student_mastery table
  DELETE FROM student_mastery 
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  -- Delete from student_mastery_status table
  DELETE FROM student_mastery_status 
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  -- Update profiles table to remove course from courses array
  UPDATE profiles 
  SET courses = array_remove(courses, p_course_id::integer)
  WHERE user_id = p_user_id;
END;
$$;