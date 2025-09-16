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
    Divider,
    Form,
    Textarea,
    addToast,
} from "@heroui/react";
import { Trash } from "lucide-react";
import Excel from "../assets/excel-svgrepo-com 1.png";
import TagAutocomplete from "./SearchForTags";
import ImageMap from "./MapLocation";
import VendorAutocomplete from "./SerachForVendor";
import { BACKEND_BASE_URL } from "../api/Setting";

// ---------- Types ----------
interface Instance {
    instanceId: string;
    title: string;
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
const CategoryNode = ({ data, id }: { data: { label: string; onAddNode?: (id: string) => void }; id: string }) => {
    const handleAddDoc = () => {
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
                    <h4 className="text-[.7rem] font-medium">234</h4>
                    <h5 className="text-default-600 text-[.6rem]">Documents</h5>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h4 className="text-[.7rem] font-medium">234</h4>
                    <h5 className="text-default-600 text-[.6rem]">Documents</h5>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} />

            <Button
                onPress={handleAddDoc}
                style={{ height: "20px" }}
                className="absolute top-full w-14 min-w-[unset] rounded-full mt-1 left-0 border-1 border-default-200 leading-0 p-0 text-[.5rem]"
            >
                Add Node
            </Button>
        </div>
    );
};

const InstanceNode = ({ data }: { data: { label: string } }) => (
    <div className="rounded-md w-64 bg-background overflow-hidden">
        <div className="bg-secondary flex w-full p-1 justify-between text-[.8rem] text-center font-medium items-center px-2 text-background">
            <p>{data.label}</p>
            <Trash className="w-3" />
        </div>
        <div className="flex gap-1 items-center flex-col text-center">
            <div className="flex flex-wrap w-full p-2 px-2 gap-1">
                <div className="bg-default-100 text-[.6rem] rounded-sm p-1">Doc Name</div>
            </div>
            <Link className="text-[.6rem] mb-2">Show All Documents</Link>
        </div>
        <Handle type="target" position={Position.Top} />
    </div>
);

const nodeTypes: NodeTypes = {
    category: CategoryNode,
    instance: InstanceNode,
};

export default function CategoryTree() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [pos, setPos] = useState<[number, number] | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [tag, setSelectedTag] = useState<null | string>(null);
    const [vendor, setSelectedVendor] = useState<null | string>(null);
    const [mapId, setMapId] = useState<null | string>(null);

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

        const categorySpacingY = 300;
        const instanceSpacingX = 270;

        res.data.result.forEach((category, catIdx) => {
            const blockStartY = catIdx * categorySpacingY;

            newNodes.push({
                id: category.categoryId,
                position: { x: 0, y: blockStartY },
                data: { label: category.name },
                type: "category",
            });

            category.instances.forEach((instance, i) => {
                newNodes.push({
                    id: instance.instanceId,
                    position: { x: i * instanceSpacingX, y: blockStartY + 120 },
                    data: { label: instance.title },
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

    // Submit new instance
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedCategoryId || !tag || !vendor || !mapId || !pos) {
            addToast({
                title: "Place the marker on the map!",
                color: "warning",
            });
            return;
        }

        const formData = new FormData(e.currentTarget);
        const payload = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            categoryId: selectedCategoryId,
            tagId: tag,
            vendorId: vendor,
            mapId: mapId,
            posX: pos[0],
            posY: pos[1],
        };

        try {
            setLoading(true);
            await apiClient.post(BACKEND_BASE_URL + "/api" + "/instance/", payload);
            setModalOpen(false);
            setSelectedCategoryId(null);
            setSelectedTag(null);
            setSelectedVendor(null);
            setMapId(null);
            setPos(null);

            await refreshTree();
        } catch (err) {
            console.error("Failed to create instance", err);
            addToast({
                title: "Failed to create instance",
                color: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    // Submit new category
    const handleSubmitCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
            name: formData.get("name") as string,
        };

        try {
            setLoadingCategory(true);
            await apiClient.post("/category/", payload);
            setCategoryModalOpen(false);

            await refreshTree();
            addToast({
                title: "Category created",
                color: "success",
            });
        } catch (err) {
            console.error("Failed to create category", err);
            addToast({
                title: "Failed to create category",
                color: "danger",
            });
        } finally {
            setLoadingCategory(false);
        }
    };

    useEffect(() => {
        refreshTree();
    }, []);

    return (
        <div style={{flex:1, height: "100vh", position: "relative" }}>
            {/* Top-right button */}
            <div className="absolute top-4 right-4 z-50">
                <Button color="primary" onPress={() => setCategoryModalOpen(true)}>
                   New Category
                </Button>
            </div>

            <ReactFlow
                nodes={nodes.map((n) => ({
                    ...n,
                    data: n.type === "category" ? { ...n.data, onAddNode: handleAddNode } : n.data,
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

            {/* Instance Modal */}
            <Modal size="5xl" isOpen={modalOpen} onOpenChange={setModalOpen}>
                <ModalContent>
                    <ModalHeader>Add New Node</ModalHeader>
                    <ModalBody>
                        <h1>Upload Equipment</h1>
                        <div className="flex p-10 flex-col items-center justify-center border-2 border-dashed border-default-300 rounded-md">
                            <img src={Excel} />
                            <p>drag and drop Excel file here...</p>
                        </div>
                        <div className="relative my-3">
                            <p className="absolute left-1/2 top-1/2 bg-white px-2 -translate-1/2">OR</p>
                            <Divider />
                        </div>
                        <div className="flex gap-5">
                            <Form className="flex-1 justify-between" onSubmit={handleSubmit}>
                                <div className="flex w-full flex-col gap-2">
                                    <TagAutocomplete setSelectedTag={setSelectedTag} />
                                    <VendorAutocomplete setSelectedvendor={setSelectedVendor} />
                                    <Input isRequired placeholder="prompt text..." label="title" name="title" labelPlacement="outside" />
                                    <Textarea
                                        isRequired
                                        rows={5}
                                        minRows={3}
                                        maxRows={5}
                                        name="description"
                                        placeholder="prompt text..."
                                        label="description"
                                        labelPlacement="outside"
                                    />
                                </div>
                                <Button isLoading={loading} type="submit" fullWidth color="primary">
                                    Submit
                                </Button>
                            </Form>
                            <ImageMap setMapId={setMapId} setPos={setPos} posX={pos?.[0] ?? 0} posY={pos?.[1] ?? 0} />
                        </div>
                    </ModalBody>
                    <ModalFooter className="py-2"></ModalFooter>
                </ModalContent>
            </Modal>

            {/* Category Modal */}
            <Modal size="md" isOpen={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
                <ModalContent>
                    <ModalHeader>Create Category</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={handleSubmitCategory} className="flex flex-col gap-4">
                            <Input isRequired placeholder="Enter category name..." label="Name" name="name" labelPlacement="outside" />
                            <Button isLoading={loadingCategory} type="submit" color="primary">
                                Create
                            </Button>
                        </Form>
                    </ModalBody>
                    <ModalFooter className="py-2">

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
