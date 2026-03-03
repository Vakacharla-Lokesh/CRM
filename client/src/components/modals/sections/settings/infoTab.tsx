import type { User } from "@/types";

function InfoTab({ user, initials }: { user: User; initials: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your account overview
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-muted-foreground">
            {user?.email}
          </p>
          <span className="inline-block mt-1 text-xs text-blue-700 dark:text-blue-300 rounded px-2 py-0.5 font-medium capitalize">
            {user?.role?.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "First Name", value: user?.firstName },
          { label: "Last Name", value: user?.lastName },
          { label: "Email", value: user?.email },
          { label: "Role", value: user?.role?.replace("_", " ") },
        ].map((field) => (
          <div
            key={field.label}
            className="rounded-lg border border-border bg-card px-4 py-3"
          >
            <p className="text-xs text-muted-foreground mb-0.5">
              {field.label}
            </p>
            <p className="text-sm font-medium text-foreground capitalize">
              {field.value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InfoTab;
