"use client";

import { MoreHorizontal, Pencil, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/context/i18n";

export interface ActionItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onClick: () => void;
}

interface ActionMenuProps {
  actions: ActionItem[];
}

export function ActionMenu({ actions }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={16} className="text-text-light" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {actions.map((action, i) => (
          <div key={action.key}>
            {i > 0 && actions[i - 1]?.variant !== action.variant && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={action.variant === "destructive" ? "!text-destructive cursor-pointer" : "cursor-pointer"}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function useRowActions({
  onEdit,
  onDelete,
  onToggleActive,
  isActive,
  showDeactivate = true,
  showDelete = true,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive?: () => void;
  isActive: boolean;
  showDeactivate?: boolean;
  showDelete?: boolean;
}): ActionItem[] {
  const { t } = useLang();

  const actions: ActionItem[] = [
    {
      key: "edit",
      label: t("admin_dashboard.edit") ?? "Edit",
      icon: <Pencil size={14} />,
      onClick: onEdit,
    },
  ];

  if (showDeactivate && onToggleActive) {
    actions.push({
      key: "toggle",
      label: isActive
        ? (t("admin_dashboard.deactivate") ?? "Deactivate")
        : (t("admin_dashboard.activate") ?? "Activate"),
      icon: isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />,
      onClick: onToggleActive,
    });
  }

  if (showDelete) {
    actions.push({
      key: "delete",
      label: t("admin_dashboard.delete") ?? "Delete",
      icon: <Trash2 size={14} />,
      variant: "destructive",
      onClick: onDelete,
    });
  }

  return actions;
}
