export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: string | number;
  trend: "up" | "down";
}
