import { Spinner } from "@heroui/react";

interface DocsViewerProps {
  url: string; // publicly accessible file URL
}

export default function DocsViewer({ url }: DocsViewerProps) {
  const viewerUrl = `${url}`;

  return (
    <div className="flex w-full h-full relative justify-center items-center">
      <Spinner />
      <div className="absolute top-0 left-0 w-full h-full z-20">
        <iframe
          src={viewerUrl}
          width="100%"
          height="100%"
          title="Document Preview"
        />
      </div>
    </div>
  );
}
