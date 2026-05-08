/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - React Native 네비게이션 구조
 * 인증 상태에 따라 Auth Stack / Main Tab 전환
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, typography } from '../theme/index';

// Auth 화면
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// 메인 탭 화면
import { HomePlaceholder } from '../screens/main/HomeScreen';
import { ChartPlaceholder } from '../screens/main/ChartScreen';
import { LibraryPlaceholder } from '../screens/main/LibraryScreen';
import { ProfilePlaceholder } from '../screens/main/ProfileScreen';

// ──── 네비게이션 타입 정의 ────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Chart: undefined;
  Library: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// ──── 네비게이터 생성 ────
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

/**
 * Auth Stack (로그인/회원가입)
 */
const AuthNavigator = () => (
  <AuthStackNav.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.dark.bgPrimary },
      animation: 'slide_from_right',
    }}
  >
    <AuthStackNav.Screen name="Login" component={LoginScreen} />
    <AuthStackNav.Screen name="Register" component={RegisterScreen} />
  </AuthStackNav.Navigator>
);

/**
 * Main Tab (홈/차트/보관함/프로필)
 */
const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.dark.bgPrimary,
        borderTopColor: colors.dark.border,
        borderTopWidth: 0.5,
        height: 85,
        paddingBottom: 20,
        paddingTop: 10,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray500,
      tabBarLabelStyle: {
        fontFamily: typography.fontFamily,
        fontSize: 11,
        fontWeight: typography.weights.medium,
      },
    }}
  >
    <MainTab.Screen
      name="Home"
      component={HomePlaceholder}
      options={{ tabBarLabel: '홈' }}
    />
    <MainTab.Screen
      name="Chart"
      component={ChartPlaceholder}
      options={{ tabBarLabel: '차트' }}
    />
    <MainTab.Screen
      name="Library"
      component={LibraryPlaceholder}
      options={{ tabBarLabel: '보관함' }}
    />
    <MainTab.Screen
      name="Profile"
      component={ProfilePlaceholder}
      options={{ tabBarLabel: '프로필' }}
    />
  </MainTab.Navigator>
);

/**
 * 루트 네비게이터
 * TODO: Zustand store에서 인증 상태를 구독하여 자동 전환
 */
const AppNavigator: React.FC = () => {
  // TODO: const { isAuthenticated } = useAuthStore();
  const isAuthenticated = false;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
