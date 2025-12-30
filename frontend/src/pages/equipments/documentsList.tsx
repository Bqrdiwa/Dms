import { useEffect, useState } from "react";
import DocsSideBar, { type Document } from "./DocsSideBar";
import { Spinner } from "@heroui/react";
import apiClient from "../../api/ApiClient";
import { BACKEND_BASE_URL } from "../../api/Setting";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DocumentsPage() {
  const [selectedMapId, setSelectedMapId] = useState<string | undefined>();

  const [documents, setDocuments] = useState<Document[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // 🔎 Search states (API-aligned)
  const [documentTitle, setDocumentTitle] = useState("");
  const [docNo, setDocNo] = useState("");
  const [lineNo, setLineNo] = useState("");
  const [volNo, setVolNo] = useState("");
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [vendorIds, setVendorIds] = useState<number[]>([]);

  // ================= FETCH DOCUMENTS =================
  const fetchDocuments = async () => {
    if (!selectedMapId) return;

    setLoading(true);
    try {
      const res = await apiClient.get(
        `${BACKEND_BASE_URL}/api/document/search`,
        {
          params: {
            page,
            pageSize,
            MapId: selectedMapId,
            DocumentTitle: documentTitle,
            DocNo: docNo,
            LineNo: lineNo,
            VolNo: volNo,
            TagsIds: tagIds[0],
            VendorsIds: vendorIds[0],
          },
          paramsSerializer: { indexes: false },
        }
      );

      const data = res.data;

      setDocuments(
        data.items.map((doc: any) => ({
          documentId: doc.documentId,
          title: doc.title,
          description: doc.description,
          fileUrl: doc.fileUrl,
          createAt: doc.createAt,
          vendor: doc.vendor,
          revision: doc.revision,
          tag: doc.tag,
        }))
      );

      setTotalCount(data.totalCount);
    } finally {
      setLoading(false);
    }
  };

  // ================= EXPORT =================
  const handleExport = async () => {
    if (!selectedMapId) return;

    const res = await apiClient.get(
      `${BACKEND_BASE_URL}/api/document/export`,
      {
        params: {
          MapId: selectedMapId,
          DocumentTitle: documentTitle,
          DocNo: docNo,
          LineNo: lineNo,
          VolNo: volNo,
          TagsIds: tagIds[0],
          VendorsIds: vendorIds[0],
        },
        paramsSerializer: { indexes: false },
      }
    );

    const worksheet = XLSX.utils.json_to_sheet(res.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Documents");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "documents_export.xlsx"
    );
  };

  // ================= EFFECTS =================
  useEffect(() => {
    setPage(1);
  }, [selectedMapId]);

  useEffect(() => {
    fetchDocuments();
  }, [
    page,
    selectedMapId,
    documentTitle,
    docNo,
    lineNo,
    volNo,
    tagIds,
    vendorIds,
  ]);

  return (
    <div className="flex h-screen w-full bg-default-50">
      <div className=" w-120">
        <DocsSideBar
          documents={documents}
          loading={loading}
          page={page}
          totalCount={totalCount}
          pageSize={pageSize}
          selectedMapId={selectedMapId}
          onSelectMap={setSelectedMapId}
          onPageChange={setPage}
          onSelectDoc={setSelectedDoc}
          onExport={handleExport}
          onSearch={(filters) => {
            setDocumentTitle(filters.documentTitle);
            setDocNo(filters.docNo);
            setLineNo(filters.lineNo);
            setVolNo(filters.volNo);
            setTagIds(filters.tagIds);
            setVendorIds(filters.vendorIds);
            setPage(1);
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center">
        {selectedDoc ? (
          <iframe src={selectedDoc} className="w-full h-full" />
        ) : loading ? (
          <Spinner size="lg" />
        ) : (
          <p>Select a document to preview</p>
        )}
      </div>
    </div>
  );
}
