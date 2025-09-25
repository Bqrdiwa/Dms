import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../api/ApiClient";
import { BACKEND_BASE_URL } from "../../api/Setting";
import DocsSideBar, { type Document as DocType } from "./DocsSidebar";
import DocsViewer from "./DocsViewer";

export default function DocsPage() {
  const { id } = useParams();
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(
          `${BACKEND_BASE_URL}/api/instance/${id}/documents`
        );
        setDocuments(res.data || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [id]);

  useEffect(() => {
    documents.length > 0 && setSelectedDoc(documents[0].fileUrl);
  }, [documents]);
  return (
    <div className="flex h-screen w-full">
      <DocsSideBar
        selectedDoc={selectedDoc}
        instanceTitle="HI"
        loading={loading}
        documents={documents}
        onBack={() => window.history.back()}
        onSelectDoc={(url) => setSelectedDoc(url)}
      />

      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            <div className="flex-1 overflow-auto">
              <DocsViewer url={selectedDoc} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a document
          </div>
        )}
      </div>
    </div>
  );
}
