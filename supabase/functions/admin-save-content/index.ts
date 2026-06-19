import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // 验证管理员权限
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "未授权" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "权限不足" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { items } = await req.json();
    if (!Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "数据格式错误" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 先清空再重新插入
    await supabase.from("knowledge_content").delete().neq("id", 0);

    for (const item of items) {
      await supabase.from("knowledge_content").insert({
        title: item.title,
        content: item.content,
        order_index: item.order_index ?? 0,
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("保存内容错误:", err);
    return new Response(JSON.stringify({ error: "服务错误" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});