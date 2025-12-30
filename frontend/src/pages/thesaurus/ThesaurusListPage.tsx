import {
  Button,
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

export default function ThesaurusListPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [thesauruss, setThesauruss] = useState<any[]>([]);
  const [getting, setGetting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingThesaurus, setEditingThesaurus] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Fetch thesauruss
  const fetchThesauruss = async (pageNumber: number = 1) => {
    setGetting(true);
    try {
      const response = await apiClient.get("/thesaurus/", {
        params: { page: pageNumber, pageSize },
      });

      const data = response.data;

      setThesauruss(data.items ?? []);

      const totalCount = data.totalCount ?? data.items?.length ?? 0;
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("❌ Failed to fetch thesauruss:", error);
    } finally {
      setGetting(false);
    }
  };

  useEffect(() => {
    fetchThesauruss(page);
  }, [page]);

  // Create
  const handleCreateThesaurus = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    try {
      await apiClient.post("/thesaurus/", payload);
      onClose();
      fetchThesauruss(page);
    } catch (error) {
      console.error("❌ Failed to create thesaurus:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdateThesaurus = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingThesaurus) return;
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    try {
      await apiClient.put(`/thesaurus/${editingThesaurus.tagId}`, payload);
      setEditingThesaurus(null);
      onClose();
      fetchThesauruss(page);
    } catch (error) {
      console.error("❌ Failed to update thesaurus:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollingLayout>
      <div className="flex px-6 items-center justify-between mt-6 w-full">
        <h1 className="font-bold text-xl">Thesauruses</h1>
        <Button
          color="primary"
          onPress={() => {
            setEditingThesaurus(null);
            onOpen();
          }}
        >
          New thesaurus
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
              {thesauruss.length > 0 && (
                <Pagination
                  variant="light"
                  color="primary"
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                />
              )}
            </div>
          }
        >
          <TableHeader>
            <TableColumn>ThesaurusId</TableColumn>
            <TableColumn>Title</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={getting}
            loadingContent={<Spinner variant="gradient" />}
            emptyContent={"No thesaurus found"}
            items={thesauruss}
          >
            {(item) => (
              <TableRow key={item.thesaurusId}>
                <TableCell>{item.thesaurusId}</TableCell>
                <TableCell>{item.title}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal for create / edit */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {editingThesaurus ? "Edit Thesaurus" : "Create New Thesaurus"}
          </ModalHeader>
          <Form
            onSubmit={
              editingThesaurus ? handleUpdateThesaurus : handleCreateThesaurus
            }
            className="w-full flex flex-col"
          >
            <ModalBody>
              <Input
                label="Thesaurus Title"
                name="title"
                placeholder="Enter thesaurus title"
                isRequired
                labelPlacement="outside"
                defaultValue={editingThesaurus?.title}
              />
            </ModalBody>
            <ModalFooter className="w-full">
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" isLoading={loading}>
                {editingThesaurus ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>
    </ScrollingLayout>
  );
}
