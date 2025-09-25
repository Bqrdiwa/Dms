import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./Application.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import ProtectedLayout from "./layouts/ProtectedLayout.tsx";
import AuthPage from "./pages/auth/AuthPage.tsx";
import TagListPage from "./pages/tags/TagListPage.tsx";
import VendorListPage from "./pages/vendors/vendorslist.tsx";
import NodesFlow from "./components/Nodes.tsx";
import HomePage from "./pages/home/HomePage.tsx";
import UserManagementPage from "./pages/user/userList.tsx";
import DocsPage from "./pages/home/DocsPage.tsx";
import InstancesListPage from "./pages/equipments/instancesList.tsx";
const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: ProtectedLayout,
        children: [
          { path: "", Component: HomePage },
          {
            path: "/tags",
            Component: TagListPage,
          },
          {
            path: "/vendors",
            Component: VendorListPage,
          },
          {
            path: "/nodes",
            Component: NodesFlow,
          },
          {
            path: "/management",
            Component: UserManagementPage,
          },
          {
            path: "/instance/:id",
            Component: DocsPage,
          },
          {
            path: "/equipments",
            Component: InstancesListPage,
          },
        ],
      },
      {
        path: "/auth",
        Component: AuthPage,
      },
    ],
  },
]);
createRoot(document.getElementById("root")!).render(
  <HeroUIProvider>
    <ToastProvider />
    <RouterProvider router={router} />
  </HeroUIProvider>
);
