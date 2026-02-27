"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { ChangeEvent, useTransition } from 'react';
import { routing } from '@/i18n/routing';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
    const [isPending, startTransition] = useTransition();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
        const nextLocale = event.target.value as (typeof routing.locales)[number];
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    }

    return (
        <div className="relative inline-block text-left">
            <select
                defaultValue={locale}
                disabled={isPending}
                onChange={onSelectChange}
                className={`appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer disabled:opacity-50 transition-colors
                    ${compact ? 'py-1.5 pl-2 pr-6 text-xs' : 'py-2 pl-3 pr-8 text-sm'}
                `}
            >
                <option value="en">English</option>
                <option value="hi-en">Hinglish</option>
                <option value="hi">हिंदी</option>
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center text-zinc-500 ${compact ? 'px-1.5' : 'px-2'}`}>
                <svg className={compact ? "h-3 w-3" : "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>
        </div>
    );
}
