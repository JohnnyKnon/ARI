/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - React Native 앱 엔트리포인트
 * 네비게이션, 상태바, 테마 초기화, i18n 다국어 초기화 및 언어 복원
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import AppNavigator from './src/navigation/AppNavigator';

// i18n 글로벌 초기화
import './src/i18n';

function App(): React.JSX.Element {
  const { i18n } = useTranslation();

  // 앱 시작 시 저장된 언어 불러오기
  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('user-language');
        if (storedLang) {
          i18n.changeLanguage(storedLang);
        }
      } catch (e) {
        console.log('[App] Failed to load stored language:', e);
      }
    };
    loadStoredLanguage();
  }, [i18n]);

  return (
    <SafeAreaProvider>
      {/* 다크 모드 상태바 (사이버 미니멀리즘 배경색 적용) */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0A0A12"
        translucent={false}
      />
      {/* 네비게이션 라우터 */}
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
