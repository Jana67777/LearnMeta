-- 用户行为追踪表
CREATE TABLE public.user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- 用户行为表 RLS 策略
CREATE POLICY "Users can insert their own actions" ON user_actions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own actions" ON user_actions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to user_actions" ON user_actions
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);