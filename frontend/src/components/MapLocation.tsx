import { useEffect, useRef, useState } from "react";
import apiClient from "../api/ApiClient";
import { BACKEND_BASE_URL } from "../api/Setting";
import { Image, Skeleton } from "@heroui/react";

interface MapData {
  mapId: string;
  name: string;
  imageUrl: string;
  widthPx: number;
  heightPx: number;
}

interface ImageMapProps {
  posX: number | null;
  posY: number | null;
  setMapId: React.Dispatch<React.SetStateAction<string | null>>;
  setPos: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}

export default function ImageMap({
  posX,
  posY,
  setPos,
  setMapId,
}: ImageMapProps) {
  const [map, setMap] = useState<MapData | null>(null);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fetchMapData = async () => {
    try {
      const res = await apiClient.get<MapData>(
        BACKEND_BASE_URL + "/api/map/first/"
      );
      setMapId(res.data.mapId);
      setMap(res.data);
    } finally {
    }
  };
  useEffect(() => {
    fetchMapData();
  }, []);

  if (!map) return <Skeleton className=" w-[600px] rounded-3xl" />;
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setZoom({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => setZoom(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !imgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPos([x, y]);

    // Scroll container to center the marker
    const scrollX = x * rect.width - rect.width / 2;
    const scrollY = y * rect.height - rect.height / 2;
    containerRef.current.scrollTo({
      top: scrollY,
      left: scrollX,
      behavior: "smooth",
    });
  };

  const imgWidth = imgRef.current?.clientWidth || map.widthPx;
  const imgHeight = imgRef.current?.clientHeight || map.heightPx;

  return (
    <div
      ref={containerRef}
      className="relative h-fit flex overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ cursor: "crosshair", maxWidth: "100%" }}
    >
      <Image
        ref={imgRef}
        className="select-none z-0 pointer-events-none"
        src={map.imageUrl}
        alt={map.name}
        style={{
          display: "block",
          width: "100%",
          maxWidth: "600px",
          height: "full",
        }}
      />

      {/* Zoom circle */}
      {zoom && (
        <div
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: "2px solid #2563eb",
            overflow: "hidden",
            pointerEvents: "none",
            top: zoom.y - 75,
            left: zoom.x - 75,
            backgroundImage: `url(${map.imageUrl})`,
            backgroundSize: `${imgWidth * 2}px ${imgHeight * 2}px`,
            backgroundPosition: `-${zoom.x * 2 - 75}px -${zoom.y * 2 - 75}px`,
          }}
        />
      )}

      {/* Marker */}
      {posX !== null && posY !== null && (
        <div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "blue",
            transform: "translate(-50%, -50%)",
            left: `${posX * 100}%`,
            top: `${posY * 100}%`,
          }}
        />
      )}
    </div>
  );
}
