import { useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  ReactFlowProvider,
} from "@xyflow/react";
import {
  Button,
  addToast,

  Chip,
  Link,
} from "@heroui/react";
import { Edit, Trash } from "lucide-react";
import apiClient from "../api/ApiClient";
import AddInstanceModal from "./AddInstanceModal";
import AddDocumentModal from "./AddDocumentModal";
import dagre from "dagre";
import { Link as RouterLink } from "react-router-dom";
import EditNodeModal from "./EditNodeModal";
import DeleteNodeModal from "./DeleteNodeModal";

import { MapSelect } from "./MapSelect";
// Inside your NodeTree component, replace layoutNodes with:

// ---------- Node Types ----------
interface TreeNode {
  nodeId: string;
  title: string;
  description: string;
  isEquipment: boolean;
  documentCounts?: number;
  posX?: number;
  posY?: number;
  parentId?: string | null;
  children?: TreeNode[];
}

// ---------- Custom ReactFlow Node ----------
interface NodeCardData extends Record<string, unknown> {
  title: string;
  description: string;
  isEquipment: boolean;
  documentCounts?: number;
  onAddChild?: (parentId: string) => void;
  onAddDocument?: (nodeId: string) => void;
  onEditNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
}

// ---------- Custom ReactFlow Node ----------
const NodeCard = ({ data, id }: { data: NodeCardData; id: string }) => {
  const handleAddChild = () => data.onAddChild?.(id);
  const handleAddDocument = () => data.onAddDocument?.(id);
  const handleEditNode = () => data.onEditNode?.(id);
  const handleDeleteNode = () => data.onDeleteNode?.(id);
  // Decide background based on depth
  const bgColor = !data.isEquipment
    ? "bg-secondary text-white"
    : data.depth && (data.depth as any) % 2 === 0
    ? "bg-primary-800 text-white"
    : "bg-primary text-white";

  return (
    <div
      className={`relative w-64 rounded-md overflow-visible border border-default-200 shadow-sm`}
    >
      <div
        className={`flex ${bgColor} w-full p-1 rounded-t-md justify-between text-[.8rem] font-medium items-center px-2`}
      >
        <p>{data.title}</p>
        <div className="flex gap-1">
          <Edit
            className="w-3 cursor-pointer opacity-70 hover:opacity-100"
            onClick={handleEditNode} // Trigger edit on click
          />
          <Trash
            className="w-3 cursor-pointer opacity-70 hover:opacity-100"
            onClick={handleDeleteNode} // Open delete confirmation modal
          />
        </div>
      </div>
      <div className="flex flex-col p-2 text-[.7rem] text-default-700">
        {data.description && <p>{data.description}</p>}
        <div className="flex w-full justify-between">
          {data.documentCounts !== undefined && (
            <p className="mt-1 text-xs text-default-500">
              Documents: {data.documentCounts}
            </p>
          )}
          {data.isEquipment && (
            <Chip size="sm" className="text-[.5rem]" color="primary">
              equipment
            </Chip>
          )}
        </div>
        <div className="flex mt-2 justify-center">
          <Link
            className="text-[.6rem]"
            as={RouterLink}
            to={`/node/${data.nodeId}`}
          >
            Show all documents
          </Link>
        </div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="absolute top-full flex gap-1 mt-1 left-0">
        <Button
          onPress={handleAddChild}
          style={{ height: "20px" }}
          className="w-14 min-w-[unset] rounded-full border-1 border-default-200 text-[.5rem]"
        >
          Add Node
        </Button>
        <Button
          onPress={handleAddDocument}
          style={{ height: "20px" }}
          className="w-20 min-w-[unset] rounded-full border-1 border-default-200 text-[.5rem]"
        >
          Add Document
        </Button>
      </div>
    </div>
  );
};
// ---------- ReactFlow Node Types ----------
const nodeTypes: NodeTypes = {
  node: NodeCard,
};

