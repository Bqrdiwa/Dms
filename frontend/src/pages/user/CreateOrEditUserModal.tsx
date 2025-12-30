import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Select,
  SelectItem,
  Button,
  Form,
} from "@heroui/react";
import { useEffect, useState, type FormEvent } from "react";
import apiClient from "../../api/ApiClient";
import { BACKEND_BASE_URL } from "../../api/Setting";

export interface User {
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  mapIds: string[];
  role: "USER" | "ADMIN";
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  editingUser: User | null;
}

interface MapSelectProps {
  selectedMapIds: string[]; // multiple selected ids
  onSelectMaps: (ids: string[]) => void;
  className?: string;
}

export function MapSelect({
  selectedMapIds,
  onSelectMaps,
  className,
}: MapSelectProps) {
  const [maps, setMaps] = useState<any[]>([]);

  const fetchMaps = async () => {
    try {
      const res = await apiClient.get(BACKEND_BASE_URL + "/api/map/all");
      setMaps(res.data || []);
    } catch (err) {
      console.error("Error fetching maps:", err);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  return (
    <Select
      placeholder="Select Maps"
      color="primary"
      className={className}
      selectionMode="multiple"
      selectedKeys={selectedMapIds}
      onSelectionChange={(e) => onSelectMaps(e as any)}
    >
      {maps.map((m) => (
        <SelectItem key={m.mapId}>{m.name}</SelectItem>
      ))}
    </Select>
  );
}

export default function CreateOrEditUserModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  editingUser,
}: Props) {
  const [selectedMaps, setSelectedMaps] = useState<string[]>(
    editingUser?.mapIds ?? []
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{editingUser ? "Edit User" : "Create User"}</ModalHeader>

        <ModalBody>
          <Form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="First Name"
              name="firstname"
              isRequired
              defaultValue={editingUser?.firstname}
            />

            <Input
              label="Last Name"
              name="lastname"
              isRequired
              defaultValue={editingUser?.lastname}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              isRequired
              defaultValue={editingUser?.email}
            />

            <Input
              label="Username"
              name="username"
              isRequired
              defaultValue={editingUser?.username}
            />

            {!editingUser && (
              <Input
                label="Password"
                name="password"
                type="password"
                isRequired
              />
            )}
            <MapSelect
              selectedMapIds={selectedMaps}
              onSelectMaps={setSelectedMaps}
              className="mt-2"
            />
            <Select
              label="Role"
              name="role"
              defaultSelectedKeys={[editingUser?.role ?? "USER"]}
            >
              <SelectItem key="USER">USER</SelectItem>
              <SelectItem key="ADMIN">ADMIN</SelectItem>
            </Select>

            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="mb-3"
            >
              {editingUser ? "Update" : "Create"}
            </Button>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
