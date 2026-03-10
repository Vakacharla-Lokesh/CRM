import type { CampaignTemplate, TemplateCategory } from "@/services/campaignService";

export const CATEGORIES: TemplateCategory[] = [
  "Onboarding",
  "Announcement",
  "Follow-Up",
  "Launch",
  "Custom",
];

export const CATEGORY_STYLE: Record<TemplateCategory, string> = {
  Onboarding:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Announcement:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "Follow-Up":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Launch: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  Custom: "bg-muted text-muted-foreground",
};

export const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "secondary",
  queued: "outline",
  sending: "outline",
  completed: "default",
  failed: "destructive",
};


export const STARTER_TEMPLATES: Omit<
  CampaignTemplate,
  "_id" | "createdBy" | "createdAt" | "updatedAt" | "usageCount"
>[] = [
  {
    name: "Welcome Email",
    description: "Warm intro for new leads",
    category: "Onboarding",
    subject: "Welcome to {{company}} — We're glad you're here 👋",
    body: `Hi {{firstName}},\n\nWelcome! We're thrilled to have you on board.\n\nHere's what you can expect from us:\n- Regular updates on our latest products\n- Exclusive offers just for you\n- Helpful resources to get the most out of our services\n\nFeel free to reply to this email if you have any questions.\n\nWarm regards,\nThe Team`,
  },
  {
    name: "New Pricing",
    description: "Announce pricing changes to your leads",
    category: "Announcement",
    subject: "Introducing Our New Pricing 💰",
    body: `Hi {{firstName}},\n\nWe've updated our pricing to better serve you.\n\nOur new plans are designed to be more flexible and affordable.\n\n[Add pricing details here]\n\nIf you have questions, don't hesitate to reach out.\n\nBest,\nThe Team`,
  },
  {
    name: "Follow-Up Nudge",
    description: "Re-engage cold leads",
    category: "Follow-Up",
    subject: "Quick check-in from {{company}} 🔔",
    body: `Hi {{firstName}},\n\nI wanted to check in and see if you had any questions or if there's anything I can help with.\n\nWould you be open to a quick 15-minute call this week?\n\nLooking forward to hearing from you,\nThe Team`,
  },
  {
    name: "Product Launch",
    description: "Announce a new product or feature",
    category: "Launch",
    subject: "🚀 Introducing [Product Name] — Now Live!",
    body: `Hi {{firstName}},\n\nWe're excited to announce the launch of [Product Name]!\n\nKey highlights:\n- Feature 1\n- Feature 2\n- Feature 3\n\n[Add CTA button or link here]\n\nThank you for your continued support.\n\nThe Team`,
  },
];

export interface TemplateFormState {
  name: string;
  description: string;
  category: TemplateCategory;
  subject: string;
  body: string;
}

export const EMPTY_FORM: TemplateFormState = {
  name: "",
  description: "",
  category: "Custom",
  subject: "",
  body: "",
};