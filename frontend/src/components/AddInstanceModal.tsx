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
import ImageMap from "./MapLocation";

interface AddInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => Promise<void>;
  parentId?: string | null;
}

export default function AddInstanceModal({
  isOpen,
  onClose,
  onDone,
  parentId = null,
}: AddInstanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [isEquipment, setIsEquipment] = useState(false);
  const [mapId, setMapId] = useState<null | string>(null);
  const [pos, setPos] = useState<[number, number] | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const payload: any = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      isEquipment,
    };

    if (parentId) payload.parentId = parentId;

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
      await apiClient.post("/nodes/", payload);
      addToast({ title: "Node created successfully", color: "success" });

      // Reset state
      setIsEquipment(false);
      setMapId(null);
      setPos(null);
      onClose();
      await onDone();
    } catch (err) {
      console.error(err);
      addToast({ title: "Failed to create node", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsEquipment(false);
    setPos(null);
  }, [isOpen]);

  return (
    <Modal size="3xl" isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Add New Node</ModalHeader>
        <ModalBody className="max-h-[50vh] overflow-y-auto">
          <Form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              isRequired
              name="title"
              label="Title"
              placeholder="Enter node title"
              labelPlacement="outside"
            />

            <Textarea
              isRequired
              rows={4}
              name="description"
              label="Description"
              placeholder="Enter description"
              labelPlacement="outside"
            />

            <Checkbox
              checked={isEquipment}
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
