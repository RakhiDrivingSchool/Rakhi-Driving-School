-- Run this in Supabase SQL Editor. This matches the existing `gallery` table
-- and the existing private Storage bucket `school-media`.
-- Existing public SELECT policies and the existing upload policy are left intact.

GRANT SELECT ON TABLE public.gallery TO anon, authenticated;
GRANT INSERT, DELETE ON TABLE public.gallery TO authenticated;

DROP POLICY IF EXISTS "Admin can insert gallery rows" ON public.gallery;
CREATE POLICY "Admin can insert gallery rows"
ON public.gallery FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin can delete gallery rows" ON public.gallery;
CREATE POLICY "Admin can delete gallery rows"
ON public.gallery FOR DELETE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin can delete school media" ON storage.objects;
CREATE POLICY "Admin can delete school media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'school-media' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Note: the bucket remains PRIVATE. The website creates short-lived signed URLs
-- for public viewing. Do not make the bucket public just to enable uploads.
