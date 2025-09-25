import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Form,
  Pagination,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { useEffect, useState, type FormEvent } from "react";
import ScrollingLayout from "../../layouts/ScrollingLayout";
import apiClient from "../../api/ApiClient";
import { Edit, Trash } from "lucide-react";

export default function TagListPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [tags, setTags] = useState<any[]>([]);
  const [getting, setGetting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<any | null>(null);
  const [deletingTag, setDeletingTag] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingTags, setLoadingTags] = useState<number[]>([]);
  const pageSize = 10;

  // Fetch tags
  const fetchTags = async (pageNumber: number = 1) => {
    setGetting(true);
    try {
      const response = await apiClient.get("/tag/", {
        params: { page: pageNumber, pageSize },
      });

      const data = response.data;

      setTags(data.items ?? []);

      const totalCount = data.totalCount ?? data.items?.length ?? 0;
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("❌ Failed to fetch tags:", error);
    } finally {
      setGetting(false);
    }
  };

  useEffect(() => {
    fetchTags(page);
  }, [page]);

  // Create
  const handleCreateTag = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    try {
      await apiClient.post("/tag/", payload);
      onClose();
      fetchTags(page);
    } catch (error) {
      console.error("❌ Failed to create tag:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdateTag = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTag) return;
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    try {
      await apiClient.put(`/tag/${editingTag.tagId}`, payload);
      setEditingTag(null);
      onClose();
      fetchTags(page);
    } catch (error) {
      console.error("❌ Failed to update tag:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDeleteTag = async () => {
    if (!deletingTag) return;
    setLoading(true);
    try {
      await apiClient.delete(`/tag/${deletingTag.tagId}`);
      fetchTags(page);
      onDeleteClose();
      setDeletingTag(null);
    } catch (error) {
      console.error("❌ Failed to delete tag:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id: number, status: boolean) => {
    setLoadingTags((prev) => [...prev, id]);
    try {
      await apiClient.patch(`/tag/${id}/status`, {
        isActive: status,
      });
      setTags(
        tags.map((i) => (i.tagId == id ? { ...i, isActive: status } : i))
      );
    } catch (error) {
      console.error("❌ Failed to toggle tag status:", error);
    } finally {
      setLoadingTags((prev) => prev.filter((i) => i != id));
    }
  };

  return (
    <ScrollingLayout>
      <div className="flex px-6 items-center justify-between mt-6 w-full">
        <h1 className="font-bold text-xl">Tags</h1>
        <Button
          color="primary"
          onPress={() => {
            setEditingTag(null);
            onOpen();
          }}
        >
          New tag
        </Button>
      </div>

      <div className="px-6 mt-4">
        <Table
          isStriped
          color="primary"
          classNames={{
            wrapper: "min-h-80 p-0 overflow-hidden rounded-lg",
            tbody: "px-6",
            thead: "rounded-none",
            th: " bg-secondary-800 py-4 text-sm !rounded-none text-background",
            base: "rounded-md",
          }}
          bottomContent={
            <div className="flex w-full p-3">
              <Pagination
                variant="light"
                color="primary"
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          }
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Tag</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={getting}
            loadingContent={<Spinner variant="gradient" />}
            emptyContent={"No tags found"}
            items={tags.map((i) => ({
              ...i,
              loading: loadingTags.includes(i.tagId),
            }))}
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip
                    as={Button}
                    isDisabled={item.loading}
                    onPress={() =>
                      handleToggleStatus(
                        item.tagId,
                        item.isActive ? false : true
                      )
                    }
                    color={item.isActive ? "success" : "danger"}
                    variant="flat"
                    className="relative"
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Tooltip
                      content={"Edit"}
                      placement="left"
                      showArrow
                      color={"default"}
                    >
                      <Button
                        size="sm"
                        className="opacity-70 hover:opacity-100"
                        variant="light"
                        isIconOnly
                        onPress={() => {
                          setEditingTag(item);
                          onOpen();
                        }}
                      >
                        <Edit />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      content={"Delete"}
                      placement="left"
                      showArrow
                      color={"danger"}
                    >
                      <Button
                        size="sm"
                        variant="light"
                        className="opacity-70 hover:opacity-100"
                        isIconOnly
                        color="danger"
                        onPress={() => {
                          setDeletingTag(item);
                          onDeleteOpen();
                        }}
                      >
                        <Trash />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal for create / edit */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {editingTag ? "Edit Tag" : "Create New Tag"}
          </ModalHeader>
          <Form
            onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
            className="w-full flex flex-col"
          >
            <ModalBody>
              <Input
                label="Tag ID"
                isRequired
                name="id"
                labelPlacement="outside"
                placeholder="Enter tag id"
                defaultValue={editingTag?.id}
              />
              <Input
                label="Tag Name"
                name="name"
                placeholder="Enter tag name"
                isRequired
                labelPlacement="outside"
                defaultValue={editingTag?.name}
              />
            </ModalBody>
            <ModalFooter className="w-full">
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" isLoading={loading}>
                {editingTag ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>

      {/* Modal for delete confirmation */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Delete Tag</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete the tag{" "}
              <span className="font-semibold">{deletingTag?.name}</span>?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={loading}
              onPress={handleDeleteTag}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScrollingLayout>
  );
}
