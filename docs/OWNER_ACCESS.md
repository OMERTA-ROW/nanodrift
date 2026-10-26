# Owner accounts and tester invitations — status and activation

## Status
- Built and tested: role rules (`src/lib/invitations.ts`, `src/test/invitations.test.ts`).
- Prepared, NOT applied: database changes in `supabase/pending/owner_access.sql`.
- Blocked: this project's preview and live site share ONE backend. Applying the SQL,
  bootstrapping an owner, or adding admin pages that depend on it would change production.
  No isolated dev backend exists, so nothing was applied.
- Not built until activation: admin page (invite / revoke / members), redeem page.
- Already in place: separate real email+password logins with email confirmation,
  sign-out, per-user row-level isolation on vehicles, logs, tunes, profiles.
- No emails sent. No invitations created. No external accounts touched.
- Other projects (Jax etc.) were not changed — each needs its own pass.

## Limits / costs
- App imposes no invitation-count cap (only a 1h–30d expiry window).
- Invitations are links the owner shares manually, so no email cost.
- Auth emails (signup confirmation, reset) use the built-in sender, which is rate-limited per hour;
  raising it needs a custom sending domain. Database usage counts toward the Cloud plan's usage.

## Activation (owner decides)
1. Choose isolation: either create a draft (isolated backend) to test first, or accept that
   applying to the shared backend affects the live site (change is additive only).
2. Apply `supabase/pending/owner_access.sql` and regenerate types.
3. Owner signs up on the site with their real email and confirms it.
4. Owner tells the developer their account email in chat; the developer looks up that
   confirmed user's id and runs once:
   `insert into public.user_roles (user_id, role) values ('<that-uuid>', 'owner');`
   Never guess the email, never pick the first user.
5. Then ask to build the admin and redeem pages on top of the functions.
