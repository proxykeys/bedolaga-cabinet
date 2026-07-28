import { cn } from '@/lib/utils';
import {
  EmailIcon as CentralEmailIcon,
  TelegramIcon as CentralTelegramIcon,
} from '@/components/icons';
import OAuthProviderIcon from './OAuthProviderIcon';

export function TelegramIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <CentralTelegramIcon className={className} />;
}

export function EmailIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <CentralEmailIcon className={className} />;
}

export default function ProviderIcon({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) {
  switch (provider) {
    case 'telegram':
      return <TelegramIcon className={className ?? 'h-6 w-6'} />;
    case 'email':
      return <EmailIcon className={cn('text-dark-300', className ?? 'h-6 w-6')} />;
    default:
      return <OAuthProviderIcon provider={provider} className={className ?? 'h-6 w-6'} />;
  }
}
