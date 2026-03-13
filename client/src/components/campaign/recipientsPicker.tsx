import { X, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import leadService from "@/services/leadService";
import { Badge } from "../ui/badge";

function RecipientsPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["leads-search-campaign", search],
    queryFn: () =>
      search.length >= 1
        ? leadService.searchLeads({ q: search, limit: 20 })
        : leadService.getAllLeads({ limit: 30 }),
    staleTime: 30_000,
  });

  const leads = data?.leads ?? [];

  const selectedLeads = leads.filter((l) => selectedIds.includes(l._id));

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  const remove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const availableLeads = leads.filter((l) => !selectedIds.includes(l._id));

  const selectAll = () => {
    const idsToAdd = availableLeads.map((l) => l._id);
    const merged = Array.from(new Set([...selectedIds, ...idsToAdd]));
    onChange(merged);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Main input area with pills */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-input rounded-md bg-background p-2 text-left focus:outline-none focus:ring-2 focus:ring-ring transition-all hover:border-input/80"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selectedLeads.length > 0 ? (
              selectedLeads.map((lead) => (
                <Badge
                  key={lead._id}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="size-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                    {lead.firstName?.[0]}
                  </span>
                  <span className="text-xs">
                    {lead.firstName} {lead.lastName ?? ""}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => remove(lead._id, e)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                Select recipients...
              </span>
            )}
          </div>
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 border border-input rounded-md bg-background shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-input">
            <Input
              autoFocus
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Actions: Select all / Clear all */}
          <div className="flex items-center justify-end gap-2 px-2 py-1 border-b border-input">
            <button
              type="button"
              onClick={selectAll}
              className="text-sm text-primary hover:underline px-2 py-1 rounded"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-muted-foreground hover:underline px-2 py-1 rounded"
            >
              Clear all
            </button>
          </div>

          {/* Leads list */}
          <div className="max-h-64 overflow-y-auto divide-y">
            {availableLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-4 text-center">
                {search.length === 0
                  ? "Search to find leads"
                  : "No leads found"}
              </p>
            ) : (
              availableLeads.map((lead) => (
                <button
                  key={lead._id}
                  type="button"
                  onClick={() => {
                    toggle(lead._id);
                  }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors"
                >
                  <span className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                    {lead.firstName?.[0]}
                  </span>
                  <span>
                    <span className="font-medium">
                      {lead.firstName} {lead.lastName ?? ""}
                    </span>
                    {lead.email && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        {lead.email}
                      </span>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipientsPicker;
