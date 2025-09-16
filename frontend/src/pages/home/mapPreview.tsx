import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";
import Marker from "./Marker";
import type { Instance } from "./SideBar";

interface MapViewProps {
  mapUrl: string;
  widthPx: number;
  heightPx: number;
  instances: Instance[];
  focusInstance?: Instance | null;
}

// Single node that renders map + markers
const MapNode = ({ data }: any) => (
  <div style={{ position: "relative", width: data.width, height: data.height }}>
    <img
      src={data.src}
      alt="Map"
      width={data.width}
      height={data.height}
      draggable={false}
    />
    {data.instances.map((inst: Instance) => (
      <div
        key={inst.tagId}
        style={{
          position: "absolute",
          left: inst.posX * data.width,
          top: inst.posY * data.height,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Marker
          color={
            inst.color as any
          }
        />
      </div>
    ))}
  </div>
);

function FlowInner({
  mapUrl,
  widthPx,
  heightPx,
  instances,
  focusInstance,
}: MapViewProps) {
  const { setCenter, fitView } = useReactFlow();

  // Only one node: the map with markers inside
  const nodes = useMemo(
    () => [
      {
        id: "map",
        type: "mapNode",
        position: { x: 0, y: 0 },
        data: { src: mapUrl, width: widthPx, height: heightPx, instances, focusInstance },
        draggable: false,
      },
    ],
    [mapUrl, widthPx, heightPx, instances, focusInstance]
  );

  const nodeTypes = useMemo(() => ({ mapNode: MapNode }), []);

  // Focus instance when it changes
  useEffect(() => {
    if (focusInstance) {
      const x = focusInstance.posX * widthPx;
      const y = focusInstance.posY * heightPx;
      setCenter(x, y, { zoom: 2, duration: 500 });
    } else {
      fitView({ padding: 0.1 });
    }
  }, [focusInstance, setCenter, fitView, widthPx, heightPx]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={[]}
      nodeTypes={nodeTypes}
      fitView
      panOnDrag
      zoomOnScroll
      zoomOnPinch
      zoomOnDoubleClick={false}
      minZoom={0.5}
      maxZoom={4}
    >
      <Background />
    </ReactFlow>
  );
}

export default function MapView(props: MapViewProps) {
  return (
    <ReactFlowProvider>
      <div className="flex-1 w-full h-full">
        <FlowInner {...props} />
      </div>
    </ReactFlowProvider>
  );
}
