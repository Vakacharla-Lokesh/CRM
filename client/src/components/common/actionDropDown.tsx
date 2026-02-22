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
  type?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewUsers?: (id: string) => void;
  viewUsersLabel?: string;
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

        <DropdownMenuItem onClick={handleCopy}>Copy {type} ID</DropdownMenuItem>

        {onViewUsers && (
          <DropdownMenuItem
            onClick={() => onViewUsers(id)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {viewUsersLabel}
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem
            onClick={() => onEdit(id)}
            className="flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit {type}
          </DropdownMenuItem>
        )}

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
