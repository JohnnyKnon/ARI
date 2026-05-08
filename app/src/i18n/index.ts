/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - i18n 다국어 설정
 * 디바이스 언어 감지 및 KO/EN/JA 지원
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

// 디바이스 언어 감지 로직 (Intl 표준 사용으로 에러 방지)
const getDeviceLanguage = (): string => {
  let locale = 'en'; // 기본값 영어

  try {
    // 최신 RN(Hermes)에서 지원하는 표준 JS 방식
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      locale = Intl.DateTimeFormat().resolvedOptions().locale;
    }
  } catch (e) {
    console.log('[i18n] Failed to get device locale, fallback to en:', e);
  }

  if (!locale) return 'en';

  // 앞 두 글자만 추출 (ko-KR -> ko, ja-JP -> ja)
  const langCode = locale.split('_')[0].split('-')[0].toLowerCase();

  // 지원하는 언어만 필터링, 그 외는 영어(en)
  if (langCode === 'ko') return 'ko';
  if (langCode === 'ja') return 'ja';
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
      ja: { translation: ja },
    },
    lng: getDeviceLanguage(), // 안전하게 감지된 언어로 초기화
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react 이미 xss 방지함
    },
  });

export default i18n;
