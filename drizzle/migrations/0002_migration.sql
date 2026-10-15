DROP POLICY "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (vehicle IS NULL OR char_length(vehicle) <= 200)
  AND (interest IS NULL OR char_length(interest) <= 200)
  AND char_length(source) <= 50
);