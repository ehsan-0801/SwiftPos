/** Generic stub for module pages that are scaffolded but not yet built. */
export default function Placeholder({ title }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="grid h-64 place-items-center rounded-lg border border-dashed border-border bg-white text-sm text-text-secondary">
        {title} module — to be implemented per the spec build order.
      </div>
    </div>
  )
}
