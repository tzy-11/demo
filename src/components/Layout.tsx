import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, Settings, Search, Bell, User, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 侧边导航项
  const sideNavItems = [
    { path: '/', icon: <Home className="w-5 h-5" />, label: '首页' },
    { path: '/editor', icon: <BookOpen className="w-5 h-5" />, label: '编辑器' },
    { path: '/player', icon: <Users className="w-5 h-5" />, label: '互动阅读' },
    { path: '/memory', icon: <Settings className="w-5 h-5" />, label: '回忆' }
  ];

  // 顶部导航项
  const topNavItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/speaking', label: 'Speaking' },
    { path: '/progress', label: 'Progress' },
    { path: '/courses', label: 'Courses' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f8f4ff] to-[#f0e8ff] text-[#1e1b4b] relative">
      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-16 bg-white shadow-lg fixed h-full z-20 flex flex-col items-center py-6">
          {/* Logo */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#9333ea] flex items-center justify-center mb-12">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          
          {/* 侧边导航 */}
          <nav className="space-y-6">
            {sideNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6d28d9]/10 to-[#9333ea]/10 text-[#6d28d9] shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-[#6d28d9] hover:shadow-sm'
                  }`
                }
                title={item.label}
              >
                {item.icon}
              </NavLink>
            ))}
          </nav>
          
          {/* 底部用户图标 */}
          <div className="mt-auto">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-300">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </aside>
        
        {/* 主内容区 */}
        <div className="flex-1 ml-16">
          {/* 顶部导航栏 */}
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              {/* 左侧菜单按钮（移动端） */}
              <button 
                className="md:hidden mr-4" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              {/* 顶部导航链接 */}
              <nav className="hidden md:flex items-center space-x-8">
                {topNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `font-medium transition-colors duration-300 ${
                        isActive
                          ? 'text-[#6d28d9] border-b-2 border-[#6d28d9]'
                          : 'text-gray-600 hover:text-[#6d28d9]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              
              {/* 右侧图标 */}
              <div className="flex items-center space-x-4">
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-300">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-300">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#9333ea] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </header>
          
          {/* 主要内容 */}
          <main className="relative z-10">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <Outlet />
            </div>
          </main>
          
          {/* 页脚 */}
          <footer className="relative z-10 border-t border-gray-200 mt-16 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="text-gray-600 text-sm">
                    © 2024 StoryWeaver. AI 互动故事平台
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <a href="#" className="text-gray-600 hover:text-[#6d28d9] text-sm transition-colors">
                    关于我们
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#6d28d9] text-sm transition-colors">
                    使用条款
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#6d28d9] text-sm transition-colors">
                    隐私政策
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      
      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden">
          <div className="bg-white h-full w-64 p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#9333ea] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">StoryWeaver</h1>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-4">
              {sideNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#6d28d9]/10 to-[#9333ea]/10 text-[#6d28d9]'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#6d28d9]'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              <div className="border-t border-gray-200 my-4"></div>
              {topNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#6d28d9]/10 to-[#9333ea]/10 text-[#6d28d9]'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#6d28d9]'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;