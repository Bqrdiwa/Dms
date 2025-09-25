import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import apiClient from "../api/ApiClient";
import {
  Button,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Form,
  Textarea,
  addToast,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/react";
import { Trash } from "lucide-react";

import { BACKEND_BASE_URL } from "../api/Setting";
import { Link as RouterLink } from "react-router-dom";
import AddInstanceModal from "./AddInstanceModal";
// ---------- Types ----------
interface Document {
  title: string;
  description: string;
  file?: File;
}

interface Instance {
  instanceId: string;
  title: string;
  documents?: Document[];
}

interface Category {
  categoryId: string;
  name: string;
  documentCount: number;
  instanceCount: number;
  instances: Instance[];
}

interface ApiResponse {
  result: Category[];
}

// ---------- Custom Nodes ----------
const CategoryNode = ({
  data,
  id,
}: {
  data: {
    documentCount: number;
    instanceCount: number;
    label: string;
    onAddNode?: (id: string) => void;
  };
  id: string;
}) => {
  const handleAddNode = () => {
    data.onAddNode?.(id);
  };

  return (
    <div className="relative w-64 rounded-md bg-background overflow-visible">
      <div className="bg-secondary flex w-full p-1 rounded-t-md justify-between text-[.8rem] text-center font-medium items-center px-2 text-background">
        <p>{data.label}</p>
        <Trash className="w-3" />
      </div>
      <div className="flex gap-4 items-center justify-center p-2 text-center">
        <div className="flex flex-col items-center gap-2">
          <h4 className="text-[.7rem] font-medium">{data.documentCount}</h4>
          <h5 className="text-default-600 text-[.6rem]">Documents</h5>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h4 className="text-[.7rem] font-medium">{data.instanceCount}</h4>
          <h5 className="text-default-600 text-[.6rem]">Instances</h5>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />

      <Button
        onPress={handleAddNode}
        style={{ height: "20px" }}
        className="absolute top-full w-14 min-w-[unset] rounded-full mt-1 left-0 border-1 border-default-200 leading-0 p-0 text-[.5rem]"
      >
        Add Node
      </Button>
    </div>
  );
};

const InstanceNode = ({
  data,
}: {
  data: {
    label: string;
    documents?: Document[];
    onShowAllDocs?: (docs: Document[]) => void;
    onShowDocDetail?: (doc: Document) => void;
    onAddDocument?: () => void;
  };
}) => {
  const docs = data.documents ?? [];

  return (
    <div className="relative rounded-md w-64 bg-background overflow-visible">
      <div className="bg-secondary-800 flex w-full p-1  rounded-t-md justify-between text-[.8rem] text-center font-medium items-center px-2 text-background">
        <p>{data.label}</p>
        <Trash className="w-3" />
      </div>
      <div className="flex flex-col items-center text-center p-2">
        {docs.length === 0 ? (
          <p className="italic text-xs text-default-500">No documents</p>
        ) : (
          <>
            <div className="grid grid-cols-3 w-full gap-1 mb-2">
              {docs.slice(0, 3).map((doc, i) => (
                <div
                  key={i}
                  onClick={() => data.onShowDocDetail?.(doc)}
                  className="bg-default-100 cursor-pointer text-[.6rem] rounded-sm p-1 hover:bg-default-200"
                >
                  {doc.title}
                </div>
              ))}
            </div>
            {docs.length > 3 && (
              <Link
                className="text-[.6rem] cursor-pointer"
                onClick={() => data.onShowAllDocs?.(docs)}
              >
                Show All Documents
              </Link>
            )}
          </>
        )}
      </div>

      <Handle type="target" position={Position.Top} />

      {/* Add Document Button like Add Node */}
      <Button
        onPress={data.onAddDocument}
        style={{ height: "20px" }}
        className="absolute top-full w-14 min-w-[unset] rounded-full mt-1 left-0 border-1 border-default-200 leading-0 p-0 text-[.5rem]"
      >
        Add Doc
      </Button>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  category: CategoryNode,
  instance: InstanceNode,
};

export default function CategoryTree() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);

  // Drawer + Modal states
  const [drawerDocs, setDrawerDocs] = useState<Document[] | null>(null);
  const [docDetail, setDocDetail] = useState<Document | null>(null);

  // Form state for adding document
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocDescription, setNewDocDescription] = useState("");
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const refreshTree = async () => {
    const res = await apiClient.get<ApiResponse>("/category/tree");

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    const categorySpacingX = 300; // horizontal spacing between categories
    const instanceSpacingY = 120; // vertical spacing between instances

    res.data.result.forEach((category, catIdx) => {
      const blockStartX = catIdx * categorySpacingX;

      // place category node horizontally in a row
      newNodes.push({
        id: category.categoryId,
        position: { x: blockStartX, y: 0 },
        data: {
          instanceCount: category.instanceCount,
          documentCount: category.documentCount,
          label: category.name,
        },
        type: "category",
      });

      category.instances.forEach((instance, i) => {
        // stack instances vertically below their category
        newNodes.push({
          id: instance.instanceId,
          position: { x: blockStartX, y: (i + 1) * instanceSpacingY },
          data: {
            label: instance.title,
            documents: instance.documents ?? [],

            onShowAllDocs: (docs: Document[]) => {
              setDrawerDocs(docs);
              setSelectedInstanceId(instance.instanceId);
            },
            onShowDocDetail: (doc: Document) => {
              setDocDetail(doc);
            },
            onAddDocument: () => {
              setSelectedInstanceId(instance.instanceId);
              setDocModalOpen(true);
            },
          },
          type: "instance",
        });

        newEdges.push({
          id: `${category.categoryId}-${instance.instanceId}`,
          source: category.categoryId,
          target: instance.instanceId,
          style: { stroke: "#888" },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleAddNode = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setModalOpen(true);
  };

  // Submit new category
  const handleSubmitCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = { name: formData.get("name") as string };

    try {
      setLoadingCategory(true);
      await apiClient.post("/category/", payload);
      setCategoryModalOpen(false);
      await refreshTree();
      addToast({ title: "Category created", color: "success" });
    } catch (err) {
      console.error("Failed to create category", err);
      addToast({ title: "Failed to create category", color: "danger" });
    } finally {
      setLoadingCategory(false);
    }
  };

  // Submit new document
  const handleSubmitDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInstanceId || !newDocFile) {
      addToast({ title: "Please select a file!", color: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("title", newDocTitle);
    formData.append("description", newDocDescription);
    formData.append("instanceId", selectedInstanceId);
    formData.append("file", newDocFile);

    try {
      setLoading(true);
      await apiClient.post(BACKEND_BASE_URL + "/api/document/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDocModalOpen(false);
      setNewDocTitle("");
      setNewDocDescription("");
      setNewDocFile(null);
      await refreshTree();
    } catch (err) {
      console.error("Failed to add document", err);
      addToast({ title: "Failed to add document", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTree();
  }, []);
  console.log(selectedInstanceId);
  return (
    <div style={{ flex: 1, height: "100vh", position: "relative" }}>
      <div className="absolute top-4 right-4 z-50">
        <Button color="primary" onPress={() => setCategoryModalOpen(true)}>
          New Category
        </Button>
      </div>

      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          data:
            n.type === "category"
              ? { ...n.data, onAddNode: handleAddNode }
              : n.data,
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {/* Drawer for all documents */}
      <Drawer
        placement="right"
        isOpen={!!drawerDocs}
        onOpenChange={() => setDrawerDocs(null)}
      >
        <DrawerContent>
          <DrawerHeader>All Documents</DrawerHeader>
          <DrawerBody>
            {drawerDocs?.length === 0 && (
              <p className="italic text-xs text-default-500">No documents</p>
            )}
            {drawerDocs?.map((doc, i) => (
              <div
                key={i}
                onClick={() => {
                  setDocDetail(doc);
                }}
                className="cursor-pointer p-2 rounded-md hover:bg-default-100"
              >
                <h4 className="font-medium text-sm">{doc.title}</h4>
                <p className="text-xs text-default-600 truncate">
                  {doc.description}
                </p>
              </div>
            ))}
          </DrawerBody>
          <DrawerFooter>
            <Button onPress={() => setDrawerDocs(null)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Document detail modal */}
      {/* Document detail modal */}
      <Modal isOpen={!!docDetail} onOpenChange={() => setDocDetail(null)}>
        <ModalContent>
          <ModalHeader>{docDetail?.title}</ModalHeader>
          <ModalBody>
            <p>{docDetail?.description}</p>
          </ModalBody>
          <ModalFooter>
            {selectedInstanceId && (
              <Button
                as={RouterLink}
                to={`/instance/${selectedInstanceId}`}
                color="primary"
              >
                Open Document Page
              </Button>
            )}
            <Button color="default" onPress={() => setDocDetail(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Instance Modal */}
      <AddInstanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoryId={selectedCategoryId}
        onDone={refreshTree}
      />

      {/* Add Document Modal */}
      <Modal size="md" isOpen={docModalOpen} onOpenChange={setDocModalOpen}>
        <ModalContent>
          <ModalHeader>Add Document</ModalHeader>
          <ModalBody>
            <Form
              onSubmit={handleSubmitDocument}
              className="flex flex-col gap-4"
            >
              <Input
                isRequired
                placeholder="Enter document title..."
                label="Title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
              />
              <Textarea
                isRequired
                placeholder="Enter document description..."
                label="Description"
                value={newDocDescription}
                onChange={(e) => setNewDocDescription(e.target.value)}
                rows={4}
              />
              <Input
                isRequired
                type="file"
                accept="application/pdf"
                label="PDF File"
                onChange={(e) => setNewDocFile(e.target.files?.[0] ?? null)}
              />
              <div className="justify-end w-full flex">
                <Button isLoading={loading} type="submit" color="primary">
                  Submit
                </Button>
              </div>
            </Form>
          </ModalBody>
          <ModalFooter className="py-2"></ModalFooter>
        </ModalContent>
      </Modal>

      {/* Category Modal */}
      <Modal
        size="md"
        isOpen={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
      >
        <ModalContent>
          <ModalHeader>Create Category</ModalHeader>
          <ModalBody>
            <Form
              onSubmit={handleSubmitCategory}
              className="flex flex-col gap-4"
            >
              <Input
                isRequired
                placeholder="Enter category name..."
                label="Name"
                name="name"
                labelPlacement="outside"
              />
              <Button isLoading={loadingCategory} type="submit" color="primary">
                Create
              </Button>
            </Form>
          </ModalBody>
          <ModalFooter className="py-2"></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
