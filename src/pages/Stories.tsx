import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryStore } from '../stores/storyStore';
import type { Story, StoryNode } from '../stores/storyStore';

const Stories: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stories = useStoryStore((state) => state.stories);
  const createStory = useStoryStore((state) => state.createStory);
  const deleteStory = useStoryStore((state) => state.deleteStory);
  const nodes = useStoryStore((state) => state.nodes);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newSummary, setNewSummary] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('请输入作品标题！');
      return;
    }
    createStory(newTitle, newAuthor || '匿名作者', newSummary);
    setIsModalOpen(false);
    setNewTitle('');
    setNewAuthor('');
    setNewSummary('');
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`确定要彻底删除作品《${title}》及其所有章节吗？此操作不可恢复！`)) {
      deleteStory(id);
    }
  };

  // 辅助函数：计算一部作品有多少个章节节点
  const getChapterCount = (storyId: string) => {
    return nodes.filter(node => node.storyId === storyId).length;
  };

  // 触发下载的通用函数
  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 导出全部数据
  const handleExportAll = () => {
    const state = useStoryStore.getState();
    downloadJson({ stories: state.stories, nodes: state.nodes }, 'all-stories.json');
  };

  // 导出一个作品
  const handleExportSingle = (storyId: string, title: string) => {
    const state = useStoryStore.getState();
    const story = state.stories.find(s => s.id === storyId);
    const storyNodes = state.nodes.filter(n => n.storyId === storyId);
    if (story) downloadJson({ stories: [story], nodes: storyNodes }, `story-${title}.json`);
  };

  // 导入 JSON 数据
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.stories && importedData.nodes) {
          const state = useStoryStore.getState();
          // 通过 ID 去重合并
          const newStories = importedData.stories.filter((is: Story) => !state.stories.some(s => s.id === is.id));
          const newNodes = importedData.nodes.filter((in_: StoryNode) => !state.nodes.some(n => n.id === in_.id));
          
          useStoryStore.setState({
            stories: [...state.stories, ...newStories],
            nodes: [...state.nodes, ...newNodes]
          });
          alert(`导入成功！新增了 ${newStories.length} 部作品，${newNodes.length} 个节点！`);
        } else {
          alert('导入的文件格式不符合规范！');
        }
      } catch (error) {
        alert('解析 JSON 失败，文件可能已损坏。');
      }
      // 重置 input 以便能反复导入同名文件
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">我的作品库</h1>
          <p className="text-gray-500 mt-2">管理您的所有互动叙事作品</p>
        </div>
        <div className="flex space-x-3 items-center">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition-colors"
          >
            导入数据
          </button>
          <button
            onClick={handleExportAll}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition-colors"
          >
            导出全库
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md shadow-md transition-colors"
          >
            + 新建作品
          </button>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 text-lg">您的作品库空空如也</p>
          <p className="text-sm text-gray-400 mt-2">点击右上方按钮开始创作第一部作品吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700">
              {/* 占位封面图区域 */}
              <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative">
                {story.coverUrl ? (
                  <img src={story.coverUrl} alt="封面" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-300 dark:text-gray-500 text-4xl">📚</span>
                )}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  共 {getChapterCount(story.id)} 章
                </div>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate" title={story.title}>{story.title}</h3>
                <p className="text-sm text-gray-500 mt-1">作者：{story.author}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-3 flex-grow">{story.summary || '暂无简介'}</p>
                
                <div className="text-xs text-gray-400 mt-4 mb-4">
                  最后更新: {new Date(story.updatedAt).toLocaleString()}
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-x-2">
                    {/* 我们给跳转按钮赋予了生命！带上 storyId 传送过去 */}
                    <button 
                      onClick={() => navigate(`/editor?storyId=${story.id}`)}
                      className="text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-md transition-colors"
                    >
                      去创作
                    </button>
                    <button 
                      onClick={() => navigate(`/player?storyId=${story.id}`)}
                      className="text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded-md transition-colors"
                    >
                      去体验
                    </button>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleExportSingle(story.id, story.title)}
                      className="text-sm text-blue-500 hover:text-blue-700 p-1"
                      title="导出单本作品 (JSON)"
                    >
                      💾
                    </button>
                    <button 
                      onClick={() => handleDelete(story.id, story.title)}
                      className="text-sm text-red-500 hover:text-red-700 p-1"
                      title="删除作品"
                    >
                      🗑️ 
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新建作品弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-4">新建作品</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">作品名称 *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="例如：赛博朋克2077外传"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">原案作者</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="例如：丛雨丸"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">一句话简介/背景设定</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 resize-none"
                  placeholder="写一句钩子，AI 会根据这段设定展开故事..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  立即创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;