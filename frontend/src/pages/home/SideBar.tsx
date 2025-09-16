import { Divider, Input, Select, SelectItem } from "@heroui/react";
import { Dot, Search } from "lucide-react";
import Marker, { COLOR_CLASSES } from "./Marker";

// ✅ Shared type
export interface Instance {
    instanceId: string;
    title: string;
    categoryId: string;
    description: string;
    categoryName: string;
    tagName: string;
    color?: string; // add this
    vendorName: string;
    posX: number; // ratio like 0.7
    posY: number; // ratio like 0.9
    tagId: number;
}

interface SideBarProps {
    equipments: Instance[];
    onSelect: (inst: Instance) => void;
    loading: boolean;
    focusInstance: Instance | null
}

// 🎨 Hash categoryId into a color index
export const getCategoryColor = (categoryId: string) => {
    let hash = 0;
    for (let i = 0; i < categoryId.length; i++) {
        hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % Object.keys(COLOR_CLASSES).length;
    return Object.keys(COLOR_CLASSES)[index];
};

export default function SideBar({ equipments, loading, onSelect, focusInstance }: SideBarProps) {
    return (
        <div className="w-120 h-full bg-background shadow-md">
            <h1 className="p-6 pb-0 font-bold text-lg">Project Subject</h1>
            <Divider className="mt-6" />

            <div className="flex flex-col gap-5 p-6">
                <Input
                    size="lg"
                    startContent={<Search />}
                    variant="faded"
                    placeholder="Search in equipment's title and code..."
                />
                <div className="flex gap-3">
                    <Select label="layers" labelPlacement="outside" selectedKeys={["2"]} value={"2"}>
                        <SelectItem key={"2"}>Select layer</SelectItem>
                    </Select>
                    <Select label="filters" labelPlacement="outside" selectedKeys={["2"]} value={"2"}>
                        <SelectItem key={"2"}>Select filter</SelectItem>
                    </Select>
                </div>
            </div>

            <div className="flex px-6 justify-between gap-10">
                <h3 className="text-default-600">Results</h3>
                <h3 className="text-default-600">
                    {loading ? "Loading..." : `${equipments.length} items`}
                </h3>
            </div>

            {/* Equipments list */}
            <div className="flex flex-col  p-6 overflow-y-auto max-h-[60vh]">
                {equipments.map((eq, index) => {
                    const color = getCategoryColor(eq.categoryId);
                    return (
                        <div onClick={() => onSelect(eq)} key={eq.instanceId}>
                            <div className={"flex p-3 cursor-pointer rounded-md flex-col gap-1 duration-75 " + (focusInstance == eq ? "bg-default-200" : "")}>
                                <div className="flex justify-between w-full gap-10">
                                    <h4 className="font-semibold">{eq.title}</h4>
                                    <p>{eq.tagId}</p>
                                </div>
                                <div className="flex font-light items-center gap-2">
                                    <Marker color={color} />
                                    <p>{eq.vendorName}</p>
                                    <Dot className="text-default-500" />
                                    <p>{eq.tagName}</p>
                                    <Dot className="text-default-500" />
                                    <p className="text-success">active</p>
                                </div>
                            </div>
                            {index !== equipments.length - 1 && <Divider className={(focusInstance == eq || (index > 0 && (equipments[index + 1] == focusInstance))) ? "opacity-0" : ""} />}
                        </div>
                    );
                })}

                {!loading && equipments.length === 0 && (
                    <p className="text-sm text-default-500">No equipments found.</p>
                )}
            </div>
        </div>
    );
}
