import { Users, TrendingUp, BarChart3, GitBranch } from "lucide-react";

export type TabId = "leads" | "deals" | "analytics" | "workflows";

export const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "leads", label: "Leads", icon: Users },
  { id: "deals", label: "Deals", icon: TrendingUp },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "workflows", label: "Workflows", icon: GitBranch },
];

export const leadsMockData = [
  { name: "Arjun Mehta", company: "Infosys", score: 87, status: "New", source: "Website" },
  { name: "Priya Sharma", company: "Razorpay", score: 74, status: "Follow-Up", source: "LinkedIn" },
  { name: "Rohan Das", company: "Swiggy", score: 61, status: "New", source: "Referral" },
  { name: "Kavya Nair", company: "CRED", score: 55, status: "Follow-Up", source: "Email" },
  { name: "Vikram Iyer", company: "Zepto", score: 42, status: "Dead", source: "Cold Call" },
];

export const dealsMockData = [
  {
    title: "Prospecting",
    color: "#6366f1",
    deals: [
      { name: "Infosys Expansion", value: "₹12L" },
      { name: "Swiggy Onboarding", value: "₹4.5L" },
    ],
  },
  {
    title: "Proposal",
    color: "#f59e0b",
    deals: [{ name: "CRED Enterprise", value: "₹28L" }],
  },
  {
    title: "Negotiation",
    color: "#22c55e",
    deals: [
      { name: "Razorpay Pro", value: "₹9L" },
      { name: "Zepto Suite", value: "₹6.2L" },
    ],
  },
  {
    title: "Won",
    color: "#10b981",
    deals: [{ name: "Meesho Deal", value: "₹15L" }],
  },
];

export const analyticsKpis = [
  { label: "Leads This Week", value: "47", delta: "+12%" },
  { label: "Conversion Rate", value: "23%", delta: "+3.1%" },
  { label: "Avg Deal Value", value: "₹8.4L", delta: "+8%" },
];

export const analyticsBars = [42, 67, 55, 80, 73, 91, 63];
export const analyticsDays = ["M", "T", "W", "T", "F", "S", "S"];

export const workflowSteps = [
  { icon: "⚡", label: "Trigger", desc: "Lead score > 70", color: "#f59e0b" },
  { icon: "🔀", label: "Condition", desc: "Source = Website", color: "#6366f1" },
  { icon: "👤", label: "Assign", desc: "Round-robin rep", color: "#22c55e" },
  { icon: "📨", label: "Notify", desc: "Slack + Email", color: "#ec4899" },
];

export const previewTabContent = {
  leads: {
    headline: "Every lead, scored and assigned instantly",
    sub: "Behavioural scoring runs in real time. The right rep gets the right lead before they cool off.",
    bullets: [
      "Auto-capture from web, ads, and API",
      "Score decay for inactive leads",
      "Round-robin or rule-based assignment",
      "Full activity timeline per lead",
    ],
  },
  deals: {
    headline: "Visual pipeline that moves at the speed of sales",
    sub: "Drag-and-drop stages, deal value tracking, and conversion analytics — all in one view.",
    bullets: [
      "Custom pipeline stages per tenant",
      "Deal value forecasting",
      "Won/lost reason tracking",
      "Org-level deal rollups",
    ],
  },
  analytics: {
    headline: "Dashboards your sales team will actually use",
    sub: "Real-time metrics with per-rep breakdowns, trend lines, and exportable reports.",
    bullets: [
      "Live lead & deal volume charts",
      "Per-rep performance scoring",
      "Source attribution tracking",
      "Scheduled snapshot exports to CSV",
    ],
  },
  workflows: {
    headline: "Automations that run while your team sleeps",
    sub: "Build event-driven workflows visually. No code. No ops overhead.",
    bullets: [
      "Trigger on lead score, status, or source",
      "Slack, email, and webhook actions",
      "Conditional branching logic",
      "Full execution audit log",
    ],
  },
};
