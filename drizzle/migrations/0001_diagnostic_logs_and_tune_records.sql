CREATE TABLE public.diagnostic_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  trouble_codes jsonb,
  sensor_readings jsonb,
  health_score integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX diagnostic_logs_user_idx ON public.diagnostic_logs(user_id);
CREATE INDEX diagnostic_logs_vehicle_idx ON public.diagnostic_logs(vehicle_id, recorded_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostic_logs TO authenticated;
GRANT ALL ON public.diagnostic_logs TO service_role;
ALTER TABLE public.diagnostic_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own diagnostic logs" ON public.diagnostic_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.user_id = auth.uid()));

CREATE TABLE public.tune_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  tune_name text NOT NULL,
  tune_type text,
  applied_at timestamptz NOT NULL DEFAULT now(),
  parameters jsonb,
  reverted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tune_records_user_idx ON public.tune_records(user_id);
CREATE INDEX tune_records_vehicle_idx ON public.tune_records(vehicle_id, applied_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tune_records TO authenticated;
GRANT ALL ON public.tune_records TO service_role;
ALTER TABLE public.tune_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own tune records" ON public.tune_records FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.user_id = auth.uid()));