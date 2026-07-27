import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { infoApi } from '@/api/info';
import { ChevronDownIcon } from '@/components/icons';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Кэш react-query переживает перемонтирование AppShell при смене роута:
  // локальный useState начинал каждый маунт с пустого списка, и до ответа API
  // компонент рендерил null — переключатель «мигал» при каждой навигации.
  const { data } = useQuery({
    queryKey: ['languages'],
    queryFn: infoApi.getLanguages,
    staleTime: 1000 * 60 * 5,
  });
  const availableLanguages = data?.languages ?? [];

  const currentLang = availableLanguages.find((l) => l.code === i18n.language) ||
    availableLanguages[0] || { code: 'ru', name: 'RU', flag: '🇷🇺' };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    // i18n.ts subscribes to languageChanged and syncs <html lang> + dir
    // centrally — no need to set documentElement.dir here.
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  if (availableLanguages.length <= 1) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-sm transition-all ${
          isOpen
            ? 'border-gray-300 bg-gray-300 dark:border-gray-700 dark:bg-gray-700'
            : 'border-gray-200/50 bg-gray-250 hover:border-gray-300 hover:bg-gray-300 dark:border-gray-800/50 dark:bg-gray-850 dark:hover:border-gray-700 dark:hover:bg-gray-800'
        }`}
        aria-label="Change language"
      >
        <span>{currentLang.flag}</span>
        <span className="font-medium text-dark-200">{currentLang.code.toUpperCase()}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-dark-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-40 animate-fade-in rounded-xl border border-gray-200/50 bg-gray-250 py-1 shadow-lg dark:border-gray-800/50 dark:bg-gray-850">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                lang.code === i18n.language
                  ? 'bg-accent-500 text-on-accent'
                  : 'text-dark-300 hover:bg-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
