export default function DataTable({ columns, rows, rowKey = '_id', empty = 'No records found.' }) {
  if (!rows?.length) {
    return <p className="px-2 py-8 text-center text-sm text-slate-500">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-3 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey] || row.id} className="border-b border-slate-100 last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-3 align-middle text-slate-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
