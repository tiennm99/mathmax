import * as siteCopy from './site.vi.js';

const locales = { vi: siteCopy };
const defaultLocale = 'vi';

/** Site-wide chrome copy for the default locale. */
export function t() {
  return locales[defaultLocale];
}
