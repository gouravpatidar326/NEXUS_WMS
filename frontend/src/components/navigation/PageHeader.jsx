import Breadcrumb from './Breadcrumb';

export const PageHeader = ({ title, description, breadcrumbs, actions }) => {
  return (
    <section className="space-y-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm sm:p-6">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end [&>button]:w-full sm:[&>button]:w-auto [&>div]:flex [&>div]:w-full [&>div]:flex-col [&>div]:gap-2 sm:[&>div]:w-auto sm:[&>div]:flex-row [&>div>button]:w-full sm:[&>div>button]:w-auto">{actions}</div>}
      </div>
    </section>
  );
};

export default PageHeader;
