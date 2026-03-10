import { CheckCheck, Users } from "lucide-react";
import { Input } from "../ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import leadService from "@/services/leadService";

function LeadMultiSelect({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["leads-search-campaign", search],
    queryFn: () =>
      search.length >= 2
        ? leadService.searchLeads({ q: search, limit: 20 })
        : leadService.getAllLeads({ limit: 30 }),
    staleTime: 30_000,
  });

  const leads = data?.leads ?? [];

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search leads..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9"
      />
      <div className="border rounded-lg max-h-44 overflow-y-auto divide-y bg-background">
        {leads.length === 0 && (
          <p className="text-sm text-muted-foreground px-3 py-4 text-center">
            No leads found
          </p>
        )}
        {leads.map((lead) => {
          const isSelected = selectedIds.includes(lead._id);
          return (
            <button
              key={lead._id}
              type="button"
              onClick={() => toggle(lead._id)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                isSelected
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                  {lead.firstName?.[0]}
                </span>
                <span>
                  {lead.firstName} {lead.lastName ?? ""}
                  {lead.email && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      {lead.email}
                    </span>
                  )}
                </span>
              </span>
              {isSelected && (
                <CheckCheck
                  size={14}
                  className="text-primary shrink-0"
                />
              )}
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Users size={12} />
          {selectedIds.length} recipient
          {selectedIds.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}

export default LeadMultiSelect;
