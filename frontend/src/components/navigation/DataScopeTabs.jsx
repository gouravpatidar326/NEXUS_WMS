import { Building, Globe } from 'lucide-react';

const DataScopeTabs = ({ activeTab, onChange }) => {
  return (
    <div className="inline-flex items-center p-1 bg-surface-100/50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl">
      <button
        onClick={() => onChange('OWN')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeTab === 'OWN'
            ? 'bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm border border-surface-200/50 dark:border-surface-700'
            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
        }`}
      >
        <Building className="w-4 h-4" />
        My Company
      </button>
      
      <button
        onClick={() => onChange('OTHER')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeTab === 'OTHER'
            ? 'bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm border border-surface-200/50 dark:border-surface-700'
            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
        }`}
      >
        <Globe className="w-4 h-4" />
        Client Companies
      </button>
    </div>
  );
};

export default DataScopeTabs;
