export interface ColoredOption<T extends string = string> {
  value: T;
  color: string;
}

export interface SelectOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}
