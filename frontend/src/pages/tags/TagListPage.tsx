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
} from "@heroui/react";
import { useEffect, useState, type FormEvent } from "react";
import ScrollingLayout from "../../layouts/ScrollingLayout";
import apiClient from "../../api/ApiClient";

export default function TagListPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tags, setTags] = useState<any[]>([]);
  const [getting, setGetting] = useState(true)
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // current page
  const [totalPages, setTotalPages] = useState(1); // backend total pages
  const pageSize = 10; // adjust as your API supports

  // Fetch tags with pagination
  const fetchTags = async (pageNumber: number = 1) => {
    setGetting(true)
    try {
      const response = await apiClient.get("/tag/", {
        params: { page: pageNumber, PageSize: pageSize },
      });
      setTags(response.data.items);
      setTotalPages(response.data.total_pages ?? 1);
    } catch (error) {
      console.error("❌ Failed to fetch tags:", error);
    } finally {
      setGetting(false)
    }
  };

  useEffect(() => {
    fetchTags(page);
  }, [page]);

  const handleCreateTag = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    try {
      await apiClient.post("/tag/", payload);
      onClose();
      fetchTags(page); // refresh current page
    } catch (error) {
      console.error("❌ Failed to create tag:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollingLayout>
      <div className="flex px-6 items-center justify-between mt-6 w-full">
        <h1 className="font-bold text-xl">Tags</h1>
        <Button color="primary" onPress={onOpen}>
          New tag
        </Button>
      </div>

      <div className="px-6 mt-4">
        <Table
          isStriped
          color="primary"
          classNames={{ wrapper: "min-h-80 p-0 overflow-hidden rounded-lg", tbody: "px-6", thead: "rounded-none", th: " bg-secondary-800 py-4 text-sm !rounded-none text-background", base: "rounded-md" }}
          bottomContent={
            <div className="flex w-full p-3">
              <Pagination variant="light" color="primary" page={page} total={totalPages} onChange={setPage} />
            </div>
          }
        >
          <TableHeader className="bg-secondary">
            <TableColumn>ID</TableColumn>
            <TableColumn>Tag</TableColumn>
            <TableColumn>Status</TableColumn>
          </TableHeader>
          <TableBody isLoading={getting} loadingContent={<Spinner variant="gradient" />} emptyContent={"No tags found"} items={tags}>
            {(item) => (
              <TableRow className="text-md" key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip
                    color={item.isActive ? "success" : "danger"}
                    variant="flat"
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal for creating tag */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create New Tag</ModalHeader>
          <Form onSubmit={handleCreateTag} className="w-full flex flex-col">
            <ModalBody className="w-full">
              <Input
                label="Tag ID"
                isRequired
                name="id"
                labelPlacement="outside"
                placeholder="Enter tag id"
                autoFocus
              />
              <Input
                label="Tag Name"
                name="name"
                placeholder="Enter tag name"
                isRequired
                labelPlacement="outside"
              />
            </ModalBody>
            <ModalFooter className="w-full">
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" isLoading={loading}>
                Create
              </Button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>
    </ScrollingLayout>
  );
}
