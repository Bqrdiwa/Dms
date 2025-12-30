import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import apiClient from "../api/ApiClient";
import { BACKEND_BASE_URL } from "../api/Setting";

interface MapSelectProps {
  selectedMapId: string | null | undefined;
  onSelectMap: (id: string) => void;
  className?: string;
}

export function MapSelect({
  selectedMapId,
  onSelectMap,
  className,
}: MapSelectProps) {
  const [maps, setMaps] = useState<any[]>([]);
  // -------------------------
  // Fetch ALL maps
  // -------------------------
  const fetchMaps = async () => {
    try {
      const res = await apiClient.get(BACKEND_BASE_URL + "/api/map/all");
      setMaps(res.data || []);

      // Auto-select first map if nothing selected
      if (!selectedMapId && res.data?.length > 0) {
        onSelectMap(res.data[0].mapId);
      }
    } catch (err) {
      console.error("Error fetching maps:", err);
    } finally {
    }

  };
  useEffect(() => {
    fetchMaps();
  }, []);
  return (
    <Select
      placeholder="Map"
      color="primary"
      className={className}
      disallowEmptySelection
      selectedKeys={selectedMapId ? [selectedMapId] : []}
      onChange={(e) => onSelectMap(e.target.value)}
    >
      {maps.map((m) => (
        <SelectItem key={m.mapId}>{m.name}</SelectItem>
      ))}
    </Select>
  );
}
