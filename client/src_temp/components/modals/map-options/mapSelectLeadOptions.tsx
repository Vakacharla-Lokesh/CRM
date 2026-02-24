import {
  type ColoredOption,
  type SelectOption,
} from "@/types/interfaces/form-interfaces/select";

export const mapToSelectOptions = <T extends string>(
  options: readonly ColoredOption<T>[],
): SelectOption<T>[] => {
  return options.map((option) => ({
    value: option.value,
    label: (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${option.color}`} />
        <span>{option.value}</span>
      </div>
    ),
  }));
};
