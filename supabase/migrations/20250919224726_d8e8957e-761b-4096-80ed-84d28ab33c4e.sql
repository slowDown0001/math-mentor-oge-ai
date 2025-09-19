-- Add sample tasks and set seen=0 for some to test the story ring functionality
UPDATE stories_and_telegram SET 
  task = 'Сегодня потренируйтесь решать задачи на проценты. Они часто встречаются на ОГЭ!',
  seen = 0
WHERE upload_id = 1;

UPDATE stories_and_telegram SET 
  task = 'Попробуйте решить 5 задач на алгебраические выражения',
  seen = 1  
WHERE upload_id = 2;

UPDATE stories_and_telegram SET 
  task = 'Изучите тему "Геометрия на плоскости" в учебнике',
  seen = 0
WHERE upload_id = 3;