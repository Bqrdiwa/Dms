import {
  Divider,
  Input,
  Skeleton,
  Button,
  Autocomplete,
  AutocompleteItem,
  Tooltip,
} from "@heroui/react";
import { ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { MapSelect } from "../../components/MapSelect";
import apiClient from "../../api/ApiClient";

export interface Document {
  documentId: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createAt: string;
  vendor?: string;
  revision?: string;
  tag?: string;
}

interface Props {
  documents: Document[] | null;
  loading: boolean;
  page: number;
  totalCount: number;
  pageSize: number;
  selectedMapId?: string;
  onSelectMap: (id: string) => void;
  onPageChange: (page: number) => void;
  onSelectDoc: (url: string) => void;
  onExport: () => void;
  onSearch: (filters: {
    documentTitle: string;
    docNo: string;
    lineNo: string;
    volNo: string;
    tagIds: number[];
    vendorIds: number[];
  }) => void;
}

export default function DocsSideBar({
  documents,
  page,
  totalCount,
  pageSize,
  selectedMapId,
  onSelectMap,
  onPageChange,
  onSelectDoc,
  onExport,
  onSearch,
}: Props) {
  const [documentTitle, setDocumentTitle] = useState("");
  const [docNo, setDocNo] = useState("");
  const [lineNo, setLineNo] = useState("");
  const [volNo, setVolNo] = useState("");

  const [tagOptions, setTagOptions] = useState<any[]>([]);
  const [vendorOptions, setVendorOptions] = useState<any[]>([]);

  const [tagIds, setTagIds] = useState<number[]>([]);
  const [vendorIds, setVendorIds] = useState<number[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [vendorQuery, setVendorQuery] = useState("");

  const totalPages = Math.ceil(totalCount / pageSize);



  useEffect(() => {
    const fetchTags = async () => {


      const res = await apiClient.get("/tag/", {
        params: { search: tagQuery },
      });
      setTagOptions(res.data.items);
    };

    fetchTags();
  }, [tagQuery]);

  useEffect(() => {
    const fetchVendors = async () => {


      const res = await apiClient.get("/vendor/", {
        params: { search: vendorQuery },
      });
      setVendorOptions(res.data.items);
    };

    fetchVendors();
  }, [vendorQuery]);
  useEffect(() => {
    onSearch({
      documentTitle,
      docNo,
      lineNo,
      volNo,
      tagIds,
      vendorIds,
    });
  }, [documentTitle, docNo, lineNo, volNo, tagIds, vendorIds]);

  return (
    <div className="w-120 h-full flex flex-col shadow-md">
      <div className="p-6 pb-0 flex justify-between items-center">
        <h1 className="font-bold w-full">Documents</h1>
        <MapSelect
          selectedMapId={selectedMapId}
          className="w-40"
          onSelectMap={onSelectMap}
        />
      </div>

      <Divider className="mt-6" />

      <div className="p-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex gap-3">
            <Input
              classNames={{ base: "flex-1" }}
              placeholder="Document Title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
            />
            <Tooltip content="Export">
              <Button
                variant="flat"
                color="primary"
                isIconOnly
                onPress={onExport}
              >
                <FileDown />
              </Button>
            </Tooltip>
          </div>

          <Input
            placeholder="Doc No"
            value={docNo}
            onChange={(e) => setDocNo(e.target.value)}
          />
          <Input
            placeholder="Line No"
            value={lineNo}
            onChange={(e) => setLineNo(e.target.value)}
          />
          <Input
            placeholder="Vol No"
            value={volNo}
            onChange={(e) => setVolNo(e.target.value)}
          />
          <Autocomplete
            items={tagOptions}
            placeholder="Tag"
            inputValue={tagQuery}
            onInputChange={setTagQuery}
            allowsEmptyCollection
            value={tagIds[0]?.toString()}
            onSelectionChange={(key) => {
              if (key === null) {
                setTagIds([]);
              } else {
                setTagIds([Number(key)]);
              }
            }}
          >
            {(item) => (
              <AutocompleteItem key={String(item.tagId)}>
                {item.name}
              </AutocompleteItem>
            )}
          </Autocomplete>

          <Autocomplete
            items={vendorOptions}
            placeholder="Vendor"
            inputValue={vendorQuery}
            onInputChange={setVendorQuery}
            allowsEmptyCollection
            value={vendorIds[0]?.toString()}
            onSelectionChange={(key) => {
              if (key === null) {
                setVendorIds([]);
              } else {
                setVendorIds([Number(key)]);
              }
            }}
          >
            {(item) => (
              <AutocompleteItem key={String(item.vendorId)}>
                {item.name}
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>
      </div>

      <Divider />

      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {documents ? (
          documents.map((doc) => (
            <div
              key={doc.documentId}
              className="p-3 rounded hover:bg-default-200 cursor-pointer"
              onClick={() => onSelectDoc(doc.fileUrl)}
            >
              <p className="font-medium">{doc.title}</p>
              <p className="text-xs">{doc.vendor}</p>
            </div>
          ))
        ) : (
          <Skeleton className="h-20" />
        )}
      </div>

      <Divider />
      <div className="p-4 flex justify-between">
        <Button
          isIconOnly
          disabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span>
          {page} / {totalPages}
        </span>
        <Button
          isIconOnly
          disabled={page >= totalPages}
          onPress={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
