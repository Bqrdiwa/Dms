import {
  Divider,
  Input,
  Skeleton,
  Button,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { Search, ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { useState, useEffect } from "react";

export interface Document {
  documentId: string;
  title: string;
  description: string | null;
  fileUrl: string;
  createAt: string;
  nodeTitle: string;
  vendor?: string;
  revision?: string;
  tag?: string;
  keyword?: string;
}

export interface Vendor {
  id: string;
  name: string;
}

interface DocsSideBarProps {
  documents: Document[] | null;
  selectedDoc: string | null;
  onSelectDoc: (url: string) => void;
  loading: boolean;
  page: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSearch: (
    vendor: string,
    nodeTitle: string,
    docTitle: string,
    revision: string,
    tag: string,
    keyword: string
  ) => void;
  onExport: () => void;
  fetchVendors: (query: string) => Promise<Vendor[]>;
  fetchTags: (query: string) => Promise<any[]>;
  fetchKeywords: (query: string) => Promise<any[]>;
}

export default function DocsSideBar({
  documents,
  selectedDoc,
  onSelectDoc,
  loading,
  page,
  totalCount,
  pageSize,
  fetchKeywords,
  fetchTags,
  onPageChange,
  onSearch,
  onExport,
  fetchVendors,
}: DocsSideBarProps) {
  const [vendorSearch, setVendorSearch] = useState("");
  const [nodeTitleSearch, setNodeTitleSearch] = useState("");
  const [docTitleSearch, setDocTitleSearch] = useState("");
  const [revisionSearch, setRevisionSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [tagOptions, setTagOptions] = useState<{id:string;isActive:boolean;name:string;tagId:number;}[]>([]);
  const [keywordInput,setKeywordInput] = useState("")
  const [tagInput, setTagInput] = useState("");
const [tagLoading, setTagLoading] = useState(false);

const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordOptions, setKeywordOptions] = useState<{id:string;isActive:boolean;keywordId:number;title:string;}[]>([]);
  const [vendorOptions, setVendorOptions] = useState<Vendor[]>([]);
  const [vendorLoading, setVendorLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Fetch vendors when input changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(async () => {
      setVendorLoading(true);
      const items = await fetchVendors(vendorSearch);
      setVendorOptions(items);
      setVendorLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [vendorSearch]);

  useEffect(() => {
    onSearch(
      vendorSearch,
      nodeTitleSearch,
      docTitleSearch,
      revisionSearch,
      tagSearch,
      keywordSearch
    );
  }, [
    vendorSearch,
    nodeTitleSearch,
    docTitleSearch,
    revisionSearch,
    tagSearch,
    keywordSearch,
  ]);
  useEffect(() => {
    const fetch = async () => {
      setKeywordLoading(true)
      const items = await fetchKeywords(keywordInput);
      setKeywordLoading(false)
      setKeywordOptions(items);
    };

    fetch();
  }, [keywordInput]);
  useEffect(() => {
    const fetch = async () => {
      setTagLoading(true)
      const items = await fetchTags(tagInput);
      setTagLoading(false);

      setTagOptions(items);
    };
    fetch();
  }, [tagInput]);
  return (
    <div className="w-120 h-full bg-background shadow-md flex flex-col">
      <div className="flex items-center justify-between p-6">
        <h1 className="font-bold text-lg">All Documents</h1>

        {/* Export button */}
        <Button
          color="secondary"
          startContent={<FileDown size={16} />}
          variant="flat"
          onPress={onExport}
        >
          Export
        </Button>
      </div>

      <Divider />

      {/* Search Filters */}
      <div className="flex flex-col gap-3 p-6">
        <Input
          startContent={<Search className="text-default-600" />}
          placeholder="Search Document Title..."
          value={docTitleSearch}
          onChange={(e) => {
            setDocTitleSearch(e.target.value);
          }}
        />

        <Input
          placeholder="Revision..."
          value={revisionSearch}
          onChange={(e) => {
            setRevisionSearch(e.target.value);
          }}
        />

        <Autocomplete
          placeholder="Select Tag..."
          items={tagOptions}
          isLoading={tagLoading}
          value={tagSearch}
          onInputChange={setTagInput}
          onSelectionChange={(val) => setTagSearch(val !== null ? val as string : "")}
        >
          {(item) => (
            <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>
          )}
        </Autocomplete>

        <Autocomplete
          placeholder="Select Keyword..."
          items={keywordOptions}
          isLoading={keywordLoading}
          value={keywordSearch}
          onInputChange={setKeywordInput}
          onSelectionChange={(val) => setKeywordSearch(val !== null ? val as string : "")}
        >
          {(item) => (
            <AutocompleteItem key={item.id}>{item.title}</AutocompleteItem>
          )}
        </Autocomplete>

        <div className="flex gap-2">
          <Autocomplete
            placeholder="Search Vendor..."
            items={vendorOptions.map((v) => ({ value: v.name }))}
            value={vendorSearch}
            onSelectionChange={(val) => {
              setVendorSearch(val !== null ? (val as string) : "");
            }}
            isLoading={vendorLoading}
            className="w-full"
          >
            {(item) => (
              <AutocompleteItem key={item.value}>{item.value}</AutocompleteItem>
            )}
          </Autocomplete>

          {/* Node Title */}
          <Input
            placeholder="Node Title..."
            value={nodeTitleSearch}
            onChange={(e) => {
              setNodeTitleSearch(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="flex px-6 justify-between gap-10">
        <h3 className="text-default-600">Results</h3>
        <h3 className="text-default-600">
          {loading || !documents ? "Loading..." : `${totalCount} items`}
        </h3>
      </div>

      <Divider className="my-2" />

      {/* Document list */}
      <div className="flex flex-col grow p-6 flex-1 overflow-y-auto h-full gap-2">
        {documents != null ? (
          documents.length > 0 ? (
            documents.map((doc) => (
              <div
                key={doc.documentId}
                onClick={() => onSelectDoc(doc.fileUrl)}
                className={`p-3 rounded-md cursor-pointer hover:bg-default-200 transition ${
                  selectedDoc === doc.fileUrl ? "bg-default-200" : ""
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between gap-4">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-default-500">
                      {new Date(doc.createAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="text-sm text-default-600">{doc.nodeTitle}</p>

                  {doc.description && (
                    <p className="text-sm text-default-500 line-clamp-2">
                      {doc.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-1">
                    {doc.vendor && (
                      <p className="text-xs text-default-400">
                        Vendor: {doc.vendor}
                      </p>
                    )}
                    {doc.revision && (
                      <p className="text-xs text-default-400">
                        Revision: {doc.revision}
                      </p>
                    )}
                    {doc.tag && (
                      <p className="text-xs text-default-400">Tag: {doc.tag}</p>
                    )}
                    {doc.keyword && (
                      <p className="text-xs text-default-400">
                        Keyword: {doc.keyword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-default-500 w-full py-10 text-center">
              No documents found.
            </p>
          )
        ) : (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-full !h-[100px] rounded-md mb-2" />
          ))
        )}
      </div>

      {/* Pagination */}
      <Divider />
      <div className="flex items-center justify-between px-6 py-4 bg-default-100">
        <Button
          isIconOnly
          isDisabled={page <= 1 || loading}
          onPress={() => onPageChange(page - 1)}
          variant="light"
        >
          <ChevronLeft />
        </Button>

        <span className="text-sm text-default-600">
          Page {page} of {totalPages}
        </span>

        <Button
          isIconOnly
          isDisabled={page >= totalPages || loading}
          onPress={() => onPageChange(page + 1)}
          variant="light"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
