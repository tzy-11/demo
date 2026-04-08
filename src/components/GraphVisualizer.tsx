import React, { useCallback, useEffect } from 'react';
import type { Node, Edge } from 'reactflow';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { GraphData, GraphNode, GraphEdge } from '../types/memory';

interface GraphVisualizerProps {
  graphData: GraphData;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string;
}

// 获取节点颜色
const getNodeColor = (type: string) => {
  switch (type) {
    case 'character':
      return '#a78bfa'; // 紫色
    case 'event':
      return '#60a5fa'; // 蓝色
    case 'setting':
      return '#34d399'; // 绿色
    default:
      return '#9ca3af';
  }
};


const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  graphData,
  onNodeClick,
  selectedNodeId,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 将 GraphData 转换为 ReactFlow 格式
  useEffect(() => {
    const reactFlowNodes: Node[] = graphData.nodes.map((gNode: GraphNode) => ({
      id: gNode.id,
      data: {
        label: gNode.label,
        type: gNode.type,
        conflictCount: gNode.metadata?.conflictCount || 0,
        relatedCount: gNode.metadata?.relatedCount || 0,
      },
      position: {
        x: Math.random() * 800,
        y: Math.random() * 600,
      },
      style: {
        background: getNodeColor(gNode.type),
        color: 'white',
        border: selectedNodeId === gNode.id ? '3px solid red' : '2px solid #ccc',
        borderRadius: '8px',
        padding: '10px 15px',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center',
        cursor: 'pointer',
        minWidth: '100px',
      },
    }));

    const reactFlowEdges: Edge[] = graphData.edges.map((gEdge: GraphEdge) => ({
      id: gEdge.id,
      source: gEdge.source,
      target: gEdge.target,
      label: gEdge.label,
      animated: true,
      style: {
        stroke: gEdge.type === 'conflicts_with' ? '#ef4444' : '#666',
        strokeWidth: 2,
      },
      markerEnd: gEdge.type === 'conflicts_with' ? 'arrowclosed' : 'arrowclosed',
    }));

    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }, [graphData, selectedNodeId, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default GraphVisualizer;
