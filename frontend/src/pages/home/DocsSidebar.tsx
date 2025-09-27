import { Divider, Button, Skeleton } from "@heroui/react";
import { ArrowLeft } from "lucide-react";

export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  createAt: string;
}

interface DocsSideBarProps {
  instanceTitle: string;
  documents: Document[];
  selectedDoc: string | null;
  onBack: () => void;
  onSelectDoc: (url: string) => void;
  loading: boolean;
}

export default function DocsSideBar({
  instanceTitle,
  loading,
  documents,
  selectedDoc,
  onBack,
  onSelectDoc,
}: DocsSideBarProps) {
  return (
    <div className="w-120 h-full bg-background shadow-md flex flex-col">
      <div className="flex items-center justify-between p-6">
        <h1 className="font-bold text-lg">
          {instanceTitle ? (
            `${instanceTitle} Docs`
          ) : (
            <Skeleton className="w-28 h-7 rounded-md" />
          )}{" "}
        </h1>
        <Button className="h-7" isIconOnly variant="light" onPress={onBack}>
          <ArrowLeft />
        </Button>
      </div>

      <Divider />

      <div className="p-6 overflow-y-auto flex-col gap-2 flex flex-1">
        {!loading ? (
          documents.length > 0 ? (
            documents.map((doc) => {
              // Format the date
              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.fileUrl)}
                  className={
                    "p-3 rounded-md cursor-pointer hover:bg-default-200 gap-3 items-end flex transition " +
                    (selectedDoc === doc.fileUrl ? " bg-default-200" : " ")
                  }
                >
                  <div className="w-full">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-default-500 text-sm">
                      {doc.description}
                    </p>
                  </div>
                  <p className="text-sm font-light text-default-500">
                    {new Date(doc.createAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-default-500">No documents available.</p>
          )
        ) : (
          <>
            <Skeleton className="w-full h-[68px] rounded-md" />
            <Skeleton className="w-full h-[68px]  rounded-md" />
            <Skeleton className="w-full h-[68px] rounded-md" />
            <Skeleton className="w-full h-[68px]  rounded-md" />
            <Skeleton className="w-full h-[68px]  rounded-md" />
          </>
        )}
      </div>
    </div>
  );
}
