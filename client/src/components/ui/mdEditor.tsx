import MDEditor, {
  type MDEditorProps as MDEditorComponentProps,
} from "@uiw/react-md-editor";
import { useTheme } from "@/context/themeContext";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "@/App.css";

interface MDEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: number;
  preview?: "edit" | "live" | "preview";
  visibleDragbar?: boolean;
  textareaProps?: Omit<
    MDEditorComponentProps["textareaProps"],
    "value" | "disabled"
  >;
  placeholder?: string;
  disabled?: boolean;
}

export function ThemedMDEditor({
  value,
  onChange,
  height = 280,
  preview = "edit",
  visibleDragbar = false,
  textareaProps,
  placeholder,
  disabled = false,
}: MDEditorProps) {
  const { mode } = useTheme();

  const colorMode =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;

  return (
    <div
      data-color-mode={colorMode}
      className="themed-md-editor rounded-md border border-border overflow-hidden"
    >
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        visibleDragbar={visibleDragbar}
        textareaProps={{
          placeholder: placeholder || "Enter text...",
          disabled: disabled,
          ...textareaProps,
        }}
      />
    </div>
  );
}
