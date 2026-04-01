import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { StoryNode } from '../types/interaction';

interface SaveLoadManagerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
  currentNodeId: string | null;
  nodes: Record<string, StoryNode>;
  onSave: (slotId: string, name: string, data: { currentNodeId: string; nodes: Record<string, StoryNode> }) => void;
  onLoad: (slotId: string) => void;
}

export const SaveLoadManager: React.FC<SaveLoadManagerProps> = ({
  isOpen,
  onClose,
  mode,
  currentNodeId,
  nodes,
  onSave,
  onLoad
}) => {
  const [saveName, setSaveName] = useState('');

  // 避免在服务端渲染时报错
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen) return null;

  const slots = ['1', '2', '3', '4', '5', '6'];

  const getSaveData = (slotId: string) => {
    try {
      const data = localStorage.getItem(`storySave_${slotId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  // 👉 核心：极其暴力的内联样式，绝对保证全屏显示
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 2147483647, // 浏览器允许的最大图层高度
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '16px',
    padding: '24px',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  };

  const modalContent = (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        
        {/* 头部区域 */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-stone-800">
            {mode === 'save' ? '💾 记录进度 (存档)' : '📖 回溯时间 (读档)'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-red-500 text-3xl font-light leading-none"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        {/* 存档槽位网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot) => {
            const data = getSaveData(slot);
            return (
              <div
                key={slot}
                className="p-4 border-2 border-stone-200 rounded-xl flex flex-col justify-between bg-stone-50 hover:border-stone-400 transition-all min-h-[120px]"
              >
                {/* 槽位头部 */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-stone-600 bg-stone-200 px-2 py-1 rounded">
                    槽位 {slot}
                  </span>
                  {data && (
                    <span className="text-xs text-stone-400 font-mono">
                      {new Date(data.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* 槽位内容 */}
                <div className="flex-grow py-2">
                  {data ? (
                    <div>
                      <div className="font-bold text-stone-800 text-lg">{data.saveName}</div>
                      <div className="text-sm text-stone-500 mt-1">
                        剧情进度已保存
                      </div>
                    </div>
                  ) : (
                    <div className="text-stone-400 font-medium italic">
                      — 空白槽位 —
                    </div>
                  )}
                </div>

                {/* 槽位操作按钮 */}
                <div className="mt-2 pt-3 border-t border-stone-200">
                  {mode === 'save' ? (
                    <button
                      onClick={() => {
                        if (!currentNodeId) return;
                        const finalName = saveName.trim() || `剧情存档 ${slot}`;
                        onSave(slot, finalName, { currentNodeId, nodes });
                        setSaveName('');
                        onClose();
                      }}
                      className="w-full py-2 bg-stone-800 text-white font-bold rounded-lg text-sm hover:bg-black transition-colors"
                    >
                      {data ? '覆盖此存档' : '存入当前进度'}
                    </button>
                  ) : (
                    <button
                      disabled={!data}
                      onClick={() => {
                        onLoad(slot);
                        onClose();
                      }}
                      className={`w-full py-2 font-bold rounded-lg text-sm transition-colors ${
                        data ? 'bg-stone-800 text-white hover:bg-black cursor-pointer' : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {data ? '读取此进度' : '无进度可读'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部输入框 (仅存档模式显示) */}
        {mode === 'save' && (
          <div className="mt-6 pt-4 border-t-2 border-stone-100">
            <input
              type="text"
              placeholder="为本次存档起个名字吧（选填）..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-stone-800 bg-stone-50"
            />
          </div>
        )}

      </div>
    </div>
  );

  // 保证组件挂载后才执行传送门（防止 React 报错）
  if (!mounted) return null;
  return createPortal(modalContent, document.body);
};