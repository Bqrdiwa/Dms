import { Button, Form } from "@heroui/react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginInputs from "./Login";
import apiClient from "../../api/ApiClient";

const FORMHEADER = "bandar imam petrochemical company";

export default function BaseAuth() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate()

  const mode = useMemo(() => {
    return location.hash === "#signup" ? "signup" : "signin";
  }, [location.hash]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await apiClient.post("/auth/login/", payload);
      if (res.status == 200) {
        localStorage.setItem("access", res.data.token);
        nav("/")
      }
    } catch (error) {
      console.error("❌ Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="bg-default-50 px-20 py-12 items-center border-y-2 border-divider w-full"
    >
      <h1 className="uppercase mb-20 text-2xl font-bold text-center w-full">
        {FORMHEADER}
      </h1>
      <div className="flex w-[600px] max-w-full gap-2 flex-col">
        <div className="mb-5">
          <h2 className="text-lg font-medium">Login to DMS Portal</h2>
          <h3 className="text-default-900">
            Sign in to manage and access company documents
          </h3>
        </div>

        {mode === "signin" ? <LoginInputs /> : <LoginInputs />}
        {mode == "signin" ? (
          <Button isLoading={loading} type="submit" color="primary" className="mt-5" fullWidth>
            Login
          </Button>
        ) : (
          <Button isLoading={loading} type="submit" color="primary" className="mt-5" fullWidth>
            Login
          </Button>
        )}
      </div>
    </Form>
  );
}
