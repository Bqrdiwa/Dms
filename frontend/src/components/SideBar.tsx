"use client";

import type React from "react";
import { jwtDecode } from "jwt-decode";

import { useEffect, useState } from "react";
import {
  Home,
  FileText,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  Search,
  FileX,
  Tag,
  Users,
} from "lucide-react";
import { Button, cn, Input, Tooltip } from "@heroui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: "Home",
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    id: "Vendor Lists",
    label: "Vendor Lists",
    icon: BarChart3,
    href: "/vendors",
  },
  {
    id: "Tags List",
    label: "Tags List",
    icon: Tag,
    href: "/tags",
  },
  {
    id: "Equipments List",
    label: "Equipments List",
    icon: FileX,
    children: [
      {
        id: "equipments list",
        label: "All Equipments",
        icon: FileText,
        href: "/equipments",
      },
    ],
  },
  {
    id: "OrgChartAndEquipments",
    label: "OrgChartAndEquipments",
    icon: FileText,
    href: "/nodes",
  },
  {
    id: "Users",
    label: "User Management",
    icon: Users,
    href: "/management",
  },
];

interface SidebarPanelProps {
  className?: string;
}

export function SidebarPanel({ className }: SidebarPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const nav = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname == "/" || location.pathname == "/instance")
      setIsCollapsed(true);
  }, [location.pathname]);
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
    // Close all expanded items when collapsing
    if (!isCollapsed) {
      setExpandedItems([]);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      const decoded: any = jwtDecode(token);
      setRole(decoded.role); // assuming your JWT has a `role` field
    } catch (err) {
      console.error("Invalid JWT token", err);
    }
  }, []);

  const handleItemClick = (item: SidebarItem) => {
    if (!item.href) {
      isCollapsed && setIsCollapsed(false);
      toggleExpanded(item.id);
    } else {
      setActiveItem(item.id);
    }
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    return (
      <div key={item.id}>
        <Tooltip
          content={item.label}
          placement="right"
          showArrow
          color={"default"}
          isDisabled={!isCollapsed}
        >
          <Button
            as={item.href ? Link : undefined}
            to={item.href}
            variant={isActive ? "flat" : "light"}
            color={isActive ? "secondary" : "default"}
            isIconOnly={isCollapsed}
            className={cn(
              "w-full text-background",
              level > 0 && "ml-6 w-[calc(100%-1.5rem)]"
            )}
            onPress={() => handleItemClick(item)}
          >
            <Icon
              className={cn("h-5 w-5 flex-shrink-0", isCollapsed && "h-6 w-6")}
            />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left font-medium">
                  {item.label}
                </span>
                {hasChildren && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isExpanded && "rotate-90"
                    )}
                  />
                )}
              </>
            )}
          </Button>
        </Tooltip>

        {/* Render children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-secondary overflow-visible whitespace-nowrap text-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-80",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-primary-100">DMS Portal</h2>
        )}
        <Button
          variant="light"
          isIconOnly
          size="sm"
          onPress={toggleCollapsed}
          className="hover:bg-sidebar-accent text-background"
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X onClick={() => setExpandedItems([])} className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="p-3 mb-10">
        {isCollapsed ? (
          <Button isIconOnly variant="bordered" color="primary">
            <Search />
          </Button>
        ) : (
          <Input
            color="default"
            variant="bordered"
            placeholder="Search..."
            startContent={<Search />}
          />
        )}
      </div>
      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-x-hidden overflow-y-auto">
        {sidebarItems
          .filter((item) => item.id !== "Users" || role === "ADMIN")
          .map((item) => renderSidebarItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 flex flex-col text-center items-center">
        <Tooltip
          content={"Logout"}
          placement={isCollapsed ? "right" : "top"}
          showArrow
          color={"default"}
        >
          <Button
            onPress={() => {
              localStorage.removeItem("access");
              nav("/auth");
            }}
            color="primary"
            variant="flat"
            className="bg-primary-200"
            isIconOnly
            size="lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#292D32"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="1.5"
                d="M17.44 14.62 20 12.06 17.44 9.5M9.76 12.06h10.17M11.76 20c-4.42 0-8-3-8-8s3.58-8 8-8"
              ></path>
            </svg>
          </Button>
        </Tooltip>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              exit={{ scale: [1, 0], height: [40, 0] }}
              className="text-xs h-10 flex items-end text-center"
            >
              Designed by Bandar Imam Petrochemical Company
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
