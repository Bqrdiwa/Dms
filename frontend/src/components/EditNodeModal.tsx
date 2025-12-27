import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Form,
  addToast,
  Checkbox,
} from "@heroui/react";
import { useEffect, useState } from "react";
import apiClient from "../api/ApiClient";
import { Spinner } from "@heroui/react"; // Add a spinner for loading state
import ImageMap from "./MapLocation";

interface EditNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => Promise<void>;
  nodeId: string;
}

export default function EditNodeModal({
  isOpen,
  onClose,
  onDone,
  nodeId,
}: EditNodeModalProps) {
  const [loading, setLoading] = useState(true);
  const [nodeData, setNodeData] = useState<any | null>(null); // Store node data
  const [isEquipment, setIsEquipment] = useState(false);
  const [mapId, setMapId] = useState<null | string>(null);
  const [pos, setPos] = useState<[number, number] | null>(null);

  // Fetch the current data of the node
  useEffect(() => {
    if (nodeId && isOpen) {
      const fetchNodeData = async () => {
        setLoading(true); // Show loading indicator
        try {
          const response = await apiClient.get(`/nodes/${nodeId}`);
          const data = response.data;
          setNodeData(data);
          setIsEquipment(data.isEquipment);
          setMapId(data.mapId || null);
          setPos([data.posX || 0, data.posY || 0]);
        } catch (err) {
          addToast({ title: "Failed to load node data", color: "danger" });
        } finally {
          setLoading(false); // Hide loading indicator after data is fetched
        }
      };

      fetchNodeData();
    }
  }, [nodeId, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nodeData) return;

    const formData = new FormData(e.currentTarget);
    const payload: any = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      isEquipment,
    };

    if (isEquipment) {
      if (!mapId || !pos) {
        addToast({
          title: "Please select a position on the map",
          color: "warning",
        });
        return;
      }
      payload.mapId = mapId;
      payload.posX = pos[0];
      payload.posY = pos[1];
    }

    try {
      setLoading(true);
      await apiClient.put(`/nodes/${nodeId}`, payload); // PUT request to update
      addToast({ title: "Node updated successfully", color: "success" });

      onClose();
      await onDone(); // Trigger refresh or update of tree
    } catch (err) {
      addToast({ title: "Failed to update node", color: "danger" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setNodeData(null);
    setLoading(true);
  }, [isOpen]);
  // Show loading spinner if data is being fetched
  if (!nodeData) {
    return (
      <Modal size="3xl" isOpen={isOpen} onOpenChange={onClose}>
        <ModalContent>
          <ModalHeader>Edit Node</ModalHeader>
          <ModalBody className="flex justify-center items-center">
            <Spinner size="lg" color="primary" /> {/* Show loading spinner */}
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal size="3xl" isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Edit Node</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              isRequired
              name="title"
              label="Title"
              defaultValue={nodeData.title}
              placeholder="Enter node title"
              labelPlacement="outside"
            />

            <Textarea
              rows={4}
              name="description"
              defaultValue={nodeData.description}
              label="Description"
              placeholder="Enter description"
              labelPlacement="outside"
            />

            <Checkbox
              isSelected={isEquipment}
              onChange={(e) => setIsEquipment(e.target.checked)}
            >
              Is Equipment (enable map position)
            </Checkbox>

            {isEquipment && (
              <div className="mx-auto">
                <ImageMap
                  setMapId={setMapId}
                  setPos={setPos}
                  posX={pos?.[0] ?? 0}
                  posY={pos?.[1] ?? 0}
                />
              </div>
            )}

            <Button isLoading={loading} type="submit" color="primary" fullWidth>
              Submit
            </Button>
          </Form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}
