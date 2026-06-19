import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { Save } from 'lucide-react';

interface AIConfig {
  endpoint: string;
  model: string;
  temperature: number;
}

export default function APIConfigPage() {
  const [config, setConfig] = useState<AIConfig>({
    endpoint: '',
    model: 'wenxin',
    temperature: 0.7,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'ai_chat_config')
          .single();

        if (data?.value) {
          const v = data.value as Record<string, unknown>;
          setConfig({
            endpoint: (v.endpoint as string) || '',
            model: (v.model as string) || 'wenxin',
            temperature: (v.temperature as number) ?? 0.7,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config.endpoint.trim()) {
      toast.error('API 端点地址不能为空');
      return;
    }
    if (!config.endpoint.startsWith('http')) {
      toast.error('API 端点地址必须以 http 或 https 开头');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-save-config', {
        body: {
          key: 'ai_chat_config',
          value: {
            endpoint: config.endpoint,
            model: config.model,
            temperature: config.temperature,
          },
        },
      });

      if (error || !data?.success) {
        toast.error(error?.message || data?.error || '保存失败');
        return;
      }

      toast.success('配置已保存');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">API配置</h1>
          <p className="text-sm text-muted-foreground">配置AI对话代理的API参数</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-1" />
          {saving ? '保存中...' : '保存配置'}
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">加载中...</div>
      ) : (
        <Card className="border border-border max-w-2xl">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">API 端点地址</label>
              <Input
                value={config.endpoint}
                onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://api.example.com/chat"
              />
              <p className="text-xs text-muted-foreground">
                AI 对话代理的服务端点，当前默认使用平台的 Edge Function
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">模型名称</label>
              <Input
                value={config.model}
                onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                placeholder="wenxin"
              />
              <p className="text-xs text-muted-foreground">
                使用的AI模型标识，如 wenxin、gpt-4 等
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">温度参数 (Temperature)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={config.temperature}
                  onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">{config.temperature}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                控制生成文本的随机性，0表示最确定，2表示最随机
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border max-w-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">当前配置状态</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p><span className="font-medium text-foreground">端点：</span>{config.endpoint || '未配置'}</p>
          <p><span className="font-medium text-foreground">模型：</span>{config.model}</p>
          <p><span className="font-medium text-foreground">温度：</span>{config.temperature}</p>
        </CardContent>
      </Card>
    </div>
  );
}