import {
  Chip,
  Divider,
  Input,
  Link,
  Select,
  SelectItem,
  Skeleton,
} from "@heroui/react";
import { Dot, Search } from "lucide-react";
import Marker, { COLOR_CLASSES } from "./Marker";
import { useState, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Link as RouterLink } from "react-router-dom";
export interface Instance {
  instanceId: string;
  title: string;
  categoryId: string;
  isActive: boolean;
  documents: any[];
  description: string;
  categoryName: string;
  tagName: string;
  color?: string;
  vendorName: string;
  posX: number;
  posY: number;
  tagId: number;
}

interface SideBarProps {
  equipments: Instance[];
  onSelect: (inst: Instance) => void;
  loading: boolean;
  focusInstance: Instance | null;
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
  equipments,
  loading,
  onSelect,
  focusInstance,
}: SideBarProps) {
  const [search, setSearch] = useState("");
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const layerOptions = useMemo(
    () =>
      Array.from(new Set(equipments.map((eq) => eq.categoryName))).map(
        (cat) => ({
          key: cat,
          value: cat,
          label: cat,
        })
      ),
    [equipments]
  );

  const tagOptions = useMemo(
    () =>
      Array.from(new Set(equipments.map((eq) => eq.tagName))).map((tag) => ({
        key: tag,
        value: tag,
        label: tag,
      })),
    [equipments]
  );

  const filteredEquipments = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return equipments.filter((eq) => {
      const matchesSearch =
        eq.title.toLowerCase().includes(lowerSearch) ||
        eq.instanceId.toLowerCase().includes(lowerSearch) ||
        eq.vendorName.toLowerCase().includes(lowerSearch) ||
        eq.tagName.toLowerCase().includes(lowerSearch) ||
        eq.categoryName.toLowerCase().includes(lowerSearch);

      const matchesLayer = selectedLayer
        ? eq.categoryName === selectedLayer
        : true;
      console.log(active);
      const matchesActivations = active
        ? active == "active"
          ? eq.isActive == true
          : eq.isActive == false
        : true;
      return matchesSearch && matchesLayer && matchesActivations;
    });
  }, [equipments, search, selectedLayer, active]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredEquipments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90,
    overscan: 5,
  });

  return (
    <div className="w-120 h-full bg-background shadow-md">
      <h1 className="p-6 pb-0 font-bold text-lg">Project Subject</h1>
      <Divider className="mt-6" />

      <div className="flex flex-col gap-3 p-6">
        <Input
          size="lg"
          startContent={<Search className="text-default-600" />}
          placeholder="Search in equipment's title and code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Select
              label="Categories"
              placeholder="Select a Category"
              selectedKeys={selectedLayer ? [selectedLayer] : []}
              value={selectedLayer || ""}
              onChange={(val) => setSelectedLayer(val.target.value)}
              items={layerOptions}
            >
              {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
            </Select>
            <Select
              label="Tag active"
              placeholder="Select activation mode"
              selectedKeys={active ? [active] : []}
              value={active || ""}
              items={tagOptions}
              onChange={(val) => setActive(val.target.value)}
            >
              <SelectItem key={"active"}>Active</SelectItem>
              <SelectItem key={"deactive"}>Deactive</SelectItem>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex px-6 justify-between gap-10">
        <h3 className="text-default-600">Results</h3>
        <h3 className="text-default-600">
          {loading ? "Loading..." : `${filteredEquipments.length} items`}
        </h3>
      </div>

      <div
        ref={parentRef}
        className="flex flex-col p-6 overflow-y-auto max-h-[60vh] relative"
      >
        {!loading ? (
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const eq = filteredEquipments[virtualRow.index];
              const color = getCategoryColor(eq.categoryId);
              return (
                <div
                  className="group"
                  key={eq.instanceId}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={() => onSelect(eq)}
                >
                  <div
                    className={
                      "flex p-3 cursor-pointer rounded-md flex-col gap-1 duration-75 " +
                      (focusInstance === eq ? "bg-default-200" : "")
                    }
                  >
                    <div className="flex justify-between w-full gap-10">
                      <h4 className="font-semibold">{eq.title}</h4>
                      <Chip
                        size="sm"
                        classNames={{ base: "rounded-md bg-default-100" }}
                      >
                        {eq.documents.length} DOCS
                      </Chip>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-end flex-1 font-light gap-1">
                        <Marker color={color} />
                        <p>{eq.vendorName}</p>
                        <Dot className="text-default-500" />
                        <p>{eq.tagName}</p>
                        <Dot className="text-default-500" />
                        <p
                          className={
                            eq.isActive ? "text-success" : "text-danger"
                          }
                        >
                          {eq.isActive ? "active" : "deactive"}
                        </p>
                      </div>
                      <Link
                        className={
                          " hidden text-sm " +
                          (focusInstance?.instanceId == eq.instanceId
                            ? "flex"
                            : "")
                        }
                        as={RouterLink}
                        to={`/instance/${eq.instanceId}`}
                      >
                        Show documents
                      </Link>
                    </div>
                  </div>
                  {virtualRow.index !== filteredEquipments.length - 1 && (
                    <Divider
                      className={
                        focusInstance === eq ||
                        (virtualRow.index > 0 &&
                          filteredEquipments[virtualRow.index + 1] ===
                            focusInstance)
                          ? "opacity-0"
                          : ""
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md mb-2" />
            ))}
          </>
        )}

        {!loading && filteredEquipments.length === 0 && (
          <p className="text-sm text-default-500 w-full py-10 text-center">
            No equipments found.
          </p>
        )}
      </div>
    </div>
  );
}
