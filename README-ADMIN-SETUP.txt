RAKHI DRIVING SCHOOL — SUPABASE ADMIN UPLOAD PACKAGE

Files in this package:
- index.html: your existing public website, preserved, with the online gallery connected to your existing Supabase `gallery` table and private `school-media` bucket.
- admin.html: separate sign-in page for admin photo/video uploads and deletions.
- supabase-config.js: public Supabase URL, Publishable key placeholder, and admin email.
- supabase-setup.sql: policies needed for admin-only database insert/delete and storage delete.

ONE REQUIRED EDIT BEFORE UPLOAD
1. Open `supabase-config.js` in a text editor.
2. Replace PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE with the FULL `sb_publishable_...` key copied from Supabase → Settings → API Keys. Keep the quotes. Do NOT use a secret key.
3. Save the file.

SUPABASE CHECKLIST
- Project URL is already set to https://zdtqabsmoyybvckgmuye.supabase.co.
- Admin email is set to rakeshnandhan1@gmail.com (the user created in Supabase).
- The bucket name must remain `school-media`, and it should remain private.
- The `gallery` table should already exist with columns id, title, file_url, file_type, created_at.
- You already created an upload policy checking app_metadata.role = admin. You already assigned role=admin to the Auth user's app_metadata. Sign out and sign in again after role changes so the new JWT contains the role.
- In Supabase SQL Editor, run `supabase-setup.sql` to add the gallery row insert/delete policies and storage delete policy. The public read policy for the gallery table and storage objects must exist; according to the earlier setup they were already created.

GITHUB PAGES
1. In the repository, upload/replace `index.html`, and add `admin.html`, `supabase-config.js`, and `supabase-setup.sql` to the repository root. Do not delete the other existing repository files.
2. Commit the changes.
3. Admin page: https://rakhidrivingschool.github.io/Rakhi-Driving-School/admin.html
4. Public website: https://rakhidrivingschool.github.io/Rakhi-Driving-School/

HOW IT WORKS
- Admin signs in at admin.html using the created email/password.
- Only a signed-in JWT with app_metadata.role = admin can upload or delete files under the Storage policies.
- Public visitors can read the gallery; the bucket stays private and the site uses signed URLs that expire after one hour. Refreshing the page creates fresh URLs.
- Accepted uploads: JPG, PNG, WebP, MP4; max 50 MB per file. Free storage/bandwidth quotas apply.
- Do not put any `sb_secret_...`, `service_role`, or database password in the website.

If an upload or gallery load fails, check Supabase SQL policies and the browser console. Never share passwords or secret keys in screenshots.
