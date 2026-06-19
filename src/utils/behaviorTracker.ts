import { supabase } from '@/db/supabase';

export type ActionType =
  | 'login'
  | 'logout'
  | 'expand_module'
  | 'collapse_module'
  | 'highlight_text'
  | 'underline_text'
  | 'add_note'
  | 'start_pre_test'
  | 'submit_pre_test'
  | 'start_post_test'
  | 'submit_post_test'
  | 'view_knowledge'
  | 'chat_message'
  | 'start_learning'
  | 'complete_learning'
  | 'celebration';

export async function trackAction(
  actionType: ActionType,
  actionData: Record<string, unknown> = {}
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  supabase.from('user_actions').insert({
    user_id: user.id,
    action_type: actionType,
    action_data: actionData,
  }).then(({ error }) => {
    if (error) {
      console.error('行为追踪失败:', error);
    }
  });
}

// 防抖版行为追踪（适合频繁触发的操作如展开/收起）
let debounceTimer: ReturnType<typeof setTimeout>;
export function trackActionDebounced(
  actionType: ActionType,
  actionData: Record<string, unknown> = {},
  delay = 500
) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    trackAction(actionType, actionData);
  }, delay);
}