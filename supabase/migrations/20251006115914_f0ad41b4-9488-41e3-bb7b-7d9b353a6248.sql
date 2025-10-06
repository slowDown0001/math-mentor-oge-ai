-- Change session_id from uuid to text and remove default
ALTER TABLE homework_progress 
ALTER COLUMN session_id TYPE text USING session_id::text,
ALTER COLUMN session_id DROP DEFAULT;