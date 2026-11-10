/**
 * Site-wide settings. Interface text lives in src/i18n/strings.js.
 * Values in [brackets] are placeholders awaiting real details.
 */
export const site = {
  // Company: Tawhid Auto Rice Mill (name text lives in strings.js → brand.*).
  // Trademark used on the rice packs: Zinia™.
  trademark: 'Zinia',

  // Set to an image path (e.g. '/images/logo.svg') once the logo is ready.
  logo: null,

  capacity: 48, // tons per day

  // `key` points to the label in strings.js → nav.*
  nav: [
    { key: 'home', href: '#home' },
    { key: 'about', href: '#about' },
    { key: 'products', href: '#products' },
    { key: 'production', href: '#production' },
    { key: 'gallery', href: '#gallery' },
    { key: 'contact', href: '#contact' },
  ],

  contact: {
    address: { bn: '[ব্যবসার ঠিকানা]', en: '[Business Address]' },
    phone: { bn: '[ফোন নম্বর]', en: '[Phone Number]' },
    email: { bn: '[ইমেইল ঠিকানা]', en: '[Email Address]' },
  },

  socials: [
    { name: 'Facebook', href: '#' },
    { name: 'Instagram', href: '#' },
    { name: 'LinkedIn', href: '#' },
    { name: 'YouTube', href: '#' },
  ],

  // Show the "preview form" note under the contact form until a backend is connected.
  showFormPreviewNotice: true,
};
