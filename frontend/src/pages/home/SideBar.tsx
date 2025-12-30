import { Divider, Input, Skeleton } from "@heroui/react";
import { Search } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { COLOR_CLASSES } from "./Marker";
import { MapSelect } from "../../components/MapSelect";

export interface NodeItem {
  nodeId: string;
  title: string;
  description: string;
  posX: number;
  posY: number;
  documentCount: number;
}
interface SideBarProps {
  nodes: NodeItem[];
  onSelect: (node: NodeItem) => void;
  loading: boolean;
  focusNode: NodeItem | null;

  selectedMapId: string | null;
  onSelectMap: (id: string) => void;
}

export const getCategoryColor = (categoryId: string) => {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % Object.keys(COLOR_CLASSES).length;
  return Object.keys(COLOR_CLASSES)[index];
};
export default function SideBar({
  nodes,
  loading,
  onSelect,
  focusNode,
  selectedMapId,
  onSelectMap,
}: SideBarProps) {
  const [search, setSearch] = useState("");

  const filteredNodes = useMemo(() => {
    const lower = search.toLowerCase();
    return nodes.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.description.toLowerCase().includes(lower) ||
        n.nodeId.toLowerCase().includes(lower)
    );
  }, [nodes, search]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });

  return (
    <div className="w-120 h-full bg-background shadow-md">
      <div className="p-6 pb-0 flex justify-between items-center">
        <h1 className="font-bold w-full">Nodes</h1>
        <MapSelect
          selectedMapId={selectedMapId}
          onSelectMap={onSelectMap}
          className="w-40"
        />
      </div>

      <Divider className="mt-6" />

      <div className="flex flex-col gap-3 p-6">
        <Input
          size="lg"
          startContent={<Search className="text-default-600" />}
          placeholder="Search nodes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex px-6 justify-between gap-10">
        <h3 className="text-default-600">Results</h3>
        <h3 className="text-default-600">
          {loading ? "Loading..." : `${filteredNodes.length} items`}
        </h3>
      </div>

      <div
        ref={parentRef}
        className="flex flex-col p-6 overflow-y-auto max-h-[60vh] relative"
      >
        {!loading ? (
          <>
            <div
              style={{
                height: rowVirtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const node = filteredNodes[virtualRow.index];
                return (
                  <div
                    key={node.nodeId}
                    className="group"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => onSelect(node)}
                  >
                    <div
                      className={
                        "flex p-3 cursor-pointer rounded-md flex-col gap-1 duration-75 " +
                        (focusNode?.nodeId === node.nodeId
                          ? "bg-default-200"
                          : "")
                      }
                    >
                      <div className="flex justify-between">
                        <h4 className="font-semibold">{node.title}</h4>
                        <p className="text-sm font-bold text-default-500">
                          {node.documentCount} DOCS
                        </p>
                      </div>

                      {node.description && (
                        <p className="text-sm text-default-500">
                          {node.description}
                        </p>
                      )}
                    </div>

                    {virtualRow.index !== filteredNodes.length - 1 && (
                      <Divider
                        className={
                          focusNode?.nodeId === node.nodeId ? "opacity-0" : ""
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {filteredNodes.length === 0 && (
              <p className="text-sm text-default-500 w-full py-10 text-center">
                No nodes found.
              </p>
            )}
          </>
        ) : (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md mb-2" />
          ))
        )}
      </div>
    </div>
  );
}
