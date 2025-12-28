import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically comes from the middleware matching a locale
  let locale = await requestLocale;
 
  // Ensure that the incoming locale is valid
  if (!locale || !['en', 'zh'].includes(locale)) {
    locale = 'en';
  }
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
