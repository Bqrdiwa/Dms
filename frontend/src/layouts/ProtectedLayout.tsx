import { Outlet } from "react-router-dom";
import SessionProvider from "../api/SessionProvider";
import { SidebarPanel } from "../components/SideBar";

const ProtectedLayout = () => {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-reper bg-background w-full">
        <SidebarPanel />
        <Outlet />
      </div>
    </SessionProvider>
  );
};

export default ProtectedLayout;
