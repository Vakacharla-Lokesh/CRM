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
import { Eye, Mail, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useOffline } from "@/context/useOffline";

interface ActionDropdownProps {
  id: string;
  type?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
  onViewUsers?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  viewUsersLabel?: string;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  id,
  type = "Item",
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onViewUsers,
  viewUsersLabel = "View Users",
}) => {
  const { isOnline } = useOffline();

  const handleSendEmail = () => {
    const subject = `${type} Details`;
    const body = `Here are the details:

${type} ID: ${id}
`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={!isOnline}
          title={!isOnline ? "Actions unavailable while offline" : undefined}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSendEmail}
          className="flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Send {type} via Email
        </DropdownMenuItem>

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

        {onActivate != undefined && (
          <DropdownMenuItem
            onClick={() => onActivate(id)}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Eye className="w-4 h-4" />
            Activate {type}
          </DropdownMenuItem>
        )}

        {onDeactivate != undefined && (
          <DropdownMenuItem
            onClick={() => onDeactivate(id)}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Eye className="w-4 h-4" />
            Deactivate {type}
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
