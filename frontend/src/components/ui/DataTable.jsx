/**
 * Shared list-page table (spec §7.5 / §10). Column-driven; `columns` is an
 * array of { key, label, render? }. Search/filter/pagination are passed in
 * by the page so this component stays presentational.
 */
export default function DataTable({ columns, rows, emptyText = 'No records found.' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-bg-base text-left text-text-secondary">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-text-secondary"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="border-t border-border hover:bg-bg-base"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
