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
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "请输入消息内容" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 使用文心一言大模型进行对话
    const { data, error } = await supabase.functions.invoke("wenxin-text-generation", {
      body: {
        prompt: `你是一个台风知识学习助手，专门帮助用户了解台风的形成、结构、等级划分和防御措施等知识。请用简洁、准确、友好的方式回答用户的问题。如果用户问的问题与台风无关，请礼貌地引导话题回到台风知识上。

用户问题：${message}`,
      },
    });

    if (error) {
      console.error("文心一言调用失败:", error);
      // 降级回复
      return new Response(
        JSON.stringify({
          reply: generateFallbackReply(message),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reply = data?.text || generateFallbackReply(message);

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("AI聊天服务错误:", err);
    return new Response(
      JSON.stringify({ error: "服务暂时不可用，请稍后再试" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackReply(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('形成') || lowerMsg.includes('怎么来') || lowerMsg.includes('产生')) {
    return '台风的形成需要四个基本条件：1) 广阔的高温洋面（海水温度≥26.5℃）；2) 足够的地转偏向力（一般形成于南北纬5°以上）；3) 初始扰动（热带涡旋）；4) 垂直风切变小。温暖的海水为台风提供水汽和能量，地转偏向力使其旋转，最终形成强大的热带气旋。';
  }
  if (lowerMsg.includes('结构') || lowerMsg.includes('组成') || lowerMsg.includes('台风眼')) {
    return '台风由三部分组成：1) 台风眼 - 中心区域，天气晴朗、风力微弱；2) 眼墙 - 环绕台风眼的环状区域，风力最强、降雨最剧烈；3) 外围螺旋雨带 - 从眼墙向外延伸的螺旋状云带，会带来暴雨。';
  }
  if (lowerMsg.includes('等级') || lowerMsg.includes('分类') || lowerMsg.includes('级别')) {
    return '台风按中心附近最大风力分为6个等级：热带低压(6-7级)、热带风暴(8-9级)、强热带风暴(10-11级)、台风(12-13级)、强台风(14-15级)、超强台风(16级及以上)。';
  }
  if (lowerMsg.includes('防御') || lowerMsg.includes('防范') || lowerMsg.includes('安全')) {
    return '台风防御要点：来临前关注预警、加固门窗、储备物资；来临时留在室内、远离窗户、切断电源；过后注意防范次生灾害、检查安全状况。';
  }
  if (lowerMsg.includes('能量') || lowerMsg.includes('热量')) {
    return '台风的能量主要来源于海洋热量。温暖的海水蒸发大量水汽，这些水汽在上升过程中凝结释放潜热，为台风提供持续的能量来源。一个成熟台风释放的能量相当于每20分钟引爆一颗1000万吨当量的原子弹。';
  }

  return '感谢你的提问！关于台风知识，你可以问我：台风是怎么形成的？台风的结构是怎样的？台风有哪些等级？如何防御台风？我会尽力为你解答。';
}