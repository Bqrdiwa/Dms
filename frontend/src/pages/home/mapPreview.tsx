import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  useReactFlow,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useState } from "react";
import Marker from "./Marker";
import { getCategoryColor, type NodeItem } from "./SideBar";
import { Button, Chip, Tooltip } from "@heroui/react";
import { Link } from "react-router-dom";
import type { Category } from "./HomePage";

interface MapViewProps {
  mapUrl: string;
  selectedCategory?: string[];
  widthPx: number;
  heightPx: number;
  nodes: NodeItem[];
  focusNode?: NodeItem | null;
  categoryChips: Category[];
}

const MapNode = ({ data }: any) => {
  useEffect(() => {
    if (!data.nodes) return;

    data.nodes.forEach((node: NodeItem) => {
      if (data.focusNode?.nodeId === node.nodeId) {
        setTimeout(() => {
          if (data.focusNode?.nodeId === node.nodeId) {
            data.setIsOpen(node.nodeId);
          }
        }, 400);
      } else {
        data.setIsOpen(null);
      }
    });
  }, [data.focusNode, data.nodes]);

  return (
    <div
      style={{ position: "relative", width: data.width, height: data.height }}
    >
      <img
        src={data.src}
        alt="Map"
        style={{ width: data.width, height: data.height, userSelect: "none" }}
        draggable={false}
      />
      {data.nodes.map((node: NodeItem) => {
        const x = node.posX * data.width;
        const y = node.posY * data.height;
        const isFocused = data.isOpen === node.nodeId;

        return (
          <Tooltip
            key={node.nodeId}
            showArrow
            placement="left"
            isOpen={isFocused}
            content={
              <div className="flex flex-col p-2">
                <div className="flex justify-between gap-10 items-center w-full">
                  <h1 className="text-lg font-semibold">{node.title}</h1>
                  <Chip color="primary" size="sm">
                    {node.documentCount} DOCS
                  </Chip>
                </div>
                {node.description && (
                  <p className="text-sm text-default-600">{node.description}</p>
                )}
                <Button
                  size="sm"
                  color="primary"
                  className="mt-2"
                  as={Link}
                  to={`/node/${node.nodeId}`}
                >
                  All documents
                </Button>
              </div>
            }
          >
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                zIndex: isFocused ? 10 : 1,
              }}
            >
              <Marker color="red" />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

function FlowInner({
  mapUrl,
  widthPx,
  heightPx,
  nodes,
  focusNode,
}: MapViewProps) {
  const { setCenter, fitView } = useReactFlow();
  const [isOpen, setIsOpen] = useState<string | null>(null);

  const NODES = useMemo(
    () => [
      {
        id: "map",
        type: "mapNode",
        position: { x: 0, y: 0 },
        data: {
          src: mapUrl,
          width: widthPx,
          height: heightPx,
          nodes,
          focusNode,
          isOpen,
          setIsOpen,
        },
        draggable: false,
      },
    ],
    [mapUrl, widthPx, heightPx, nodes, focusNode, isOpen]
  );

  const nodeTypes = useMemo(() => ({ mapNode: MapNode }), []);

  useEffect(() => {
    if (focusNode) {
      const x = focusNode.posX * widthPx;
      const y = focusNode.posY * heightPx;
      setCenter(x, y, { zoom: 2, duration: 500 });
    } else {
      fitView({ padding: 0.1 });
    }
  }, [focusNode, setCenter, fitView, widthPx, heightPx]);

  return (
    <ReactFlow
      nodes={NODES}
      edges={[]}
      onMoveStart={() => setIsOpen(null)}
      nodeTypes={nodeTypes}
      fitView
      panOnDrag
      zoomOnScroll
      zoomOnPinch
      zoomOnDoubleClick={false}
      minZoom={0.5}
      maxZoom={4}
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
}

export default function MapView(props: MapViewProps) {
  const [selectedCategorys, setSelectedCategorys] = useState<string[]>([]);
  // useEffect(() => {
  //   if (
  //     props.focusInstance &&
  //     selectedCategorys.includes(props.focusInstance.categoryId)
  //   )
  //     setSelectedCategorys((prev) =>
  //       prev.filter((item) => item !== props.focusInstance?.categoryId)
  //     );
  // }, [props.focusInstance]);
  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-full w-full">
        {/* Map */}
        <div className="flex-1 w-full h-full">
          <FlowInner
            {...props}
            nodes={props.nodes} // props.nodes.filter(item) => !selectedCategorys.includes(item.categoryId))
            selectedCategory={selectedCategorys}
          />
        </div>
        {/* Bottom chips */}
        <div className="flex flex-wrap gap-2 p-4 bg-background shadow-inner">
          {props.categoryChips.map((cat) => (
            <Chip
              key={cat.categoryId}
              as={Button}
              onPress={() =>
                setSelectedCategorys(
                  selectedCategorys.includes(cat.categoryId)
                    ? selectedCategorys.filter(
                        (item) => item !== cat.categoryId
                      )
                    : [...selectedCategorys, cat.categoryId]
                )
              }
              className={
                selectedCategorys.includes(cat.categoryId)
                  ? "opacity-40"
                  : "secondary"
              }
              startContent={
                <div className="mr-1">
                  <Marker color={getCategoryColor(cat.categoryId)} />
                </div>
              }
            >
              {cat.name}
            </Chip>
          ))}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
