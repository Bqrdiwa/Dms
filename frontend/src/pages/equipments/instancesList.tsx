import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
  Pagination,
  Spinner,
  Link,
} from "@heroui/react";
import { useEffect, useState } from "react";
import ScrollingLayout from "../../layouts/ScrollingLayout";
import apiClient from "../../api/ApiClient";
import { Link as RouterLink } from "react-router-dom";
import { BACKEND_BASE_URL } from "../../api/Setting";
import AddInstanceModal from "../../components/AddInstanceModal";

export default function InstancesListPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [instances, setInstances] = useState<any[]>([]);
  const [getting, setGetting] = useState(true);
  const [mapId, setMapId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Fetch mapId first
  const fetchMapId = async () => {
    try {
      const response = await apiClient.get(BACKEND_BASE_URL + "/api/map/first");
      setMapId(response.data.mapId);
    } catch (error) {
      console.error("❌ Failed to fetch mapId:", error);
    }
  };

  // Fetch instances
  const fetchInstances = async (mapId: string, pageNumber: number = 1) => {
    setGetting(true);
    try {
      const response = await apiClient.get(BACKEND_BASE_URL + "/api/instance", {
        params: { mapId, page: pageNumber, pagesize: pageSize },
      });

      const data = response.data;
      setInstances(data.items ?? []);

      const totalCount = data.totalCount ?? data.items?.length ?? 0;
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("❌ Failed to fetch instances:", error);
    } finally {
      setGetting(false);
    }
  };

  // Run once to get mapId
  useEffect(() => {
    fetchMapId();
  }, []);

  // Fetch instances when mapId or page changes
  useEffect(() => {
    if (mapId) fetchInstances(mapId, page);
  }, [mapId, page]);

  return (
    <ScrollingLayout>
      <div className="flex px-6 items-center justify-between mt-6 w-full">
        <h1 className="font-bold text-xl">Instances</h1>
        <Button color="primary" onPress={onOpen}>
          New instance
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
            <TableColumn>Title</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>Category</TableColumn>
            <TableColumn>Vendor</TableColumn>
            <TableColumn>Tag</TableColumn>
            <TableColumn>Documents</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={getting}
            loadingContent={<Spinner variant="gradient" />}
            emptyContent={"No instances found"}
            items={instances}
          >
            {(item) => (
              <TableRow key={item.instanceId}>
                <TableCell>
                  <Link
                    target="_blank"
                    isBlock
                    to={`/instance/${item.instanceId}`}
                    as={RouterLink}
                  >
                    {item.title}
                  </Link>
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.categoryName}</TableCell>
                <TableCell>{item.vendorName}</TableCell>
                <TableCell>{item.tagName}</TableCell>
                <TableCell>{item.documentCount}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Modal for create */}\
      <AddInstanceModal
        isOpen={isOpen}
        onClose={onClose}
        onDone={async () => {
          mapId && fetchInstances(mapId, page);
        }}
      />
    </ScrollingLayout>
  );
}
