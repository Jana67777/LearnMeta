import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { trackAction } from '@/utils/behaviorTracker';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CloudLightning } from 'lucide-react';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { signInWithUsername, signUpWithUsername } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginForm>({
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    const username = values.username.trim();
    if (!username || !/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('用户名只能包含字母、数字和下划线');
      return;
    }

    if (values.password.length < 6) {
      toast.error('密码长度至少6位');
      return;
    }

    setLoading(true);
    try {
      let error;
      if (isRegister) {
        const result = await signUpWithUsername(username, values.password);
        error = result.error;
        if (!error) {
          trackAction('login', { username, isRegister: true });
          toast.success('注册成功，已自动登录');
        }
      } else {
        const result = await signInWithUsername(username, values.password);
        error = result.error;
        if (!error) {
          trackAction('login', { username, isRegister: false });
          toast.success('登录成功');
        }
      }

      if (error) {
        toast.error(error.message || '操作失败，请重试');
        return;
      }

      // 获取用户角色并跳转
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/learn');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border border-border">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <CloudLightning className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">LearnMeta</CardTitle>
          <CardDescription className="text-muted-foreground">
            {isRegister ? '创建新账号开始学习之旅' : '登录以继续学习'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                rules={{ required: '请输入用户名' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入用户名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                rules={{ required: '请输入密码' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="请输入密码" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '处理中...' : isRegister ? '注册' : '登录'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isRegister ? '已有账号？' : '没有账号？'}
            <Button
              variant="link"
              className="px-1 text-primary"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? '立即登录' : '立即注册'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}