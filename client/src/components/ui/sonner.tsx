import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />,
        info: <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />,
        error: <OctagonXIcon className="size-4 text-red-600 dark:text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "font-sans text-sm shadow-md border rounded-[var(--radius)]",
          success:
            "!bg-emerald-50 !border-emerald-200 !text-emerald-900 dark:!bg-emerald-950 dark:!border-emerald-800 dark:!text-emerald-100",
          error:
            "!bg-red-50 !border-red-200 !text-red-900 dark:!bg-red-950 dark:!border-red-800 dark:!text-red-100",
          warning:
            "!bg-amber-50 !border-amber-200 !text-amber-900 dark:!bg-amber-950 dark:!border-amber-800 dark:!text-amber-100",
          info:
            "!bg-blue-50 !border-blue-200 !text-blue-900 dark:!bg-blue-950 dark:!border-blue-800 dark:!text-blue-100",
          description: "!text-[0.8rem] opacity-80",
          actionButton:
            "!bg-primary !text-primary-foreground text-xs font-medium",
          cancelButton:
            "!bg-muted !text-muted-foreground text-xs font-medium",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
