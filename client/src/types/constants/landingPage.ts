import {
  Users,
  Building2,
  DollarSign,
  BarChart3,
  Phone,
  MessageSquare,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";

export const features = [
  {
    icon: Users,
    title: "Lead Management",
    description:
      "Track and qualify leads through your sales funnel with rich profiles, scoring, and status tracking.",
  },
  {
    icon: DollarSign,
    title: "Deal Pipeline",
    description:
      "Move deals from prospecting to close with stage-based tracking and deal value management.",
  },
  {
    icon: Building2,
    title: "Organization Tracking",
    description:
      "Maintain detailed company profiles with industry, size, website, and linked leads.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-Tenant & RBAC",
    description:
      "Isolated workspaces per tenant with role-based access — user, admin, and super admin.",
  },
  {
    icon: Phone,
    title: "Call Logs",
    description:
      "Log incoming and outgoing calls with status, duration, and notes for complete history.",
  },
  {
    icon: MessageSquare,
    title: "Comments & Activity",
    description:
      "Attach comments to leads and keep a full audit trail of every customer interaction.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time metrics on leads, deals, conversion rates, and campaign performance.",
  },
  {
    icon: Zap,
    title: "Bulk Operations",
    description:
      "Create or update hundreds of leads, deals, and organizations in a single transactional request.",
  },
  {
    icon: Globe,
    title: "Offline Support",
    description:
      "Queue actions when offline and auto-sync when your connection is restored.",
  },
];

export const stats = [
  { label: "Entities Managed", value: "Leads & Deals" },
  { label: "Access Control", value: "Role-Based" },
  { label: "Architecture", value: "Multi-Tenant" },
  { label: "Data Ops", value: "Bulk + Transactional" },
];
