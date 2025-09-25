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
  Select,
  SelectItem,
  useDisclosure,
  Form,
  Pagination,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { useEffect, useState, type FormEvent } from "react";
import ScrollingLayout from "../../layouts/ScrollingLayout";
import apiClient from "../../api/ApiClient";
import { Edit, Trash, Key } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface User {
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
}

export default function UserManagementPage() {
  const { isOpen, onOpen, onClose } = useDisclosure(); // create/edit
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();

  const [users, setUsers] = useState<User[]>([]);
  const [getting, setGetting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const nav = useNavigate();
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      nav("/"); // not logged in
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.role !== "ADMIN") {
        nav("/"); // redirect non-admins
      }
    } catch (err) {
      console.error("Invalid JWT token", err);
      nav("/");
    }
  }, [nav]);
  // Fetch users
  const fetchUsers = async (pageNumber: number = 1) => {
    setGetting(true);
    try {
      const response = await apiClient.get("/admin/users", {
        params: { page: pageNumber, pageSize },
      });

      const data = response.data;

      // Ensure items exist
      setUsers(data.items ?? []);

      // Calculate total pages from totalCount
      const totalCount = data.totalCount ?? data.items?.length ?? 0;
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    } finally {
      setGetting(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // Create / Update
  const handleCreateOrUpdateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);

    try {
      if (editingUser) {
        await apiClient.put(`/admin/user/${editingUser.userId}`, payload);
      } else {
        await apiClient.post("/admin/user/", payload);
      }
      setEditingUser(null);
      onClose();
      fetchUsers(page);
    } catch (error) {
      console.error("❌ Failed to create/update user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setLoading(true);
    try {
      await apiClient.delete(`/admin/user/${deletingUser.userId}`);
      fetchUsers(page);
      setDeletingUser(null);
      onDeleteClose();
    } catch (error) {
      console.error("❌ Failed to delete user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!changingPasswordUser) return;
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password")?.toString();
    const repeatPassword = formData.get("repeatPassword")?.toString();

    if (password !== repeatPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch(
        `/admin/user/${changingPasswordUser.userId}/password`,
        { password }
      );
      setChangingPasswordUser(null);
      onPasswordClose();
    } catch (error) {
      console.error("❌ Failed to change password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollingLayout>
      <div className="flex px-6 items-center justify-between mt-6 w-full">
        <h1 className="font-bold text-xl">Users</h1>
        <Button
          color="primary"
          onPress={() => {
            setEditingUser(null);
            onOpen();
          }}
        >
          New User
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
            <TableColumn>Name</TableColumn>
            <TableColumn>Email</TableColumn>
            <TableColumn>Username</TableColumn>
            <TableColumn>Role</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>

          <TableBody
            isLoading={getting}
            loadingContent={<Spinner variant="gradient" />}
            emptyContent={"No users found"}
            items={users}
          >
            {(user) => (
              <TableRow key={user.userId}>
                <TableCell>
                  {user.firstname} {user.lastname}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Chip
                    color={user.role === "ADMIN" ? "success" : "default"}
                    variant="flat"
                  >
                    {user.role}
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
                          setEditingUser(user);
                          onOpen();
                        }}
                      >
                        <Edit />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      content={"Reset Password"}
                      placement="left"
                      showArrow
                      color={"warning"}
                    >
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        color="warning"
                        className="opacity-70 hover:opacity-100"
                        onPress={() => {
                          setChangingPasswordUser(user);
                          onPasswordOpen();
                        }}
                      >
                        <Key />
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
                        isIconOnly
                        className="opacity-70 hover:opacity-100"
                        color="danger"
                        onPress={() => {
                          setDeletingUser(user);
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

      {/* Create / Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>{editingUser ? "Edit User" : "Create User"}</ModalHeader>
          <ModalBody>
            <Form
              onSubmit={handleCreateOrUpdateUser}
              className="w-full flex flex-col gap-4"
            >
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
                  placeholder={editingUser ? "Leave blank to keep current" : ""}
                  isRequired={!editingUser}
                />
              )}

              <Select
                label="Role"
                name="role"
                defaultSelectedKeys={[editingUser?.role ?? "USER"]}
              >
                {["USER", "ADMIN"].map((r) => (
                  <SelectItem key={r}>{r}</SelectItem>
                ))}
              </Select>
              <Button
                type="submit"
                className="mb-3"
                color="primary"
                isLoading={loading}
              >
                {editingUser ? "Update" : "Create"}
              </Button>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalBody>
            <Form
              onSubmit={handleChangePassword}
              className="w-full flex flex-col gap-4"
            >
              <Input
                label="New Password"
                name="password"
                type="password"
                isRequired
              />
              <Input
                label="Repeat Password"
                name="repeatPassword"
                type="password"
                isRequired
              />
              <Button
                className="mb-3"
                type="submit"
                color="primary"
                isLoading={loading}
              >
                Change Password
              </Button>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Delete User</ModalHeader>
          <ModalBody>
            Are you sure you want to delete user{" "}
            <strong>{deletingUser?.username}</strong>?
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={loading}
              onPress={handleDeleteUser}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScrollingLayout>
  );
}
