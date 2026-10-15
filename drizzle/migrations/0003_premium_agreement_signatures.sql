ALTER TABLE public.agreements
  ADD COLUMN IF NOT EXISTS tier_id text,
  ADD COLUMN IF NOT EXISTS signature text,
  ADD COLUMN IF NOT EXISTS signature_kind text,
  ADD COLUMN IF NOT EXISTS acknowledged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agreement_version text;

-- Users can't write agreements directly; signing goes through this checked function.
CREATE OR REPLACE FUNCTION public.sign_premium_agreement(_tier text, _signature text, _kind text, _version text, _acknowledged boolean)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _title text;
  _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  _title := CASE _tier
    WHEN 'tier-1' THEN 'Power Tier I mini-license'
    WHEN 'tier-2' THEN 'Power Tier II mini-license'
    WHEN 'tier-3' THEN 'Power Tier III mini-license'
  END;
  IF _title IS NULL THEN RAISE EXCEPTION 'Unknown tier'; END IF;
  IF _acknowledged IS NOT TRUE THEN RAISE EXCEPTION 'Acknowledgment required'; END IF;
  IF _version IS NULL OR char_length(_version) > 40 THEN RAISE EXCEPTION 'Invalid version'; END IF;
  IF _kind = 'typed' THEN
    IF char_length(btrim(_signature)) < 2 OR char_length(_signature) > 100 THEN RAISE EXCEPTION 'Invalid signature'; END IF;
  ELSIF _kind = 'drawn' THEN
    IF _signature NOT LIKE 'data:image/png;base64,%' OR char_length(_signature) > 300000 OR char_length(_signature) < 200 THEN RAISE EXCEPTION 'Invalid signature'; END IF;
  ELSE
    RAISE EXCEPTION 'Invalid signature type';
  END IF;
  IF EXISTS (SELECT 1 FROM public.agreements WHERE user_id = _uid AND tier_id = _tier AND agreement_version = _version) THEN
    RAISE EXCEPTION 'Already signed';
  END IF;
  INSERT INTO public.agreements (user_id, plan_id, title, tier_id, signature, signature_kind, acknowledged, agreement_version)
  VALUES (_uid, _tier, _title, _tier, _signature, _kind, true, _version)
  RETURNING id INTO _id;
  RETURN _id;
END $$;

REVOKE ALL ON FUNCTION public.sign_premium_agreement(text, text, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sign_premium_agreement(text, text, text, text, boolean) TO authenticated;

-- Source of truth for an unlock: signed agreement AND matching active subscription.
CREATE OR REPLACE FUNCTION public.has_premium_unlock(_tier text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.agreements a WHERE a.user_id = auth.uid() AND a.tier_id = _tier AND a.acknowledged)
    AND EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.user_id = auth.uid() AND s.plan_id = _tier AND s.status = 'active');
$$;

REVOKE ALL ON FUNCTION public.has_premium_unlock(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_premium_unlock(text) TO authenticated;