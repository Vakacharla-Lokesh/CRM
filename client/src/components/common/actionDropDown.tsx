import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface ActionDropdownProps {
  id: string;
  type?: string; // e.g. "Organization", "Lead"
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewUsers?: (id: string) => void; // Optional: for tenants to view associated users
  viewUsersLabel?: string; // <-- ADD THIS
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  id,
  type = "Item",
  onEdit,
  onDelete,
  onViewUsers,
  viewUsersLabel = "View Users",
}) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Copy ID */}
        <DropdownMenuItem onClick={handleCopy}>Copy {type} ID</DropdownMenuItem>

        {/* View Users */}
        {onViewUsers && (
          <DropdownMenuItem
            onClick={() => onViewUsers(id)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {viewUsersLabel}
          </DropdownMenuItem>
        )}

        {/* Edit */}
        {onEdit && (
          <DropdownMenuItem
            onClick={() => onEdit(id)}
            className="flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit {type}
          </DropdownMenuItem>
        )}

        {/* Delete */}
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(id)}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Delete {type}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionDropdown;
