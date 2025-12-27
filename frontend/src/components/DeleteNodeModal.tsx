import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import apiClient from "../api/ApiClient";

interface DeleteNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  onDone: () => Promise<void>;
}

export default function DeleteNodeModal({
  isOpen,
  onClose,
  nodeId,
  onDone,
}: DeleteNodeModalProps) {
  const handleDelete = async () => {
    try {
      await apiClient.delete(`/nodes/${nodeId}`); // DELETE request to the endpoint
      onDone(); // Refresh tree after deletion
      onClose(); // Close the modal after delete
    } catch (err) {}
  };

  return (
    <Modal size="sm" isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this node? This action cannot be
          undone.
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose} color="secondary">
            Cancel
          </Button>
          <Button onPress={handleDelete} color="danger">
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
