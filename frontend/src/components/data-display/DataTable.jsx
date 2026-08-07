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
    <div className="w-full">
      {/* Mobile Distinct Cards Layout */}
      <div className="space-y-3.5 md:hidden">
        {isLoading ? (
          <div className="card p-6"><LoadingState message="Loading dataset..." /></div>
        ) : data.length === 0 ? (
          <div className="card p-6"><EmptyState title={emptyTitle} description={emptyDescription} /></div>
        ) : (
          data.map((row, idx) => {
            const isSelected = selectedRows.includes(row.id);
            return (
              <article
                key={row.id || idx}
                className={`p-4 rounded-xl border bg-white dark:bg-surface-900 shadow-sm transition-all ${
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/40'
                    : 'border-slate-200/90 dark:border-surface-800'
                }`}
              >
                {selectable && (
                  <div className="pb-2.5 mb-2.5 border-b border-slate-100 dark:border-surface-800 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-surface-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectRow && onSelectRow(row.id, e.target.checked)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      Select Record
                    </label>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3">
                  {columns.map((col) => {
                    const content = col.cell ? col.cell(row) : row[col.accessor] !== undefined ? row[col.accessor] : '—';
                    const isAction = /action/i.test(col.header || '');
                    return (
                      <div
                        key={col.key || col.accessor}
                        className={`${
                          isAction
                            ? 'border-t border-slate-100 dark:border-surface-800 pt-3 mt-1 flex flex-wrap items-center justify-between gap-2'
                            : 'flex flex-col gap-0.5'
                        } min-w-0`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-surface-400">
                          {col.header}
                        </p>
                        <div className="min-w-0 break-words text-sm text-slate-800 dark:text-surface-200 [&_*]:max-w-full [&_button]:whitespace-normal font-medium">
                          {content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="card overflow-hidden hidden md:block">
        <div className="responsive-scroll">
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
      </div>

      {pagination && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
