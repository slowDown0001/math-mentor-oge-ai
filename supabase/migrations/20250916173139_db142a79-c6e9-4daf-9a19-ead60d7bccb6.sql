-- Add new columns to profiles table for course marks and estimations
ALTER TABLE public.profiles 
ADD COLUMN schoolmark1 integer,
ADD COLUMN selfestimation1 integer,
ADD COLUMN testmark1 integer,
ADD COLUMN schoolmark2 integer,
ADD COLUMN selfestimation2 integer,
ADD COLUMN testmark2 integer,
ADD COLUMN schoolmark3 integer,
ADD COLUMN selfestimation3 integer,
ADD COLUMN testmark3 integer;