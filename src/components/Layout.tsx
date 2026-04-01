import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 纯文字导航项
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/editor', label: '编辑器' },
    { path: '/player', label: '互动阅读' },
    { path: '/memory', label: '回忆' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] relative">
      {/* 导航栏 - 纯文字浅色主题 */}
      <nav className="relative z-50 sticky top-0 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - 纯文字 */}
            <NavLink 
              to="/" 
              className="flex items-center"
            >
              <div>
                <h1 className="text-xl font-bold text-[#0f172a]">
                  StoryWeaver
                </h1>
                <p className="text-xs text-[#64748b] -mt-1">
                  AI 互动故事平台
                </p>
              </div>
            </NavLink>

            {/* 桌面端导航 - 纯文字 */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'text-[#8b5cf6] bg-[#f1f5f9] font-semibold'
                        : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* 移动端菜单按钮 - 纯文字 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden px-4 py-2 text-[#475569] hover:text-[#0f172a] font-medium"
            >
              {isMobileMenuOpen ? '关闭' : '菜单'}
            </button>
          </div>
        </div>

        {/* 移动端导航菜单 - 纯文字 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#e2e8f0] bg-white">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#8b5cf6] bg-[#f1f5f9] font-semibold'
                        : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* 主内容区 */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* 页脚 - 纯文字浅色主题 */}
      <footer className="relative z-10 border-t border-[#e2e8f0] mt-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-[#64748b] text-sm">
                © 2024 StoryWeaver. AI 互动故事平台
              </p>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-[#64748b] hover:text-[#0f172a] text-sm transition-colors">
                关于我们
              </a>
              <a href="#" className="text-[#64748b] hover:text-[#0f172a] text-sm transition-colors">
                使用条款
              </a>
              <a href="#" className="text-[#64748b] hover:text-[#0f172a] text-sm transition-colors">
                隐私政策
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;