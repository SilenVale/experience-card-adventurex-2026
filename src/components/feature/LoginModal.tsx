import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function LoginModal({ isOpen, onClose, reason }: LoginModalProps) {
  const { signIn, signUp, resendConfirmation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    if (mode === 'register') {
      const result = await signUp(email.trim(), password);
      if (result.error) {
        setError(result.error);
      } else {
        setRequiresEmailConfirmation(result.requiresEmailConfirmation);
        setSuccess(true);
      }
    } else {
      const result = await signIn(email.trim(), password);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
        resetForm();
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(false);
    setRequiresEmailConfirmation(false);
    setResendMessage(null);
    setMode('login');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setResendMessage(null);
    const result = await resendConfirmation(email.trim());
    setResendMessage(result.error ? result.error : '确认邮件已重新发送，请检查收件箱和垃圾邮件。');
    setLoading(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-[100] transition-opacity"
        onClick={handleClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[101] px-4">
        <div className="bg-theme-bg-card border border-theme-border-accent rounded-xl w-full max-w-sm p-6 shadow-lg transition-colors duration-300">
          {success ? (
            /* Register success */
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <i className="ri-check-line text-2xl text-theme-gold" />
              </div>
              <h3 className="font-heading font-bold text-theme-text text-base mb-1">
                注册成功
              </h3>
              <p className="text-xs text-theme-text-secondary mb-4">
                {requiresEmailConfirmation
                  ? `确认邮件已经发送到 ${email}。请先点击邮件里的确认链接，再回来登录。`
                  : '账号已经创建并登录，可以继续使用。'}
              </p>
              {requiresEmailConfirmation && (
                <>
                  <button
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    className="mb-3 w-full rounded-full border border-theme-border py-2 text-xs text-theme-text-secondary hover:text-theme-accent disabled:opacity-50"
                  >
                    {loading ? '正在重新发送…' : '没有收到？重新发送确认邮件'}
                  </button>
                  {resendMessage && (
                    <p className="mb-3 text-[11px] leading-relaxed text-theme-text-secondary">{resendMessage}</p>
                  )}
                </>
              )}
              <button
                onClick={() => { setSuccess(false); setMode('login'); }}
                className="px-5 py-2 bg-theme-accent text-white rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-theme-accent-hover transition-colors"
              >
                {requiresEmailConfirmation ? '我已确认邮箱，去登录' : '继续'}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-10 h-10 bg-theme-accent rounded-full flex items-center justify-center">
                    <i className="ri-user-line text-white text-base" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-theme-text text-base mb-1">
                  {mode === 'login' ? '登录 Experience Card' : '注册 Experience Card'}
                </h3>
                <p className="text-xs text-theme-text-secondary">
                  {reason || '登录后即可发布经验卡和参与社区共创'}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-theme-accent-subtle border border-theme-accent-light rounded-lg px-3 py-2 mb-3 text-xs text-theme-accent">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="邮箱地址"
                    autoComplete="email"
                    className="w-full bg-theme-bg-card-alt border border-theme-border-accent rounded-lg px-4 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors"
                  />
                </div>

                <div className="mb-4">
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密码（至少 6 位）"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full bg-theme-bg-card-alt border border-theme-border-accent rounded-lg px-4 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!email.trim() || !password.trim() || loading}
                  className={`w-full py-2.5 rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 mb-3 ${
                    email.trim() && password.trim() && !loading
                      ? 'bg-theme-accent text-white hover:bg-theme-accent-hover'
                      : 'bg-theme-accent-subtle text-theme-text-muted cursor-not-allowed'
                  }`}
                >
                  {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={switchMode}
                  className="text-xs text-theme-text-secondary hover:text-theme-accent cursor-pointer transition-colors"
                >
                  {mode === 'login' ? '没有账号？注册' : '已有账号？登录'}
                </button>
              </div>
            </>
          )}

          <button
            onClick={handleClose}
            className="mt-4 w-full py-2 text-xs text-theme-text-muted hover:text-theme-text-secondary cursor-pointer transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </>
  );
}
