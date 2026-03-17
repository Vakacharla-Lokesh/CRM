import type { NotificationEventType } from "@/types/notifications";

import {
  UserPlus,
  UserCog,
  UserX,
  ArrowUpRight,
  Briefcase,
  Trophy,
  ThumbsDown,
  Building2,
  Phone,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  CloudOff,
  Cog,
} from "lucide-react";

export const NOTIFICATION_ICONS: Record<
  NotificationEventType,
  { icon: React.ElementType; color: string }
> = {
  // lead events
  lead_created: { icon: UserPlus, color: "text-emerald-500" },
  lead_updated: { icon: UserCog, color: "text-blue-500" },
  lead_deleted: { icon: UserX, color: "text-red-500" },
  lead_converted: { icon: ArrowUpRight, color: "text-purple-500" },
  lead_assigned: { icon: UserPlus, color: "text-emerald-500" },
  // deal events
  deal_created: { icon: Briefcase, color: "text-emerald-500" },
  deal_updated: { icon: Briefcase, color: "text-blue-500" },
  deal_deleted: { icon: Briefcase, color: "text-red-500" },
  deal_won: { icon: Trophy, color: "text-yellow-500" },
  deal_lost: { icon: ThumbsDown, color: "text-red-500" },
  // organization events
  organization_created: { icon: Building2, color: "text-emerald-500" },
  organization_updated: { icon: Building2, color: "text-blue-500" },
  organization_deleted: { icon: Building2, color: "text-red-500" },
  // user events
  user_created: { icon: UserPlus, color: "text-emerald-500" },
  user_added: { icon: UserPlus, color: "text-emerald-500" },
  user_updated: { icon: UserCog, color: "text-blue-500" },
  user_deleted: { icon: UserX, color: "text-red-500" },
  // tenant events
  tenant_created: { icon: Building2, color: "text-emerald-500" },
  tenant_updated: { icon: Building2, color: "text-blue-500" },
  tenant_deleted: { icon: Building2, color: "text-red-500" },
  // activity events
  call_logged: { icon: Phone, color: "text-blue-500" },
  comment_added: { icon: MessageSquare, color: "text-indigo-500" },
  attachment_uploaded: { icon: Paperclip, color: "text-gray-500" },
  // sync/offline events
  sync_completed: { icon: CheckCircle2, color: "text-emerald-500" },
  sync_failed: { icon: AlertCircle, color: "text-red-500" },
  offline_queued: { icon: CloudOff, color: "text-orange-500" },
  // workflow events
  workflow_deleted: {
    icon: Cog,
    color: "text-red-500",
  },
  workflow_created: {
    icon: Cog,
    color: "text-emerald-500",
  },
  workflow_updated: {
    icon: Cog,
    color: "text-blue-500",
  },
};
