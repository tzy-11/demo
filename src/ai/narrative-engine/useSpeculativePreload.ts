import { useEffect } from 'react';
import { useInteractionStore } from '../../stores/interactionStore';
import type { StoryNode } from '../../types/interaction';
import { v4 as uuidv4 } from 'uuid';
import { claudeAPI } from './claude-api';

export const useSpeculativePreload = () => {
  const { currentNodeId, nodes, addPreloadedNode, setIsPreloading } = useInteractionStore();

  useEffect(() => {
    if (!currentNodeId) return;

    const currentNode = nodes[currentNodeId];
    if (!currentNode) return;

    // 当玩家停留在一个节点超过 1 秒后开始预加载
    const timer = setTimeout(() => {
      // 遍历当前节点的所有有效 choices
      currentNode.choices.forEach((choice) => {
        // 跳过隐藏的选项
        if (choice.isHidden) return;

        // 设置预加载状态
        setIsPreloading(true);

        // 调用 AI 生成故事内容
        const generateStory = async () => {
          try {
            // 构建故事生成请求
            const request = {
              prompt: `${currentNode.content}\n\n玩家选择：${choice.text}`,
              style: 'default',
              maxLength: 1000,
              temperature: 0.7
            };

            // 调用 AI API 生成故事
            const response = await claudeAPI.generateStory(request);

            // 解析生成的选项
            const generatedChoices = response.options.map((option) => {
              // 移除选项前面的数字和点
              const text = option.replace(/^\d+\.\s*/, '');
              return {
                id: uuidv4(),
                text,
                hint: `选择此选项将${text.toLowerCase()}`
              };
            });

            // 生成虚拟的 StoryNode
            const preloadedNode: StoryNode = {
              id: uuidv4(),
              title: `章节 - ${choice.text.substring(0, 20)}...`,
              content: response.story,
              choices: generatedChoices.length > 0 ? generatedChoices : [
                {
                  id: uuidv4(),
                  text: '继续前进',
                  hint: '继续故事的发展'
                },
                {
                  id: uuidv4(),
                  text: '仔细观察',
                  hint: '查看周围的环境'
                },
                {
                  id: uuidv4(),
                  text: '与他人交谈',
                  hint: '与周围的角色交流'
                }
              ],
              parentId: currentNodeId,
              createdAt: Date.now()
            };

            // 调用 addPreloadedNode 存入 Store
            addPreloadedNode(choice.id, preloadedNode);
          } catch (error) {
            console.error('AI 生成故事失败:', error);
            // 生成默认内容作为后备
            const preloadedNode: StoryNode = {
              id: uuidv4(),
              title: `章节 - ${choice.text.substring(0, 20)}...`,
              content: `这是选择 "${choice.text}" 后的故事内容。AI 生成失败，这是默认内容。`,
              choices: [
                {
                  id: uuidv4(),
                  text: '继续探索',
                  hint: '深入了解这个选择带来的后果'
                },
                {
                  id: uuidv4(),
                  text: '回头看看',
                  hint: '重新考虑之前的选择'
                },
                {
                  id: uuidv4(),
                  text: '询问更多信息',
                  hint: '获取更多关于当前情况的细节'
                }
              ],
              parentId: currentNodeId,
              createdAt: Date.now()
            };
            addPreloadedNode(choice.id, preloadedNode);
          } finally {
            // 重置预加载状态
            setIsPreloading(false);
          }
        };

        // 执行故事生成
        generateStory();
      });
    }, 1000); // 1 秒后开始预加载

    return () => clearTimeout(timer);
  }, [currentNodeId, nodes, addPreloadedNode, setIsPreloading]);
};
