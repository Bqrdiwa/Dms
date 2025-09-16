import { useEffect, useState } from "react";
import apiClient from "../../api/ApiClient";
import { BACKEND_BASE_URL } from "../../api/Setting";
import SideBar, { getCategoryColor, type Instance } from "./SideBar";
import MapView from "./mapPreview";

export default function HomePage() {
    const [equipments, setEquipments] = useState<Instance[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [mapData, setMapData] = useState<{
        "mapId": "",
        "name": "",
        "imageUrl": "",
        "widthPx": 0,
        "heightPx": 0,
    } | null>(null);
    const [focusInstance, setFocusInstance] = useState<Instance | null>(null);

    useEffect(() => {
        const fetchMapOverview = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(
                    BACKEND_BASE_URL + "/api/map/overview"
                );
                setEquipments(res.data.instances || []);
                setMapData(res.data);
            } catch (err) {
                console.error("Error fetching map overview:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMapOverview();
    }, []);

    console.log(mapData)

    return (
        <div className="flex flex-1 h-screen">
            <SideBar
                equipments={equipments}
                loading={loading}
                focusInstance={focusInstance}
                onSelect={(inst) => setFocusInstance(inst)}
            />
                {mapData && (
                    <MapView
                        mapUrl={mapData.imageUrl}
                        widthPx={mapData.widthPx}
                        heightPx={mapData.heightPx}
                        instances={equipments.map(e => ({ ...e, color: getCategoryColor(e.categoryId) }))}
                        focusInstance={focusInstance}
                    />
                )}
        </div>
    );
}
