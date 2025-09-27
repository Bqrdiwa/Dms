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
  Select,
  SelectItem,
} from "@heroui/react";
import { useEffect, useState } from "react";
import apiClient from "../api/ApiClient";
import { BACKEND_BASE_URL } from "../api/Setting";
import TagAutocomplete from "./SearchForTags";
import VendorAutocomplete from "./SerachForVendor";
import ImageMap from "./MapLocation";

interface Category {
  categoryId: string;
  name: string;
}

interface AddInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
  onDone: () => Promise<void>; // parent refresh callback
  handleCategorys?: boolean; // if true → show category select
}

export default function AddInstanceModal({
  isOpen,
  onClose,
  categoryId,
  onDone,
  handleCategorys = false,
}: AddInstanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [tag, setSelectedTag] = useState<null | string>(null);
  const [vendor, setSelectedVendor] = useState<null | string>(null);
  const [mapId, setMapId] = useState<null | string>(null);
  const [pos, setPos] = useState<[number, number] | null>(null);

  // category state (only used if handleCategorys = true)
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categoryId
  );
  const [loadingCategories, setLoadingCategories] = useState(false);

  // fetch categories if needed
  useEffect(() => {
    if (handleCategorys) {
      setLoadingCategories(true);
      apiClient
        .get("/category")
        .then((res) => {
          setCategories(res.data.result ?? []);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch categories:", err);
          addToast({ title: "Failed to load categories", color: "danger" });
        })
        .finally(() => setLoadingCategories(false));
    }
  }, [handleCategorys]);

  const handleSubmitInstance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalCategoryId = handleCategorys ? selectedCategoryId : categoryId;

    if (!finalCategoryId || !tag || !vendor || !mapId || !pos) {
      addToast({ title: "Please fill all required fields", color: "warning" });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      categoryId: finalCategoryId,
      tagId: tag,
      vendorId: vendor,
      mapId,
      posX: pos[0],
      posY: pos[1],
      latitude: formData.get("latitude") as string,
      longitude: formData.get("longitude") as string,
    };

    try {
      setLoading(true);
      await apiClient.post(BACKEND_BASE_URL + "/api/instance/", payload);
      addToast({ title: "Instance created", color: "success" });
      onClose();
      setSelectedTag(null);
      setSelectedVendor(null);
      setMapId(null);
      setPos(null);
      setSelectedCategoryId(categoryId ?? null);
      await onDone();
    } catch (err) {
      console.error("Failed to create instance", err);
      addToast({ title: "Failed to create instance", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal size="5xl" isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Add New Node</ModalHeader>
        <ModalBody>
          <h1>Upload Equipment</h1>
          <div className="flex flex-wrap gap-5">
            <Form
              className="flex-1 justify-between"
              onSubmit={handleSubmitInstance}
            >
              <div className="flex w-full flex-col gap-2">
                {/* Category Select if handleCategorys */}
                {handleCategorys && (
                  <Select
                    isRequired
                    label="Category"
                    placeholder="Select a category"
                    labelPlacement="outside"
                    selectedKeys={
                      selectedCategoryId ? [selectedCategoryId] : []
                    }
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    isLoading={loadingCategories}
                  >
                    {categories.map((cat) => (
                      <SelectItem key={cat.categoryId}>{cat.name}</SelectItem>
                    ))}
                  </Select>
                )}

                <TagAutocomplete setSelectedTag={setSelectedTag} />
                <VendorAutocomplete setSelectedvendor={setSelectedVendor} />

                <Input
                  isRequired
                  placeholder="prompt text..."
                  label="Title"
                  name="title"
                  labelPlacement="outside"
                />
                <div className="flex gap-2">
                  <Input
                    isRequired
                    placeholder="Enter the latitude"
                    label="Latitude"
                    name="latitude"
                    labelPlacement="outside"
                  />
                  <Input
                    isRequired
                    placeholder="Enter the longitude"
                    label="Longitude"
                    name="longitude"
                    labelPlacement="outside"
                  />
                </div>
                <Textarea
                  isRequired
                  rows={5}
                  minRows={3}
                  maxRows={5}
                  name="description"
                  placeholder="prompt text..."
                  label="Description"
                  labelPlacement="outside"
                />
              </div>
              <Button
                isLoading={loading}
                type="submit"
                className="mt-2"
                fullWidth
                color="primary"
              >
                Submit
              </Button>
            </Form>

            <ImageMap
              setMapId={setMapId}
              setPos={setPos}
              posX={pos?.[0] ?? 0}
              posY={pos?.[1] ?? 0}
            />
          </div>
        </ModalBody>
        <ModalFooter className="py-2"></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
