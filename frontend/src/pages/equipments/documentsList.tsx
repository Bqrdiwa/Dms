import { useEffect, useState } from "react";
import DocsSideBar, { type Document } from "./DocsSideBar";
import { Spinner } from "@heroui/react";
import apiClient from "../../api/ApiClient";
import { BACKEND_BASE_URL } from "../../api/Setting";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search states
  const [vendorSearch, setVendorSearch] = useState("");
  const [nodeTitleSearch, setNodeTitleSearch] = useState("");
  const [docTitleSearch, setDocTitleSearch] = useState("");
  const [revisionSearch, setRevisionSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");

  const pageSize = 20;

  // Fetch documents
  const fetchDocuments = async (
    p = 1,
    vendor = "",
    nodeTitle = "",
    docTitle = "",
    revision = "",
    tag = "",
    keyword = ""
  ) => {
    try {
      setLoading(true);

      const res = await apiClient.get(
        BACKEND_BASE_URL +
          `/api/document/search?page=${p}&pageSize=${pageSize}` +
          `&vendor=${vendor}&nodeTitle=${nodeTitle}` +
          `&DocumentTitle=${docTitle}&revision=${revision}` +
          `&tag=${tag}&keyword=${keyword}`
      );

      const data = res.data;

      const items: Document[] = data.items.map((doc: any) => ({
        documentId: doc.documentId,
        title: doc.title,
        description: doc.description,
        fileUrl: doc.fileUrl,
        createAt: doc.createAt,
        nodeTitle: doc.nodeTitle,
        vendor: doc.vendor || "Unknown",
        revision: doc.revision || "",
        tag: doc.tag || "",
        keyword: doc.keyword || "",
      }));

      setDocuments(items);
      setTotalCount(data.totalCount || 0);
      setPage(data.page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Vendor Search API
  const fetchVendors = async (query: string) => {
    try {
      const res = await apiClient.get("/vendor/", {
        params: { page: 1, pageSize: 20, search: query },
      });
      return res.data.items ?? [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

const handleExport = async () => {
  try {
    const res = await apiClient.get(
      BACKEND_BASE_URL +
        `/api/document/export?` +
        `vendor=${vendorSearch}` +
        `&nodeTitle=${nodeTitleSearch}&DocumentTitle=${docTitleSearch}` +
        `&revision=${revisionSearch}&tag=${tagSearch}` +
        `&keyword=${keywordSearch}`
    );

    const docs = res.data;

    if (!docs || docs.length === 0) {
      alert("No documents found to export.");
      return;
    }

    // Convert data for Excel
    const excelData = docs.map((d: any) => ({
      DocumentID: d.documentId,
      Title: d.title,
      Description: d.description ?? "",
      Revision: d.revision ?? "",
      Vendor: d.vendor ?? "",
      NodeID: d.nodeId ?? "",
      NodeTitle: d.nodeTitle ?? "",
      Tags: (d.tags || []).join(", "),
      Keywords: (d.keywords || []).join(", "),
      FileURL: d.fileUrl,
      SizeBytes: d.sizeBytes ?? 0,
      CreatedAt: d.createAt,
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Documents");

    // Write the Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save the file
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "documents_export.xlsx"
    );

  } catch (error) {
    console.error("Excel export failed:", error);
  }
};

// Fetch Tags
const fetchTags = async (query: string) => {
  try {
    const res = await apiClient.get("/tag/", {
      params: { page: 1, pageSize: 10, search: query },
    });
    return res.data.items ?? [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Fetch Keywords
const fetchKeywords = async (query: string) => {
  try {
    const res = await apiClient.get("/keyword/", {
      params: { page: 1, pageSize: 10, search: query },
    });
    return res.data.items ?? [];
  } catch (err) {
    console.error(err);
    return [];
  }
};
  useEffect(() => {
    fetchDocuments(
      page,
      vendorSearch,
      nodeTitleSearch,
      docTitleSearch,
      revisionSearch,
      tagSearch,
      keywordSearch
    );
  }, [
    page,
    vendorSearch,
    nodeTitleSearch,
    docTitleSearch,
    revisionSearch,
    tagSearch,
    keywordSearch,
  ]);

  const handleSelectDoc = (url: string) => setSelectedDoc(url);
  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleSearch = (
    vendor: string,
    nodeTitle: string,
    docTitle: string,
    revision: string,
    tag: string,
    keyword: string
  ) => {
    setVendorSearch(vendor);
    setNodeTitleSearch(nodeTitle);
    setDocTitleSearch(docTitle);
    setRevisionSearch(revision);
    setTagSearch(tag);
    setKeywordSearch(keyword);
    setPage(1);
  };

  return (
    <div className="flex h-screen flex-1 bg-default-50">
      {/* Sidebar */}
      <div className="border-r w-120 border-default-200">
        <DocsSideBar
          documents={documents}
          selectedDoc={selectedDoc}
          onSelectDoc={handleSelectDoc}
          loading={loading}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
            fetchTags={fetchTags}
  fetchKeywords={fetchKeywords}
          onExport={handleExport}
          fetchVendors={fetchVendors}
        />
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 flex items-center justify-center bg-black/5">
        {selectedDoc ? (
          <iframe
            src={selectedDoc}
            className="w-full h-full border-none"
            title="PDF Viewer"
          />
        ) : loading ? (
          <Spinner size="lg" label="Loading documents..." />
        ) : (
          <p className="text-default-500">Select a document to preview</p>
        )}
      </div>
    </div>
  );
}
