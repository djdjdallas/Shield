-- Create scam_scans table to track all scan inputs and outputs
CREATE TABLE IF NOT EXISTS public.scam_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Input data
  message_text TEXT NOT NULL,
  message_length INTEGER GENERATED ALWAYS AS (length(message_text)) STORED,

  -- Analysis results
  verdict TEXT NOT NULL CHECK (verdict IN ('scam', 'suspicious', 'likely_legitimate', 'unclear')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  risk_level TEXT CHECK (risk_level IN ('high', 'medium', 'low', 'none')),

  -- Detailed analysis
  reasons JSONB,
  explanation TEXT,
  action_recommended TEXT,

  -- Metadata
  is_offline_analysis BOOLEAN DEFAULT false,
  model_used TEXT,
  analysis_duration_ms INTEGER,

  -- User context (optional, can be anonymous)
  user_id TEXT,
  device_id TEXT,
  app_version TEXT,

  -- Geographic data (optional)
  country_code TEXT,

  -- Indexes for common queries
  CONSTRAINT scam_scans_created_at_idx CHECK (created_at IS NOT NULL)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scam_scans_created_at ON public.scam_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scam_scans_verdict ON public.scam_scans(verdict);
CREATE INDEX IF NOT EXISTS idx_scam_scans_risk_level ON public.scam_scans(risk_level);
CREATE INDEX IF NOT EXISTS idx_scam_scans_user_id ON public.scam_scans(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scam_scans_is_offline ON public.scam_scans(is_offline_analysis);

-- Create a view for statistics
CREATE OR REPLACE VIEW public.scam_statistics AS
SELECT
  COUNT(*) as total_scans,
  COUNT(*) FILTER (WHERE verdict = 'scam') as scams_detected,
  COUNT(*) FILTER (WHERE verdict = 'suspicious') as suspicious_count,
  COUNT(*) FILTER (WHERE verdict = 'likely_legitimate') as safe_count,
  COUNT(*) FILTER (WHERE is_offline_analysis = true) as offline_scans,
  COUNT(*) FILTER (WHERE is_offline_analysis = false) as online_scans,
  AVG(confidence) as avg_confidence,
  DATE_TRUNC('day', created_at) as date
FROM public.scam_scans
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create a view for recent high-risk scams
CREATE OR REPLACE VIEW public.recent_high_risk_scams AS
SELECT
  id,
  created_at,
  LEFT(message_text, 100) as message_preview,
  verdict,
  confidence,
  risk_level,
  reasons
FROM public.scam_scans
WHERE risk_level = 'high' AND verdict = 'scam'
ORDER BY created_at DESC
LIMIT 100;

-- Enable Row Level Security (RLS)
ALTER TABLE public.scam_scans ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for logging scans)
CREATE POLICY "Allow anonymous inserts" ON public.scam_scans
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow service role full access
CREATE POLICY "Service role has full access" ON public.scam_scans
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Users can only read their own scans (if user_id is set)
CREATE POLICY "Users can read own scans" ON public.scam_scans
  FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Optional: Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_scan_stats(p_user_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_scans', COUNT(*),
    'scams_detected', COUNT(*) FILTER (WHERE verdict = 'scam'),
    'suspicious_count', COUNT(*) FILTER (WHERE verdict = 'suspicious'),
    'safe_count', COUNT(*) FILTER (WHERE verdict = 'likely_legitimate'),
    'avg_confidence', AVG(confidence),
    'last_scan', MAX(created_at)
  )
  INTO result
  FROM public.scam_scans
  WHERE user_id = p_user_id;

  RETURN result;
END;
$$;

-- Create a function to clean old anonymous scans (optional, for data management)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_scans(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.scam_scans
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    AND user_id IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.scam_scans TO anon;
GRANT SELECT ON public.scam_statistics TO anon;
GRANT SELECT ON public.recent_high_risk_scams TO anon;
