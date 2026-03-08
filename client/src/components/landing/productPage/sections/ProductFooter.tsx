export default function ProductFooter() {
  return (
    <footer
      className="py-10 px-6"
      style={{
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--background)",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/crm.png" alt="Campaign Flux" className="h-5" />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            Campaign Flux
          </span>
        </div>
        <p
          className="text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          Built with MongoDB · React · Node.js · Socket.IO
        </p>
        <p
          className="text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          © {new Date().getFullYear()} Campaign Flux. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