// ---------- Main Tree ----------
function NodeTree() {
  const [nodes, setNodes] = useState<Node<NodeCardData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const rfRef = useRef<any>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editNodeModalOpen, setEditNodeModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const onEditNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setEditNodeModalOpen(true);
  };
  const onNodesChange = (changes: NodeChange<Node<NodeCardData>>[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as Node<NodeCardData>[]);
  };

  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));

  const onDeleteNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setDeleteModalOpen(true);
  };
  const refreshTree = async (mapId?: string | null) => {
    if (!mapId) {
      setNodes([]);
      setEdges([]);
      return;
    }

    try {
      const res = await apiClient.get<{ result: TreeNode[] }>(
        `/nodes/tree`,
        {
          params: { mapId },
        }
      );

      // 👇 everything below stays EXACTLY the same
      const layoutTreeWithDagre = (treeNodes: TreeNode[]) => {
        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir: "TB", ranksep: 100, nodesep: 50 });
        g.setDefaultEdgeLabel(() => ({}));

        const nodesMap: Record<string, Node<NodeCardData>> = {};
        const edgesArr: Edge[] = [];

        const traverse = (
          node: TreeNode,
          parentId: string | null = null,
          depth = 0
        ) => {
          nodesMap[node.nodeId] = {
            id: node.nodeId,
            type: "node",
            data: {
              title: node.title,
              description: node.description,
              isEquipment: node.isEquipment,
              nodeId: node.nodeId,
              documentCounts: node.documentCounts ?? 0,
              depth,
              onEditNode,
              onAddChild: (id: string) => {
                setParentId(id);
                setModalOpen(true);
              },
              onDeleteNode,
              onAddDocument: (id: string) => {
                setSelectedNodeId(id);
                setDocModalOpen(true);
              },
            },
            position: { x: 0, y: 0 },
          };

          g.setNode(node.nodeId, { width: 260, height: 140 });

          if (parentId) {
            edgesArr.push({
              id: `${parentId}-${node.nodeId}`,
              source: parentId,
              target: node.nodeId,
              style: { stroke: "#888" },
            });
            g.setEdge(parentId, node.nodeId);
          }

          node.children?.forEach((child) =>
            traverse(child, node.nodeId, depth + 1)
          );
        };

        treeNodes.forEach((root) => traverse(root));
        dagre.layout(g);

        return {
          nodes: Object.values(nodesMap).map((n) => {
            const pos = g.node(n.id);
            return {
              ...n,
              position: { x: pos.x - 130, y: pos.y - 70 },
            };
          }),
          edges: edgesArr,
        };
      };

      const { nodes, edges } = layoutTreeWithDagre(res.data.result);
      setNodes(nodes);
      setEdges(edges);

      setTimeout(() => rfRef.current?.fitView({ padding: 0.3 }), 300);
    } catch (err) {
      console.error(err);
      addToast({ title: "Failed to load node tree", color: "danger" });
    }
  };
  const refreshCurrentTree = async () => {
    refreshTree(selectedMapId);
  };

  useEffect(() => {
    refreshTree(selectedMapId);
  }, [selectedMapId]);

  return (
    <div style={{ flex: 1, height: "100vh", position: "relative" }}>
      {/* 🔹 Top Controls */}
      <div className="absolute w-full top-0 left-0 bg-transparent p-4 justify-between flex z-50">
        <MapSelect
          className="w-40"
          selectedMapId={selectedMapId}
          onSelectMap={(id) => {
            setSelectedMapId(id || null);
          }}
        />

        <Button
          color="primary"
          onPress={() => {
            setParentId(null);
            setModalOpen(true);
          }}
        >
          New Root
        </Button>
      </div>

      {/* 🔹 React Flow Canvas */}
      <ReactFlow
        ref={rfRef}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {/* 🔹 Add Node Modal */}
      <AddInstanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDone={refreshCurrentTree}
        parentId={parentId}
      />

      {/* 🔹 Add Document Modal */}
      <AddDocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        onDone={refreshCurrentTree}
        nodeId={selectedNodeId}
      />

      {selectedNodeId && (
        <EditNodeModal
          isOpen={editNodeModalOpen}
          onClose={() => setEditNodeModalOpen(false)}
          onDone={refreshCurrentTree}
          nodeId={selectedNodeId}
        />
      )}
      {selectedNodeId && (
        <DeleteNodeModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          nodeId={selectedNodeId}
          onDone={refreshCurrentTree}
        />
      )}
    </div>
  );
}

export default function NodesPage() {
  return (
    <ReactFlowProvider>
      <NodeTree />
    </ReactFlowProvider>
  );
}
