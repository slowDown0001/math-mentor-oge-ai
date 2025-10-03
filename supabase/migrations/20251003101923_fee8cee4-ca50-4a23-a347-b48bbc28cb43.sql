-- Enable public read access to topic articles
CREATE POLICY "Allow public read access to topic articles"
ON public.topic_articles
FOR SELECT
TO public
USING (true);