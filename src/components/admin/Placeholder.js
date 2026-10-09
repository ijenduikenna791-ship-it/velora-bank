import { SparklesIcon } from "@/components/ui/icons";

/**
 * Temporary section placeholder used while each admin area is built out.
 * Keeps navigation working (no 404s) and matches the app's styling.
 */
export default function AdminPlaceholder({ title, description, note }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}

      <div className="card mt-6 flex flex-col items-center justify-center gap-3 p-12 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <SparklesIcon size={22} />
        </span>
        <div className="text-sm font-semibold text-ink">Coming up next</div>
        <p className="max-w-sm text-sm text-muted">
          {note || "This section is being built — it'll be live shortly."}
        </p>
      </div>
    </div>
  );
}
