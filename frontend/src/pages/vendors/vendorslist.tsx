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
} from "@heroui/react";
import { useEffect, useState, type FormEvent } from "react";
import ScrollingLayout from "../../layouts/ScrollingLayout";
import apiClient from "../../api/ApiClient";

export default function VendorListPage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [vendors, setVendors] = useState<any[]>([]);
    const [getting, setGetting] = useState(true)
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const fetchVendors = async (pageNumber: number = 1) => {
        setGetting(true)
        try {
            const response = await apiClient.get("/vendor/", {
                params: { page: pageNumber, page_size: pageSize },
            });
            setVendors(response.data.items);
            setTotalPages(response.data.total_pages ?? 1);
        } catch (error) {
            console.error("❌ Failed to fetch tags:", error);
        } finally {
            setGetting(false)
        }
    };

    useEffect(() => {
        fetchVendors(page);
    }, [page]);

    const handleCreateTag = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData.entries());
        setLoading(true);
        try {
            await apiClient.post("/vendor/", payload);
            onClose();
            fetchVendors(page); // refresh current page
        } catch (error) {
            console.error("❌ Failed to create tag:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollingLayout>
            <div className="flex px-6 items-center justify-between mt-6 w-full">
                <h1 className="font-bold text-xl">Vendors</h1>
                <Button color="primary" onPress={onOpen}>
                    New vendor
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
                        <TableColumn>Vendor Name</TableColumn>
                        <TableColumn>Vendor Description</TableColumn>
                    </TableHeader>
                    <TableBody isLoading={getting} loadingContent={<Spinner variant="gradient" />} emptyContent={"No vendors found"} items={vendors}>
                        {(item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>
                                    <p className="text-default-600">{item.description}</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal for creating tag */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Create New Vendor</ModalHeader>
                    <Form onSubmit={handleCreateTag} className="w-full flex flex-col">
                        <ModalBody className="w-full">
                            <Input
                                label="Vendor ID"
                                isRequired
                                name="id"
                                labelPlacement="outside"
                                placeholder="Enter vendor id"
                                autoFocus
                            />
                            <Input
                                label="Vendor Name"
                                name="name"
                                placeholder="Enter vendor name"
                                isRequired
                                labelPlacement="outside"
                            />
                            <Textarea isRequired labelPlacement="outside" label="Vendor Description" name="description" minRows={3} maxRows={5} placeholder="Enter vendor description..." />
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
