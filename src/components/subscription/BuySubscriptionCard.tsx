import { Link } from 'react-router';
import { ChevronRightIcon, SubscriptionIcon } from '@/components/icons';

interface BuySubscriptionCardProps {
  label: string;
  to?: string;
}

export default function BuySubscriptionCard({
  label,
  to = '/subscription/purchase',
}: BuySubscriptionCardProps) {
  return (
    <Link to={to} className="mx-auto block w-1/2">
      <div className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="relative flex items-center justify-between rounded-[14px] px-5 py-4 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center"
              style={{ color: 'rgb(var(--color-accent-500))' }}
            >
              <SubscriptionIcon className="h-10 w-10" />
            </span>
            <div>
              <div className="text-[15px] font-semibold text-dark-50">{label}</div>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-dark-300 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
