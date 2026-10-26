-- NOT APPLIED. This project has one backend shared by preview and the live site,
-- so applying this would change production. Apply only after the owner approves
-- (see docs/OWNER_ACCESS.md). Additive only: no existing table or policy changes.

CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'tester');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'owner') OR public.has_role(_user_id, 'admin')
$$;

-- Users see their own roles; admins see all. No client writes at all.
CREATE POLICY "Read own or admin" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,          -- sha256 of the token; raw token never stored
  role public.app_role NOT NULL CHECK (role IN ('tester', 'admin')),
  note text CHECK (note IS NULL OR char_length(note) <= 200),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  used_by uuid,
  used_at timestamptz
);
GRANT SELECT ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read invitations" ON public.invitations FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Create: returns the raw token once. Admins may only invite testers; owners may invite admins.
CREATE OR REPLACE FUNCTION public.create_invitation(_role public.app_role, _hours int, _note text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE tok text := encode(gen_random_bytes(32), 'hex');
BEGIN
  IF _role = 'owner' THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _role = 'admin' AND NOT public.has_role(auth.uid(), 'owner') THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.invitations (token_hash, role, note, created_by, expires_at)
  VALUES (encode(digest(tok, 'sha256'), 'hex'), _role, left(_note, 200), auth.uid(),
          now() + make_interval(hours => least(720, greatest(1, coalesce(_hours, 72)))));
  RETURN tok;
END $$;

CREATE OR REPLACE FUNCTION public.revoke_invitation(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.invitations SET revoked_at = now() WHERE id = _id AND used_at IS NULL AND revoked_at IS NULL;
END $$;

-- Redeem: signed-in, email-verified user; single use enforced by row lock.
CREATE OR REPLACE FUNCTION public.redeem_invitation(_token text)
RETURNS public.app_role LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE inv public.invitations;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL)
    THEN RAISE EXCEPTION 'unverified_email'; END IF;
  SELECT * INTO inv FROM public.invitations WHERE token_hash = encode(digest(_token, 'sha256'), 'hex') FOR UPDATE;
  IF inv.id IS NULL OR inv.revoked_at IS NOT NULL OR inv.used_at IS NOT NULL OR inv.expires_at <= now()
    THEN RAISE EXCEPTION 'invalid_invitation'; END IF;
  UPDATE public.invitations SET used_by = auth.uid(), used_at = now() WHERE id = inv.id;
  INSERT INTO public.user_roles (user_id, role, granted_by) VALUES (auth.uid(), inv.role, inv.created_by)
    ON CONFLICT DO NOTHING;
  RETURN inv.role;
END $$;

-- Remove a member's role. Owner role can never be removed through the app.
CREATE OR REPLACE FUNCTION public.remove_member_role(_user_id uuid, _role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _role = 'owner' THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _role = 'admin' AND NOT public.has_role(auth.uid(), 'owner') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
END $$;

REVOKE EXECUTE ON FUNCTION public.create_invitation, public.revoke_invitation,
  public.redeem_invitation, public.remove_member_role FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_invitation, public.revoke_invitation,
  public.redeem_invitation, public.remove_member_role, public.has_role, public.is_admin TO authenticated;

-- OWNER BOOTSTRAP is deliberately NOT here. It is a one-time manual step run by
-- the verified owner's operator with a real user id (see docs/OWNER_ACCESS.md).
