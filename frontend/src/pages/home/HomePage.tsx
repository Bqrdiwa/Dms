import { useEffect, useState } from "react";
import apiClient from "../../api/ApiClient";
import { BACKEND_BASE_URL } from "../../api/Setting";
import SideBar, { getCategoryColor, type NodeItem } from "./SideBar";
import MapView from "./mapPreview";

export interface Category {
  name: string;
  categoryId: string;
}

export interface MapItem {
  mapId: string;
  name: string;
}

export default function HomePage() {
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  const [equipments, setEquipments] = useState<NodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState<any>(null);
  const [focusInstance, setFocusInstance] = useState<NodeItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);


  // -------------------------
  // Fetch CATEGORIES
  // -------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/category");
        setCategories(res.data.result || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // -------------------------
  // Fetch MAP OVERVIEW (depends on selectedMapId)
  // -------------------------
  useEffect(() => {
    if (!selectedMapId) return;

    const fetchMapOverview = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(
          `${BACKEND_BASE_URL}/api/map/overview?mapId=${selectedMapId}`
        );
        setEquipments(res.data.nodes || []);
        setMapData(res.data);
      } catch (err) {
        console.error("Error fetching map overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapOverview();
  }, [selectedMapId]);

  return (
    <div className="flex flex-1 h-screen">
      {/* Sidebar */}
      <SideBar
        nodes={equipments}
        loading={loading}
        selectedMapId={selectedMapId}
        onSelectMap={(id) => setSelectedMapId(id)}
        focusNode={focusInstance}
        onSelect={(inst) => setFocusInstance(inst)}
      />

      {/* Map View */}
      <div className="flex-1">
        {mapData && (
          <MapView
            categoryChips={categories}
            mapUrl={mapData.imageUrl}
            widthPx={mapData.widthPx}
            heightPx={mapData.heightPx}
            nodes={equipments.map((e) => ({
              ...e,
              color: getCategoryColor(e.nodeId),
            }))}
            focusNode={focusInstance}
          />
        )}
      </div>
    </div>
  );
}
