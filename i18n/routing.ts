import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'fr'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Prefix strategy
  pathnames: {
    '/': '/',
    '/dashboard': {
      en: '/dashboard',
      fr: '/tableau-de-bord'
    },
    '/feedback/new': {
      en: '/feedback/new',
      fr: '/commentaires/nouveau'
    },
    '/feedback/edit/[id]': {
      en: '/feedback/edit/[id]',
      fr: '/commentaires/modifier/[id]'
    },
    '/feedback/[id]': {
      en: '/feedback/[id]',
      fr: '/commentaires/[id]'
    }
  }
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);