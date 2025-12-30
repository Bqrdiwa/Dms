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
  Autocomplete,
  AutocompleteItem,
  Chip,
  addToast,
} from "@heroui/react";
import { useEffect, useState } from "react";
import apiClient from "../api/ApiClient";
import { BACKEND_BASE_URL } from "../api/Setting";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => Promise<void>;
  nodeId: string | null;
}

interface Entity {
  vendorId?: number;
  tagId?: number;
  thesaurusId?: number;
  name?: string;
  title?: string;
}

export default function AddDocumentModal({
  isOpen,
  onClose,
  onDone,
  nodeId,
}: AddDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);

  const [vendorQuery, setVendorQuery] = useState("");
  const [vendorOptions, setVendorOptions] = useState<Entity[]>([]);
  const [vendors, setVendors] = useState<Entity[]>([]);
  const [selectedVendorKey, setSelectedVendorKey] = useState<
    string | undefined
  >();

  const [tagQuery, setTagQuery] = useState("");
  const [tagOptions, setTagOptions] = useState<Entity[]>([]);
  const [tags, setTags] = useState<Entity[]>([]);
  const [selectedTagKey, setSelectedTagKey] = useState<string | undefined>();

  const [thesaurusQuery, setThesaurusQuery] = useState("");
  const [thesaurusOptions, setThesaurusOptions] = useState<Entity[]>([]);
  const [thesauruss, setThesauruss] = useState<Entity[]>([]);
  const [selectedThesaurusKey, setSelectedThesaurusKey] = useState<
    string | undefined
  >();

  const handleExtractEntities = async () => {
    if (!file)
      return addToast({ title: "Please select a file", color: "warning" });
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post(
        `${BACKEND_BASE_URL}/api/document/extract-entities`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setVendors(res.data.vendors || []);
      setTags(res.data.tags || []);
      setThesauruss(res.data.thesauruses || []);

      addToast({ title: "Entities extracted successfully", color: "success" });
      setStep(2);
    } catch (err) {
      console.error(err);
      addToast({ title: "Failed to extract entities", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const searchEntities = async (
    type: "vendor" | "tag" | "thesaurus",
    query: string
  ) => {
    const res = await apiClient.get(`/${type}`, { params: { search: query } });
    return res.data.items.filter((item: Entity) => {
      if (type === "vendor")
        return !vendors.map((i) => i.vendorId).includes(item.vendorId);
      if (type === "tag") return !tags.map((i) => i.tagId).includes(item.tagId);
      if (type === "thesaurus")
        return !thesauruss.map((i) => i.thesaurusId).includes(item.thesaurusId);
      return true;
    });
  };

  useEffect(() => {
    const fetchVendors = async () =>
      setVendorOptions(await searchEntities("vendor", vendorQuery));
    fetchVendors();
  }, [vendorQuery, vendors]);

  useEffect(() => {
    const fetchTags = async () =>
      setTagOptions(await searchEntities("tag", tagQuery));
    fetchTags();
  }, [tagQuery, tags]);

  useEffect(() => {
    const fetchThesauruses = async () =>
      setThesaurusOptions(await searchEntities("thesaurus", thesaurusQuery));
    fetchThesauruses();
  }, [thesaurusQuery, thesauruss]);

  const handleSubmitDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nodeId || !file)
      return addToast({
        title: "Please fill all required fields",
        color: "warning",
      });

    const formData = new FormData(e.currentTarget);
    formData.append("nodeId", nodeId);
    formData.append("file", file);
    formData.append("VendorIds", JSON.stringify(vendors.map((i) => i.vendorId)));
    formData.append("TagIdsTagIds", JSON.stringify(tags.map((i) => i.tagId)));
    formData.append(
      "ThesaurusIds",
      JSON.stringify(thesauruss.map((i) => i.thesaurusId))
    );

    try {
      setLoading(true);
      await apiClient.post(`${BACKEND_BASE_URL}/api/document`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast({ title: "Document added successfully", color: "success" });
      onClose();
      setFile(null);
      setStep(1);
      await onDone();
    } catch (err) {
      console.error(err);
      addToast({ title: "Failed to add document", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStep(1);
    setVendors([]);
    setTags([]);
    setThesauruss([]);
    setSelectedVendorKey(undefined);
    setSelectedTagKey(undefined);
    setSelectedThesaurusKey(undefined);
  }, [isOpen]);
  const reset = () => {
    setVendorQuery("");
    setTagQuery("");
    setSelectedTagKey("");
    setSelectedVendorKey("");
    setSelectedThesaurusKey("");
    setThesaurusQuery("");
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>Add Document</ModalHeader>
        <ModalBody className="max-h-[50vh] overflow-y-auto">
          {step === 1 && (
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                label="Upload File to Extract Entities"
                labelPlacement="outside"
                isRequired
              />
              <Button
                isLoading={loading}
                color="primary"
                onPress={handleExtractEntities}
              >
                Extract Entities
              </Button>
            </div>
          )}

          {step === 2 && (
            <Form
              className="flex flex-col gap-2"
              onSubmit={handleSubmitDocument}
            >
              <div className="grid grid-cols-3">
                <Input
                  name="title"
                  placeholder="Title"
                  labelPlacement="outside"
                  isRequired
                />
                <Input
                  name="docNo"
                  placeholder="Doc No"
                  labelPlacement="outside"
                />
                <Input
                  name="revNo"
                  placeholder="Rev No"
                  labelPlacement="outside"
                />
                <Input
                  name="lineNo"
                  placeholder="Line No"
                  labelPlacement="outside"
                />
                <Input
                  name="volNo"
                  placeholder="Vol No"
                  labelPlacement="outside"
                />
                <Input
                  name="sheetNo"
                  placeholder="Sheet No"
                  labelPlacement="outside"
                />
                <Input
                  name="reqNo"
                  placeholder="Req No"
                  labelPlacement="outside"
                />
                <Input
                  name="orderNo"
                  placeholder="Order No"
                  labelPlacement="outside"
                />
                <Input
                  name="listNo"
                  placeholder="List No"
                  labelPlacement="outside"
                />
                <Input
                  name="loopNo"
                  placeholder="Loop No"
                  labelPlacement="outside"
                />
              </div>

              <Textarea
                name="description"
                placeholder="Description"
                labelPlacement="outside"
              />

              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                label="Upload File"
                labelPlacement="outside"
                isRequired
              />

              <Autocomplete
                items={vendorOptions}
                placeholder="Vendors"
                inputValue={vendorQuery}
                onInputChange={setVendorQuery}
                allowsEmptyCollection
                selectedKey={selectedVendorKey}
                onSelectionChange={(key) => {
                  if (!key) return;
                  const id = Number(key);
                  if (!vendors.map((i) => i.vendorId).includes(id)) {
                    setVendors([
                      ...vendors,
                      vendorOptions.find((i) => i.vendorId === id)!,
                    ]);
                    reset();
                  }
                }}
              >
                {(item) => (
                  <AutocompleteItem key={String(item.vendorId)}>
                    {item.name}
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <div className="flex flex-wrap gap-1 mt-1">
                {vendors.map((v) => (
                  <Chip
                    key={v.vendorId}
                    variant="flat"
                    color="primary"
                    size="sm"
                    className="hover:opacity-70 cursor-pointer"
                    onClick={() =>
                      setVendors(
                        vendors.filter((x) => x.vendorId !== v.vendorId)
                      )
                    }
                  >
                    {v.name}
                  </Chip>
                ))}
              </div>

              <Autocomplete
                items={tagOptions}
                placeholder="Tags"
                inputValue={tagQuery}
                onInputChange={setTagQuery}
                allowsEmptyCollection
                selectedKey={selectedTagKey}
                onSelectionChange={(key) => {
                  if (!key) return;
                  const id = Number(key);
                  if (!tags.map((i) => i.tagId).includes(id)) {
                    setTags([...tags, tagOptions.find((i) => i.tagId === id)!]);
                    reset();
                  }
                }}
              >
                {(item) => (
                  <AutocompleteItem key={String(item.tagId)}>
                    {item.name}
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((t) => (
                  <Chip
                    key={t.tagId}
                    variant="flat"
                    color="primary"
                    size="sm"
                    className="hover:opacity-70 cursor-pointer"
                    onClick={() =>
                      setTags(tags.filter((x) => x.tagId !== t.tagId))
                    }
                  >
                    {t.name}
                  </Chip>
                ))}
              </div>

              <Autocomplete
                items={thesaurusOptions}
                placeholder="Thesauruses"
                inputValue={thesaurusQuery}
                onInputChange={setThesaurusQuery}
                allowsEmptyCollection
                selectedKey={selectedThesaurusKey}
                onSelectionChange={(key) => {
                  if (!key) return;
                  const id = Number(key);
                  if (!thesauruss.map((i) => i.thesaurusId).includes(id)) {
                    setThesauruss([
                      ...thesauruss,
                      thesaurusOptions.find((i) => i.thesaurusId === id)!,
                    ]);
                    reset();
                  }
                }}
              >
                {(item) => (
                  <AutocompleteItem key={String(item.thesaurusId)}>
                    {item.title}
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <div className="flex flex-wrap gap-1 mt-1">
                {thesauruss.map((th) => (
                  <Chip
                    key={th.thesaurusId}
                    variant="flat"
                    color="primary"
                    size="sm"
                    className="hover:opacity-70 cursor-pointer"
                    onClick={() =>
                      setThesauruss(
                        thesauruss.filter(
                          (x) => x.thesaurusId !== th.thesaurusId
                        )
                      )
                    }
                  >
                    {th.title}
                  </Chip>
                ))}
              </div>

              <Button isLoading={loading} color="primary" type="submit">
                Submit
              </Button>
            </Form>
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}
