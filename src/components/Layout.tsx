import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">AI 叙事创作平台</h1>
          <nav className="flex space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
              首页
            </Link>
            <Link to="/stories" className="px-3 py-2 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
              作品库
            </Link>
            <Link to="/editor" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
              创作工作台
            </Link>
            <Link to="/player" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
              互动播放器
            </Link>
            <Link to="/memory" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
              记忆管理
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          AI 叙事创作平台 &copy; 2026
        </div>
      </footer>
    </div>
  );
};

export default Layout;