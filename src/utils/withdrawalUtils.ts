import i18n from '../i18n';

export const localeMap: Record<string, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  zh: 'zh-CN',
  fa: 'fa-IR',
};

export const formatDate = (date: string | null): string => {
  if (!date) return '-';
  const locale = localeMap[i18n.language] || 'ru-RU';
  return new Date(date).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export type StatusBadge = { labelKey: string; color: string; bgColor: string };

export const withdrawalStatusBadgeConfig: Record<string, StatusBadge> = {
  pending: {
    labelKey: 'admin.withdrawals.status.pending',
    color: 'text-on-warning',
    bgColor: 'bg-warning-500',
  },
  approved: {
    labelKey: 'admin.withdrawals.status.approved',
    color: 'text-on-accent',
    bgColor: 'bg-accent-500',
  },
  rejected: {
    labelKey: 'admin.withdrawals.status.rejected',
    color: 'text-on-error',
    bgColor: 'bg-error-500',
  },
  completed: {
    labelKey: 'admin.withdrawals.status.completed',
    color: 'text-on-success',
    bgColor: 'bg-success-500',
  },
  cancelled: {
    labelKey: 'admin.withdrawals.status.cancelled',
    color: 'text-dark-400',
    bgColor: 'bg-dark-500/20',
  },
};

const unknownBadge: StatusBadge = {
  labelKey: 'admin.withdrawals.status.unknown',
  color: 'text-dark-400',
  bgColor: 'bg-gray-350 dark:bg-gray-650',
};

export function getWithdrawalStatusBadge(status: string): StatusBadge {
  return withdrawalStatusBadgeConfig[status] || unknownBadge;
}

export function getRiskColor(score: number): {
  text: string;
  bg: string;
  bar: string;
  on: string;
} {
  if (score < 30)
    return {
      text: 'text-success-500',
      bg: 'bg-success-500',
      bar: 'bg-success-500',
      on: 'text-on-success',
    };
  if (score < 50)
    return {
      text: 'text-warning-500',
      bg: 'bg-warning-500',
      bar: 'bg-warning-500',
      on: 'text-on-warning',
    };
  if (score < 70)
    return {
      text: 'text-warning-500',
      bg: 'bg-warning-500',
      bar: 'bg-warning-500',
      on: 'text-on-warning',
    };
  return {
    text: 'text-error-500',
    bg: 'bg-error-500',
    bar: 'bg-error-500',
    on: 'text-on-error',
  };
}

export function getRiskLevelColor(level: string): { text: string; bg: string } {
  switch (level) {
    case 'low':
      return { text: 'text-on-success', bg: 'bg-success-500' };
    case 'medium':
      return { text: 'text-on-warning', bg: 'bg-warning-500' };
    case 'high':
      return { text: 'text-on-warning', bg: 'bg-warning-500' };
    case 'critical':
      return { text: 'text-on-error', bg: 'bg-error-500' };
    default:
      return { text: 'text-dark-400', bg: 'bg-dark-500/20' };
  }
}
