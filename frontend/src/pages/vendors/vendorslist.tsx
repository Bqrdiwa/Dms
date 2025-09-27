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
  Textarea,
  Tooltip,
} from "@heroui/react";
import { useEffect, useState, type FormEvent } from "react";
import ScrollingLayout from "../../layouts/ScrollingLayout";
import apiClient from "../../api/ApiClient";
import { Edit, Trash } from "lucide-react";

export default function VendorListPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [vendors, setVendors] = useState<any[]>([]);
  const [getting, setGetting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Fetch vendors
  const fetchVendors = async (pageNumber: number = 1) => {
    setGetting(true);
    try {
      const response = await apiClient.get("/vendor/", {
        params: { page: pageNumber, pageSize: pageSize },
      });

      const data = response.data;

      setVendors(data.items ?? []);

      const totalCount = data.totalCount ?? data.items?.length ?? 0;
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("❌ Failed to fetch vendors:", error);
    } finally {
      setGetting(false);
    }
  };

  useEffect(() => {
    fetchVendors(page);
  }, [page]);

  // Create
  const handleCreateVendor = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    try {
      await apiClient.post("/vendor/", payload);
      onClose();
      fetchVendors(page);
    } catch (error) {
      console.error("❌ Failed to create vendor:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdateVendor = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingVendor) return;
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    try {
      await apiClient.put(`/vendor/${editingVendor.vendorId}`, payload);
      setEditingVendor(null);
      onClose();
      fetchVendors(page);
    } catch (error) {
      console.error("❌ Failed to update vendor:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDeleteVendor = async () => {
    if (!deletingVendor) return;
    setLoading(true);
    try {
      await apiClient.delete(`/vendor/${deletingVendor.vendorId}`);
      fetchVendors(page);
      onDeleteClose();
      setDeletingVendor(null);
    } catch (error) {
      console.error("❌ Failed to delete vendor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollingLayout>
      <div className="flex px-6 items-center justify-between mt-6 w-full">
        <h1 className="font-bold text-xl">Vendors</h1>
        <Button
          color="primary"
          onPress={() => {
            setEditingVendor(null);
            onOpen();
          }}
        >
          New vendor
        </Button>
      </div>

      <div className="px-6 mt-4">
        <Table
          isStriped
          color="primary"
          classNames={{
            wrapper: "min-h-[400px] p-0 overflow-hidden rounded-lg",
            tbody: "px-6",
            thead: "rounded-none",
            th: " bg-secondary-800 py-4 text-sm !rounded-none text-background",
            base: "rounded-md ",
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
            <TableColumn>Name</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={getting}
            loadingContent={<Spinner variant="gradient" />}
            emptyContent={"No vendors found"}
            items={vendors}
          >
            {(item) => (
              <TableRow key={item.vendorId}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <p className="text-default-600">{item.description}</p>
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
                          setEditingVendor(item);
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
                          setDeletingVendor(item);
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
            {editingVendor ? "Edit Vendor" : "Create New Vendor"}
          </ModalHeader>
          <Form
            className="w-full flex flex-col"
            onSubmit={editingVendor ? handleUpdateVendor : handleCreateVendor}
          >
            <ModalBody className="w-full">
              <Input
                label="Vendor ID"
                isRequired
                name={"id"}
                labelPlacement="outside"
                placeholder="Enter vendor id"
                defaultValue={editingVendor?.id}
              />
              <Input
                label="Vendor Name"
                name="name"
                placeholder="Enter vendor name"
                isRequired
                labelPlacement="outside"
                defaultValue={editingVendor?.name}
              />
              <Textarea
                label="Vendor Description"
                name="description"
                placeholder="Enter vendor description"
                isRequired
                minRows={3}
                labelPlacement="outside"
                defaultValue={editingVendor?.description}
              />
            </ModalBody>
            <ModalFooter className="w-full">
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" isLoading={loading}>
                {editingVendor ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>

      {/* Modal for delete confirmation */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Delete Vendor</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete the vendor{" "}
              <span className="font-semibold">{deletingVendor?.name}</span>?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={loading}
              onPress={handleDeleteVendor}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScrollingLayout>
  );
}
