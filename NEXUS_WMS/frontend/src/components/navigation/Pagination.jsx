import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 rounded-b-xl text-xs text-surface-600 dark:text-surface-400">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
        <span>
          Showing <strong className="text-surface-900 dark:text-white">{startItem}</strong> to{' '}
          <strong className="text-surface-900 dark:text-white">{endItem}</strong> of{' '}
          <strong className="text-surface-900 dark:text-white">{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="py-1 px-2 text-xs bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded border border-surface-300 dark:border-surface-700"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex max-w-full items-center gap-1 overflow-x-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="!p-1.5"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="!p-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="whitespace-nowrap px-2 py-1 font-semibold text-surface-900 dark:text-surface-100 sm:px-3">
          Page {currentPage} of {totalPages || 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="!p-1.5"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="!p-1.5"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
