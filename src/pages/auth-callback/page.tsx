import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('正在确认邮箱并恢复登录状态...');

  useEffect(() => {
    const finish = async () => {
      const code = new URLSearchParams(window.location.search).get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(`邮箱确认失败：${error.message}`);
          return;
        }
      }

      window.setTimeout(() => navigate('/', { replace: true }), 500);
    };

    finish();
  }, [navigate]);

  return (
    <main className="min-h-screen bg-theme-bg flex items-center justify-center px-6 text-center">
      <div>
        <div className="w-9 h-9 mx-auto mb-4 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-theme-text-secondary">{message}</p>
      </div>
    </main>
  );
}
