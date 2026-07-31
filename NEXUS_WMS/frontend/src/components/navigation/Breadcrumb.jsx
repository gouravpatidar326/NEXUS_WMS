import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="responsive-scroll mb-1 flex items-center gap-2 whitespace-nowrap pb-1 text-xs text-surface-500 dark:text-surface-400">
      <Link
        to="/dashboard"
        className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 transition"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3 text-surface-400" />
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-surface-800 dark:text-surface-200">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
