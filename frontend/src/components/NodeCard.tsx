import { Button, Chip } from "@heroui/react";
import { Handle, Position } from "@xyflow/react";
import { FileText, Trash, Edit } from "lucide-react"; // Added Edit icon

const NodeCard = ({
  data,
  id,
  onEditNode, // Function to handle edit
}: {
  data: {
    title: string;
    description?: string;
    isEquipment: boolean;
    documentCount?: number;
    onAddChild?: (parentId: string) => void;
    onAddDocument?: (nodeId: string) => void;
  };
  id: string;
  onEditNode: (nodeId: string) => void; // Passed from parent to trigger edit modal
}) => {
  const handleAddChild = () => data.onAddChild?.(id);
  const handleAddDocument = () => data.onAddDocument?.(id);

  return (
    <div className="relative w-64 rounded-lg bg-background border border-default-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-primary text-background flex items-center justify-between p-2 rounded-t-lg text-sm font-semibold">
        <span>{data.title}</span>
        <div className="flex gap-2">
          {/* Edit Button */}
          <Edit
            className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100"
            onClick={() => onEditNode(id)} // Trigger edit modal on click
          />
          <Trash className="w-4 cursor-pointer opacity-70 hover:opacity-100" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3 text-xs text-default-700">
        {data.description && (
          <p className="line-clamp-3 text-default-600">{data.description}</p>
        )}

        <div className="flex justify-between items-center mt-2">
          {data.isEquipment && (
            <Chip color="primary" size="sm" variant="flat">
              Equipment
            </Chip>
          )}

          {typeof data.documentCount === "number" && (
            <div className="flex items-center gap-1 text-default-600 text-[0.75rem]">
              <FileText size={14} />
              <span>{data.documentCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* React Flow handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Action Buttons */}
      <div className="absolute top-full left-0 flex gap-2 mt-2">
        <Button
          onPress={handleAddChild}
          style={{ height: "22px" }}
          className="w-16 min-w-[unset] rounded-full border border-default-200 text-[0.65rem]"
        >
          Add Node
        </Button>
        <Button
          onPress={handleAddDocument}
          style={{ height: "22px" }}
          color="secondary"
          className="w-24 min-w-[unset] rounded-full border text-[0.65rem]"
        >
          Add Document
        </Button>
      </div>
    </div>
  );
};

export default NodeCard;
