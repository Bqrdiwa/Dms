import { Input } from "@heroui/react";
import { Key, User } from "lucide-react";

export default function LoginInputs() {
  return (
    <>
      <Input
        variant="bordered"
        labelPlacement="outside"
        label="Username"
        name="username"
        type="text"
        isRequired
        startContent={<User className="text-default-800" />}
        size="lg"
        placeholder="Input your username..."
      />
      <Input
        label="Password"
        labelPlacement="outside"
        size="lg"
        name="password"
        type="password"
        isRequired
        variant="bordered"
        startContent={<Key className="text-default-800" />}
        placeholder="Input you password..."
      />
    </>
  );
}
