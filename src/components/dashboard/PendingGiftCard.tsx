import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GiftIcon } from '@/components/icons';
import type { PendingGift } from '../../api/gift';

interface PendingGiftCardProps {
  gifts: PendingGift[];
  className?: string;
}

export default function PendingGiftCard({ gifts, className }: PendingGiftCardProps) {
  const { t } = useTranslation();

  if (gifts.length === 0) return null;

  return (
    <div className={className ?? 'space-y-3'}>
      {gifts.map((gift) => (
        <motion.div
          key={gift.token}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-gray-200/40 bg-gray-250 p-5 dark:border-gray-800/40 dark:bg-gray-850"
        >
          {/* Subtle glow effect */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-250 blur-2xl dark:bg-gray-850" />

          <div className="relative flex items-start gap-4">
            {/* Gift icon */}
            <GiftIcon className="h-12 w-12 shrink-0 text-accent-500" />

            {/* Content */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-dark-50">{t('gift.pending.title')}</h3>
              <p className="mt-0.5 text-sm text-dark-200">
                {gift.tariff_name && (
                  <span>
                    {gift.tariff_name} — {gift.period_days} {t('gift.days')}
                  </span>
                )}
                {gift.sender_display && (
                  <span className="ml-1 text-dark-300">
                    {t('gift.pending.from', { sender: gift.sender_display })}
                  </span>
                )}
              </p>
              {gift.gift_message && (
                <p className="mt-1.5 line-clamp-2 text-sm italic text-dark-300">
                  &ldquo;{gift.gift_message}&rdquo;
                </p>
              )}
            </div>

            {/* Activate button */}
            <Link
              to={`/gift?tab=activate&code=${gift.token}`}
              className="shrink-0 rounded-xl bg-accent-500 px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-400"
            >
              {t('gift.pending.activate')}
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
