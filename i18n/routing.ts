import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['en', 'hi-en', 'hi'],
    defaultLocale: 'en'
});

export const { Link, usePathname, useRouter } = createNavigation(routing);
