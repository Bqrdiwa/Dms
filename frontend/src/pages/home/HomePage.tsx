import { useEffect, useState } from "react";
import apiClient from "../../api/ApiClient";
import { BACKEND_BASE_URL } from "../../api/Setting";
import SideBar, { getCategoryColor, type Instance } from "./SideBar";
import MapView from "./mapPreview";
export interface Category {
  name: string;
  categoryId: string;
}
export default function HomePage() {
  const [equipments, setEquipments] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState<any>(null);
  const [focusInstance, setFocusInstance] = useState<Instance | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/category");
        setCategories(res.data.result || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchMapOverview = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(BACKEND_BASE_URL + "/api/map/overview");
        setEquipments(res.data.instances || []);
        setMapData(res.data);
      } catch (err) {
        console.error("Error fetching map overview:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
    fetchMapOverview();
  }, []);

  return (
    <div className="flex flex-1 h-screen">
      {/* Sidebar */}
      <SideBar
        equipments={equipments}
        loading={loading}
        focusInstance={focusInstance}
        onSelect={(inst) => setFocusInstance(inst)}
      />

      {/* Main Map View */}
      <div className="flex-1">
        {mapData && (
          <MapView
            categoryChips={categories}
            mapUrl={mapData.imageUrl}
            widthPx={mapData.widthPx}
            heightPx={mapData.heightPx}
            instances={equipments.map((e) => ({
              ...e,
              color: getCategoryColor(e.categoryId),
            }))}
            focusInstance={focusInstance}
          />
        )}
      </div>
    </div>
  );
}
