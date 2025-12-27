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
} from "@heroui/react";
import { useState } from "react";
import apiClient from "../api/ApiClient";
import { BACKEND_BASE_URL } from "../api/Setting";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => Promise<void>;
  nodeId: string | null;
}

export default function AddDocumentModal({
  isOpen,
  onClose,
  onDone,
  nodeId,
}: AddDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmitDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nodeId || !file) {
      addToast({ title: "Please fill all required fields", color: "warning" });
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("nodeId", nodeId);
    formData.append("file", file);

    try {
      setLoading(true);
      await apiClient.post(BACKEND_BASE_URL + "/api/document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast({ title: "Document added successfully", color: "success" });
      onClose();
      setFile(null);
      await onDone();
    } catch (err) {
      console.error("Failed to add document", err);
      addToast({ title: "Failed to add document", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>Add Document</ModalHeader>
        <ModalBody>
          <Form className="flex flex-col gap-1" onSubmit={handleSubmitDocument}>
 

            <div className="grid w-full grid-cols-3 gap-2">
              <Input name="title" placeholder="Title" labelPlacement="outside" isRequired />
              <Input name="revision" placeholder="Revision" labelPlacement="outside" />
              <Input name="fileId" placeholder="FileId" labelPlacement="outside" />
              <Input name="volNo" placeholder="VolNo" labelPlacement="outside" />
              <Input name="reqNo" placeholder="ReqNo" labelPlacement="outside" />
              <Input name="spec" placeholder="Spec" labelPlacement="outside" />
              <Input name="lineNo" placeholder="LineNo" labelPlacement="outside" />
              <Input name="listNo" placeholder="ListNo" labelPlacement="outside" />
              <Input name="partNo" placeholder="PartNo" labelPlacement="outside" />
              <Input name="loopNo" placeholder="LoopNo" labelPlacement="outside" />
              <Input name="manufacture" placeholder="Manufacture" labelPlacement="outside" />
              <Input name="sheet" placeholder="Sheet" labelPlacement="outside" />
              <Input name="poNo" placeholder="PONO" labelPlacement="outside" />
              <Input name="isometricNo" placeholder="IsometricNo" labelPlacement="outside" />
              <Input name="identNo" placeholder="IdentNo" labelPlacement="outside" />
            </div>
           <Textarea
              name="description"
              label="Description"
              placeholder="Enter document description"
              labelPlacement="outside"
              className="w-full"
            />
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              label="File"
              labelPlacement="outside"
              isRequired
            />

            <Button isLoading={loading} color="primary" type="submit" className="mt-2">
              Submit
            </Button>
          </Form>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}
