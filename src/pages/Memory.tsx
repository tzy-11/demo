import React, { useState, useEffect } from 'react';
import useMemoryStore from '../stores/memoryStoreV2';
import GraphVisualizer from '../components/GraphVisualizer';
import type {
  EnhancedSearchResult,
  ConflictIssue,
  GraphData,
} from '../types/memory';

type TabType = 'list' | 'search' | 'conflicts' | 'graph';

const Memory: React.FC = () => {
  const store = useMemoryStore();
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [selectedStoryId, setSelectedStoryId] = useState<'all' | string>('all');

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EnhancedSearchResult[]>([]);
  const [searchType, setSearchType] = useState<'all' | 'character' | 'event' | 'setting'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'updated' | 'created'>('relevance');

  // 冲突相关状态
  const [conflicts, setConflicts] = useState<ConflictIssue[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warn'>('all');

  // 图谱数据
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<any>(null);

  // 相关记忆
  const [relatedMemories, setRelatedMemories] = useState<any[]>([]);

  const storyIds = Array.from(
    new Set([
      ...store.characters.map((item) => item.storyId),
      ...store.events.map((item) => item.storyId),
      ...store.settings.map((item) => item.storyId),
    ])
  ).filter((storyId): storyId is string => Boolean(storyId) && storyId !== 'all');

  // 初始化：自动重建索引和检测冲突
  useEffect(() => {
    refreshData();
  }, [
    store.characters.length,
    store.events.length,
    store.settings.length,
    store.relations.length,
    selectedStoryId,
  ]);

  // 刷新所有数据
  const refreshData = () => {
    store.rebuildIndex();
    const newConflicts = store.detectConflicts().filter(
      (item) => selectedStoryId === 'all' || item.storyId === selectedStoryId
    );
    setConflicts(newConflicts);
    const rawGraphData = store.getGraphData();
    const newGraphData =
      selectedStoryId === 'all'
        ? rawGraphData
        : {
            nodes: rawGraphData.nodes.filter((item) => item.data.storyId === selectedStoryId),
            edges: rawGraphData.edges.filter((edge) => {
              const sourceNode = rawGraphData.nodes.find((item) => item.id === edge.source);
              const targetNode = rawGraphData.nodes.find((item) => item.id === edge.target);
              return sourceNode?.data.storyId === selectedStoryId && targetNode?.data.storyId === selectedStoryId;
            }),
          };
    setGraphData(newGraphData);
  };

  // 执行搜索
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = store.advancedSearch(searchQuery, {
      types: searchType === 'all' ? undefined : ([searchType] as any),
      sortBy,
      limit: 50,
      storyId: selectedStoryId === 'all' ? undefined : selectedStoryId,
    });
    setSearchResults(results);
  };
  const filteredCharacters =
    selectedStoryId === 'all'
      ? store.characters
      : store.characters.filter((item) => item.storyId === selectedStoryId);
  const filteredEvents =
    selectedStoryId === 'all'
      ? store.events
      : store.events.filter((item) => item.storyId === selectedStoryId);
  const filteredSettings =
    selectedStoryId === 'all'
      ? store.settings
      : store.settings.filter((item) => item.storyId === selectedStoryId);


  // 处理图谱节点点击
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);

    // 查找对应的实体和类型
    let selectedEntity: any = null;
    let entityType: 'character' | 'event' | 'setting' | null = null;

    const character = store.characters.find((c) => c.id === nodeId);
    if (character) {
      selectedEntity = character;
      entityType = 'character';
    }

    const event = store.events.find((e) => e.id === nodeId);
    if (event) {
      selectedEntity = event;
      entityType = 'event';
    }

    const setting = store.settings.find((s) => s.id === nodeId);
    if (setting) {
      selectedEntity = setting;
      entityType = 'setting';
    }

    if (selectedEntity && entityType) {
      setSelectedNodeDetail(selectedEntity);

      // 获取相关记忆
      const related = store.getRelatedMemories(nodeId, entityType);
      setRelatedMemories(related);
    }
  };

  // 过滤冲突
  const filteredConflicts =
    filterSeverity === 'all'
      ? conflicts
      : conflicts.filter((c) => c.severity === filterSeverity);

  // 高亮片段渲染
  const renderHighlight = (text: string, segments: any[]) => {
    if (!segments || segments.length === 0) return text;

    let lastIndex = 0;
    const parts = [];

    segments.sort((a, b) => a.startIndex - b.startIndex);

    segments.forEach((seg, idx) => {
      if (seg.startIndex > lastIndex) {
        parts.push(text.substring(lastIndex, seg.startIndex));
      }
      parts.push(
        <mark key={idx} className="bg-yellow-300">
          {seg.text}
        </mark>
      );
      lastIndex = seg.endIndex;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="max-w-full h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex overflow-hidden">
        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="bg-white shadow-sm border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <h1 className="text-4xl font-bold mb-6">记忆管理系统</h1>
              <div className="mb-4 max-w-xs">
                <label className="block text-sm font-medium mb-2">故事范围</label>
                <select
                  value={selectedStoryId}
                  onChange={(e) => setSelectedStoryId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">全部故事</option>
                  {storyIds.map((storyId, index) => (
                    <option key={`story-${storyId}-${index}`} value={storyId}>
                      {storyId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tab 导航 */}
              <div className="flex gap-4 border-b">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-6 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'list'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 列表 ({filteredCharacters.length + filteredEvents.length + filteredSettings.length})
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-6 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'search'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🔍 搜索 ({searchResults.length})
                </button>
                <button
                  onClick={() => setActiveTab('conflicts')}
                  className={`px-6 py-2 font-medium border-b-2 transition-colors relative ${
                    activeTab === 'conflicts'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ⚠️ 冲突 ({conflicts.length})
                  {conflicts.filter((c) => c.severity === 'error').length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {conflicts.filter((c) => c.severity === 'error').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`px-6 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'graph'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🕸️ 关系图 ({graphData.nodes.length} 节点)
                </button>
              </div>
            </div>
          </div>

          {/* Tab 内容 */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'list' && (
              <div className="max-w-7xl mx-auto p-6 space-y-6">
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-purple-600">👥 角色记忆 ({filteredCharacters.length})</h2>
                  <div className="grid gap-4">
                    {filteredCharacters.map((char) => (
                      <div key={char.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{char.name}</h3>
                          <span className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded">角色</span>
                        </div>
                        <p className="text-gray-700 mb-2">{char.description}</p>
                        <div className="text-sm text-gray-500">
                          <p>性格: {char.personality.join(', ')}</p>
                          <p>背景: {char.background}</p>
                          <p>故事: {char.storyId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-blue-600">📅 事件记忆 ({filteredEvents.length})</h2>
                  <div className="grid gap-4">
                    {filteredEvents.map((event) => (
                      <div key={event.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <div className="flex gap-2">
                            {event.isForeshadowing && <span className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded">伏笔</span>}
                            <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">事件</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{event.description}</p>
                        <p className="text-sm text-gray-500">📍 {event.location} • 🕐 {event.timestamp}</p>
                        <p className="text-xs text-gray-500 mt-1">故事: {event.storyId}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-green-600">🌍 设定记忆 ({filteredSettings.length})</h2>
                  <div className="grid gap-4">
                    {filteredSettings.map((setting) => (
                      <div key={setting.id} className="border border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{setting.name}</h3>
                          <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded">{setting.settingType}</span>
                        </div>
                        <p className="text-gray-700">{setting.description}</p>
                        <p className="text-xs text-gray-500 mt-1">故事: {setting.storyId}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div className="bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-bold mb-4">高级搜索</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">搜索词</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="输入搜索内容..."
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">类型</label>
                      <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as any)}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="all">全部</option>
                        <option value="character">角色</option>
                        <option value="event">事件</option>
                        <option value="setting">设定</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">排序</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="relevance">相关度</option>
                        <option value="updated">最近更新</option>
                        <option value="created">最新创建</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    搜索
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">搜索结果 ({searchResults.length})</h3>
                  {searchResults.map((result, idx) => {
                    const memory = result.memory as any;
                    return (
                      <div key={idx} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg">
                            {memory.name || memory.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                              相关度: {(result.score * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                              {memory.type}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">
                          {renderHighlight(memory.description, result.segments)}
                        </p>
                        <p className="text-xs text-gray-500">匹配字段: {result.fields.join(', ')}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'conflicts' && (
              <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setFilterSeverity('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterSeverity === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    全部 ({conflicts.length})
                  </button>
                  <button
                    onClick={() => setFilterSeverity('error')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterSeverity === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    错误 ({conflicts.filter((c) => c.severity === 'error').length})
                  </button>
                  <button
                    onClick={() => setFilterSeverity('warn')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterSeverity === 'warn'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    警告 ({conflicts.filter((c) => c.severity === 'warn').length})
                  </button>
                </div>

                {filteredConflicts.length === 0 ? (
                  <div className="text-center text-green-600 py-8 text-xl">✅ 没有检测到冲突！</div>
                ) : (
                  <div className="space-y-4">
                    {filteredConflicts.map((conflict) => (
                      <div
                        key={conflict.id}
                        className={`border rounded-lg p-4 ${
                          conflict.severity === 'error'
                            ? 'border-red-300 bg-red-50'
                            : 'border-yellow-300 bg-yellow-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{conflict.description}</h3>
                            <p className="text-sm text-gray-600">规则: {conflict.ruleType}</p>
                          </div>
                          <div className="flex gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded font-semibold ${
                                conflict.severity === 'error'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-yellow-200 text-yellow-800'
                              }`}
                            >
                              {conflict.severity === 'error' ? '❌ 错误' : '⚠️ 警告'}
                            </span>
                            {conflict.resolved && (
                              <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded">
                                ✅ 已解决
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 bg-white p-3 rounded border-l-4 border-blue-500">
                          <h4 className="font-semibold mb-2 text-sm">修复建议:</h4>
                          {conflict.suggestedFixes.map((fix, idx) => (
                            <div key={idx} className="mb-3">
                              <p className="font-medium text-sm">{fix.description}</p>
                              <ul className="ml-4 text-xs text-gray-600 mt-1">
                                {fix.actions.map((action, i) => (
                                  <li key={i}>• {action}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {!conflict.resolved && (
                            <button
                              onClick={() => {
                                store.resolveConflict(conflict.id);
                                setConflicts(store.conflicts);
                              }}
                              className="mt-3 text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              标记为已解决
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="w-full h-full flex gap-6 p-6">
                <div className="flex-1 rounded-lg border bg-white shadow-md overflow-hidden">
                  <GraphVisualizer
                    graphData={graphData}
                    onNodeClick={handleNodeClick}
                    selectedNodeId={selectedNodeId}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧详情面板（图谱 Tab 时显示）*/}
        {activeTab === 'graph' && selectedNodeId && selectedNodeDetail && (
          <div className="w-80 bg-white border-l shadow-lg overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-gray-50">
              <button
                onClick={() => {
                  setSelectedNodeId(undefined);
                  setSelectedNodeDetail(null);
                  setRelatedMemories([]);
                }}
                className="text-gray-500 hover:text-gray-700 float-right text-2xl"
              >
                ✕
              </button>
              <h3 className="text-lg font-bold text-gray-800">详情</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* 节点基本信息 */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">类型</p>
                <p className="font-semibold capitalize">
                  {selectedNodeDetail.type === 'character'
                    ? '👥 角色'
                    : selectedNodeDetail.type === 'event'
                    ? '📅 事件'
                    : '🌍 设定'}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">名称/标题</p>
                <p className="font-semibold text-lg">
                  {selectedNodeDetail.name || selectedNodeDetail.title}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">描述</p>
                <p className="text-sm text-gray-700">{selectedNodeDetail.description}</p>
              </div>

              {/* 额外信息（按类型） */}
              {selectedNodeDetail.type === 'character' && (
                <>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-500 mb-1">性格特点</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedNodeDetail.personality.map((trait: string, idx: number) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-500 mb-1">背景故事</p>
                    <p className="text-sm text-gray-700">{selectedNodeDetail.background}</p>
                  </div>
                </>
              )}

              {selectedNodeDetail.type === 'event' && (
                <>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 mb-1">时间</p>
                    <p className="text-sm text-gray-700">{selectedNodeDetail.timestamp}</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 mb-1">地点</p>
                    <p className="text-sm text-gray-700">{selectedNodeDetail.location}</p>
                  </div>

                  {selectedNodeDetail.isForeshadowing && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-600 font-semibold">🔔 这是一个伏笔</p>
                      {selectedNodeDetail.isResolved && (
                        <p className="text-xs text-green-600 mt-1">✅ 已回收</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {selectedNodeDetail.type === 'setting' && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">设定类型</p>
                  <p className="text-sm text-gray-700 capitalize">{selectedNodeDetail.settingType}</p>
                </div>
              )}

              {/* 相关记忆 */}
              <div className="border-t pt-4">
                <h4 className="font-bold mb-3 text-gray-800">相关记忆</h4>
                {relatedMemories.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">无相关记忆</p>
                ) : (
                  <div className="space-y-2">
                    {relatedMemories.map((related, idx) => {
                      const mem = related.memory as any;
                      return (
                        <div key={idx} className="p-2 bg-gray-50 rounded border text-xs">
                          <p className="font-semibold text-gray-800">{mem.name || mem.title}</p>
                          <p className="text-gray-600">{mem.type}</p>
                          <p className="text-gray-500">相关度: {(related.score * 100).toFixed(0)}%</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Memory;
