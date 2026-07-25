import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useTheme } from '@/hooks/useAuth';
import LoginModal from './LoginModal';

const navTabs = [
  { id: 'square', label: '经验广场', path: '/' },
  { id: 'create', label: '创建经验卡', path: '/create' },
  { id: 'community', label: '社区共创', path: '/community' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/community') return 'community';
    if (path === '/create') return 'create';
    return 'square';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tab: (typeof navTabs)[0]) => {
    navigate(tab.path);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    await signOut();
    setAvatarMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-theme-bg-secondary/95 backdrop-blur-xl border-b border-theme-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-site mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 cursor-pointer group"
              aria-label="Experience Card 首页"
            >
              <img
                src="/experience-card-logo.png"
                alt="Experience Card"
                className="w-6 h-6 flex-shrink-0"
              />
              <span className="font-heading font-bold text-theme-text text-sm tracking-tight group-hover:text-theme-accent transition-colors whitespace-nowrap">
                Experience Card
              </span>
            </button>

            {/* Desktop Nav Tabs - centered with create button */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center gap-0.5">
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-heading font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                          ? tab.id === 'create'
                          ? 'bg-theme-accent text-white'
                          : 'bg-theme-bg-card-alt text-theme-text'
                        : tab.id === 'create'
                          ? 'text-theme-accent hover:text-theme-accent-hover'
                          : 'text-theme-text-secondary hover:text-theme-text'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-theme-bg-card-alt text-theme-text-secondary hover:text-theme-text"
                aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
              >
                {theme === 'light' ? (
                  <i className="ri-moon-line text-sm" />
                ) : (
                  <i className="ri-sun-line text-sm" />
                )}
              </button>

              {/* My Cards */}
              <button
                onClick={() => navigate('/my-cards')}
                className="text-sm text-theme-text-secondary hover:text-theme-text transition-colors cursor-pointer whitespace-nowrap"
              >
                我的名片
              </button>

              {/* User Avatar / Login */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-theme-bg-card-alt border border-theme-border-accent"
                    aria-label="用户菜单"
                  >
                    <span className="text-xs font-heading font-bold text-theme-accent">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-theme-bg-card-alt"
                    aria-label="用户"
                  >
                    <i className="ri-user-line text-sm text-theme-text-secondary" />
                  </button>
                )}

                {avatarMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAvatarMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-theme-bg-card border border-theme-border rounded-xl w-48 p-1 z-50 shadow-lg transition-colors duration-300">
                      {user ? (
                        <>
                          <div className="px-3 py-2 border-b border-theme-border-secondary mb-1">
                            <p className="text-xs font-heading font-semibold text-theme-text truncate">
                              {user.email}
                            </p>
                          </div>
                          <button
                            onClick={() => { navigate('/my-cards'); setAvatarMenuOpen(false); }}
                            className="w-full text-left px-3 py-2 text-xs text-theme-text hover:bg-theme-bg-card-alt rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <i className="ri-file-list-3-line text-sm text-theme-text-secondary" />
                            我的经验名片
                          </button>
                          <button
                            onClick={() => { navigate('/my-cards'); setAvatarMenuOpen(false); }}
                            className="w-full text-left px-3 py-2 text-xs text-theme-text hover:bg-theme-bg-card-alt rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <i className="ri-draft-line text-sm text-theme-text-secondary" />
                            我的草稿
                          </button>
                          <div className="h-px bg-theme-border-secondary my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-xs text-theme-text-secondary hover:bg-theme-bg-card-alt rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <i className="ri-logout-box-line text-sm" />
                            退出登录
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setAvatarMenuOpen(false); setLoginOpen(true); }}
                          className="w-full text-left px-3 py-2 text-xs text-theme-text-secondary hover:bg-theme-bg-card-alt rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <i className="ri-login-box-line text-sm" />
                          登录 / 注册
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center gap-2">
              {/* Theme Toggle (mobile) */}
              <button
                onClick={toggleTheme}
                className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-theme-text-secondary"
                aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
              >
                {theme === 'light' ? (
                  <i className="ri-moon-line text-sm" />
                ) : (
                  <i className="ri-sun-line text-sm" />
                )}
              </button>

              <button
                onClick={() => navigate('/create')}
                className="px-3 py-1 bg-theme-accent text-white rounded-full text-xs font-heading font-semibold cursor-pointer whitespace-nowrap"
              >
                创建
              </button>
              <button
                className="w-7 h-7 flex items-center justify-center cursor-pointer text-theme-text-secondary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <i className="ri-menu-line text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-theme-bg-secondary border-t border-theme-border px-4 py-4 transition-colors duration-300">
            <div className="flex flex-col gap-2">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-heading font-medium transition-all cursor-pointer whitespace-nowrap text-left ${
                    activeTab === tab.id
                      ? tab.id === 'create'
                        ? 'bg-theme-accent text-white'
                        : 'bg-theme-bg-card-alt text-theme-text'
                      : tab.id === 'create'
                        ? 'text-theme-accent'
                        : 'text-theme-text-secondary hover:text-theme-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => { navigate('/my-cards'); setMobileMenuOpen(false); }}
                className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text transition-colors cursor-pointer text-left"
              >
                我的名片
              </button>
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text transition-colors cursor-pointer text-left"
                >
                  退出登录
                </button>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setLoginOpen(true); }}
                  className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text transition-colors cursor-pointer text-left"
                >
                  登录 / 注册
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        reason="登录后即可发布经验卡和参与社区共创"
      />
    </>
  );
}
