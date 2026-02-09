import { createContext, useContext, useMemo, useState } from 'react';

const translations = {
  en: {
    app: 'Expiry Radar',
    subtitle: 'Smart expiry management for sustainable homes',
    login: 'Login',
    signup: 'Sign Up',
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    shoppingList: 'Shopping List',
    notifications: 'Notifications',
    recipes: 'Smart Recipes',
    urgent: 'Urgent: Use Within 48 Hours',
    soon: 'Expiring Soon',
    safe: 'Safe',
    empty: 'No items yet. Add your first product to start reducing waste.'
  },
  ar: {
    app: 'مدبّر الفائض',
    subtitle: 'إدارة ذكية للصلاحية لمنزل أكثر استدامة',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    dashboard: 'لوحة التحكم',
    inventory: 'المخزون',
    shoppingList: 'قائمة التسوق',
    notifications: 'الإشعارات',
    recipes: 'وصفات ذكية',
    urgent: 'عاجل: استخدم خلال 48 ساعة',
    soon: 'تنتهي قريبًا',
    safe: 'آمنة',
    empty: 'لا توجد عناصر بعد. أضف أول منتج لتقليل الهدر.'
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const value = useMemo(() => ({
    language,
    setLanguage: (lang) => {
      localStorage.setItem('language', lang);
      setLanguage(lang);
    },
    t: translations[language],
    isRtl: language === 'ar'
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
