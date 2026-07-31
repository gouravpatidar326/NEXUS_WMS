import { ShieldAlert } from 'lucide-react';

/**
 * A prominent banner displayed on pages where the current user has read-only access.
 * Informs the user why action buttons are missing and who to contact.
 */
const ReadOnlyBanner = ({ message }) => (
  <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
    <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
    <span className="font-medium">
      {message || 'You have read-only access. Contact your Inventory Clerk to perform this action.'}
    </span>
  </div>
);

export default ReadOnlyBanner;
