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
import { getCategoryColor, type Instance } from "./SideBar";
import { Button, Chip, Image, Tooltip } from "@heroui/react";
import { Link } from "react-router-dom";
import type { Category } from "./HomePage";

interface MapViewProps {
  mapUrl: string;
  selectedCategory?: string[];
  widthPx: number;
  heightPx: number;
  instances: Instance[];
  focusInstance?: Instance | null;
  categoryChips: Category[];
}

const MapNode = ({ data }: any) => {
  useEffect(() => {
    if (!data.instances) return;

    data.instances.forEach((ins: Instance) => {
      if (data.focusInstance?.instanceId === ins.instanceId) {
        // only set tooltip if focusInstance matches
        setTimeout(() => {
          if (data.focusInstance?.instanceId === ins.instanceId) {
            data.setIsOpen(ins.instanceId);
          }
        }, 400);
      } else {
        data.setIsOpen(null);
      }
    });
  }, [data.focusInstance, data.instances]);

  return (
    <div
      style={{ position: "relative", width: data.width, height: data.height }}
    >
      <Image
        src={data.src}
        className="z-0"
        alt="Map"
        width={data.width}
        height={data.height}
        draggable={false}
      />
      {data.instances.map((inst: Instance) => (
        <Tooltip
          showArrow
          placement="left"
          closeDelay={0}
          isOpen={data.isOpen ? data.isOpen == inst.instanceId : undefined}
          content={
            <div className="flex flex-col p-2">
              <div className="flex items-center mb-2 justify-between w-full">
                <h1 className="text-md  font-semibold">{inst.vendorName}</h1>

                <Chip color="success" variant="flat" size="sm">
                  Active
                </Chip>
              </div>
              <div className="flex w-full justify-between gap-5">
                <p>Category name:</p>
                <p>{inst.categoryName}</p>
              </div>
              <div className="flex w-full justify-between gap-5">
                <p>Vendor name:</p>
                <p>{inst.vendorName}</p>
              </div>
              <div className="flex w-full justify-between gap-5">
                <p>Tag name:</p>
                <p>{inst.tagName}</p>
              </div>
              <Button
                size="sm"
                color="primary"
                className="mt-7"
                as={Link}
                to={`/instance/${inst.instanceId}`}
              >
                Show documents
              </Button>
            </div>
          }
        >
          <div
            key={inst.tagId}
            style={{
              position: "absolute",
              left: inst.posX * data.width,
              top: inst.posY * data.height,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Marker color={inst.color as any} />
          </div>
        </Tooltip>
      ))}
    </div>
  );
};

function FlowInner({
  mapUrl,
  widthPx,
  heightPx,
  selectedCategory,
  instances,
  focusInstance,
}: MapViewProps) {
  const { setCenter, fitView } = useReactFlow();
  const [isOpen, setIsOpen] = useState<string | null>(null);

  const nodes = useMemo(
    () => [
      {
        id: "map",
        type: "mapNode",
        position: { x: 0, y: 0 },
        data: {
          src: mapUrl,
          width: widthPx,
          isOpen,
          setIsOpen,
          height: heightPx,
          instances: instances,
          focusInstance,
        },
        draggable: false,
      },
    ],
    [
      mapUrl,
      widthPx,
      heightPx,
      instances,
      selectedCategory,
      focusInstance,
      isOpen,
    ]
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
  useEffect(() => {
    if (
      props.focusInstance &&
      selectedCategorys.includes(props.focusInstance.categoryId)
    )
      setSelectedCategorys((prev) =>
        prev.filter((item) => item !== props.focusInstance?.categoryId)
      );
  }, [props.focusInstance]);
  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-full w-full">
        {/* Map */}
        <div className="flex-1 w-full h-full">
          <FlowInner
            {...props}
            instances={props.instances.filter(
              (item) => !selectedCategorys.includes(item.categoryId)
            )}
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
