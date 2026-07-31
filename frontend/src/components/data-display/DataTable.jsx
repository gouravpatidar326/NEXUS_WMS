import { ChevronUp, ChevronDown } from 'lucide-react';
import LoadingState from '@/components/feedback/LoadingState';
import EmptyState from '@/components/feedback/EmptyState';
import Pagination from '@/components/navigation/Pagination';

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display.',
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  pagination,
  onSort,
  sortColumn,
  sortDirection = 'asc',
}) => {
  const isAllSelected =
    data.length > 0 && data.every((row) => selectedRows.includes(row.id));

  return (
    <div className="bg-transparent md:bg-white md:border md:border-surface-200 md:rounded-2xl md:shadow-sm md:overflow-hidden">
      <div className="space-y-4 md:hidden">
        {isLoading ? (
          <div className="p-6 bg-white rounded-2xl border border-surface-200 shadow-sm"><LoadingState message="Loading dataset..." /></div>
        ) : data.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-surface-200 shadow-sm"><EmptyState title={emptyTitle} description={emptyDescription} /></div>
        ) : data.map((row, idx) => {
          const isSelected = selectedRows.includes(row.id);
          return (
            <article
              key={row.id || idx}
              className={`space-y-4 p-5 rounded-2xl border border-surface-200/80 shadow-sm transition hover:shadow-md ${
                isSelected ? 'bg-primary-50/60' : 'bg-white'
              }`}
            >
              {selectable && (
                <label className="flex items-center gap-2 text-xs font-semibold text-surface-600 border-b border-surface-100 pb-2">
                  <input type="checkbox" checked={isSelected} onChange={(e) => onSelectRow && onSelectRow(row.id, e.target.checked)} className="rounded border-surface-300 text-primary-600" />
                  Select Record
                </label>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {columns.map((col, cIdx) => {
                  const content = col.cell ? col.cell(row) : row[col.accessor] !== undefined ? row[col.accessor] : '—';
                  const isAction = /action/i.test(col.header || '');
                  
                  if (isAction) {
                    return (
                      <div key={col.key || col.accessor} className="col-span-2 border-t border-surface-100 pt-3 mt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">{col.header}</p>
                        <div className="mt-1 text-sm text-surface-800">{content}</div>
                      </div>
                    );
                  }

                  // Determine if column should take full width (e.g. name, description, address, email, reference code, id, or first column)
                  const isFullWidth = cIdx === 0 || /name|desc|address|detail|info|ref|id|code|email|phone/i.test(col.header || col.accessor || '');
                  
                  return (
                    <div key={col.key || col.accessor} className={`${isFullWidth ? 'col-span-2' : 'col-span-1'} min-w-0`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-0.5">{col.header}</p>
                      <div className="min-w-0 break-words text-sm text-surface-800 [&_*]:max-w-full [&_button]:whitespace-normal">{content}</div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <div className="responsive-scroll hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-100/70 dark:bg-surface-800/80 text-surface-600 dark:text-surface-400 font-semibold text-xs uppercase tracking-wider border-b border-surface-200 dark:border-surface-700">
            <tr>
              {selectable && (
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                    className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key || col.accessor}
                  className={`p-4 ${col.sortable ? 'cursor-pointer select-none hover:text-surface-900 dark:hover:text-white' : ''} ${col.className || ''}`}
                  onClick={() => col.sortable && onSort && onSort(col.accessor)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && sortColumn === col.accessor && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="h-4 w-4 text-primary-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-primary-600" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800 text-surface-800 dark:text-surface-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8">
                  <LoadingState message="Loading dataset..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const isSelected = selectedRows.includes(row.id);
                return (
                  <tr
                    key={row.id || idx}
                    className={`table-row-hover ${
                      isSelected ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectRow && onSelectRow(row.id, e.target.checked)}
                          className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key || col.accessor} className={`p-4 ${col.cellClassName || ''}`}>
                        {col.cell
                          ? col.cell(row)
                          : row[col.accessor] !== undefined
                          ? row[col.accessor]
                          : '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
};

export default DataTable;
