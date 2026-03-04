import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { getAvailableVariables } from "./workflowUtils";

interface VariablePickerProps {
  entityType: string;
  onCopy?: (variable: string) => void;
}

export const VariablePicker: React.FC<VariablePickerProps> = ({
  entityType,
  onCopy,
}) => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const variables = getAvailableVariables(entityType);

  const handleCopy = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 2000);
    onCopy?.(variable);
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border">
      {variables.map((variable) => (
        <button
          key={variable}
          type="button"
          onClick={() => handleCopy(variable)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-background hover:bg-accent rounded border transition-colors"
          title={`Click to copy {{${variable}}}`}
        >
          {copiedVar === variable ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="text-foreground">{variable}</span>
        </button>
      ))}
    </div>
  );
};
