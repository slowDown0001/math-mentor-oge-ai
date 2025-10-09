-- Update handle_new_user_profile function to set default tutor (Ёжик, id=1)
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, tutor_id, tutor_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    '1',
    'Ёжик'
  );
  RETURN NEW;
END;
$function$;