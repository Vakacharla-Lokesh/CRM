import { useState, useEffect, useRef } from "react";
import { CheckIcon, ChevronsUpDownIcon, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { get } from "@/services/api/core";

type RelationType = "lead" | "deal" | "organization";

interface RelationOption {
  value: string;
  label: string;
}

interface RelationComboboxProps {
  relationType: RelationType | null;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

const ENDPOINT: Record<RelationType, string> = {
  lead: "/leads/search",
  deal: "/deals/search",
  organization: "/organizations/search",
};

function labelFromResult(
  type: RelationType,
  item: Record<string, string>,
): string {
  if (type === "lead")
    return (
      `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || item.email
    );
  if (type === "deal") return item.name;
  return item.name;
}

export function RelationCombobox({
  relationType,
  value,
  onChange,
  disabled = false,
}: RelationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<RelationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when relation type changes
  useEffect(() => {
    onChange(null);
    setOptions([]);
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relationType]);

  // Debounced search
  useEffect(() => {
    if (!relationType || !open) return;

    // If there's no search text and we already populated options for this
    // relation type, skip fetching again to avoid showing the loader every
    // time the popover is toggled open/closed.
    if (!search.trim() && options.length > 0) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const endpoint = ENDPOINT[relationType];
        const query = search.trim() || "a"; // fallback so we get initial results
        const res = await get<Record<string, unknown[]>>(endpoint, {
          q: query,
          limit: 20,
        });

        // Each search endpoint returns { leads: [...] } | { deals: [...] } | { organizations: [...] }
        const items = (res.leads ??
          res.deals ??
          res.organizations ??
          []) as Record<string, string>[];

        setOptions(
          items.map((item) => ({
            value: item._id,
            label: labelFromResult(relationType, item),
          })),
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, relationType, open, options.length]);

  if (!relationType) return null;

  const selected = options.find((o) => o.value === value);
  const placeholder = `Search ${relationType}s…`;
  const listId = `relation-${relationType}-list`;

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">
        {relationType.charAt(0).toUpperCase() + relationType.slice(1)}
      </Label>
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
          <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            disabled={disabled}
            className="w-full justify-between font-normal text-sm h-9"
          >
            <span className={selected ? "" : "text-muted-foreground"}>
              {selected ? selected.label : `Select a ${relationType}…`}
            </span>
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: "var(--radix-popover-trigger-width)" }}
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList id={listId}>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <CommandEmpty>No {relationType}s found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          onChange(
                            option.value === value ? null : option.value,
                          );
                          setOpen(false);
                          setSearch("");
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === option.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
