/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - API 서비스 클라이언트
 * 서버와의 통신 추상화 계층 (JWT 자동 갱신 포함)
 */

const API_BASE_URL = __DEV__
  ? 'http://localhost:4000/api/v1'  // 개발 환경
  : 'https://api.ari.app/api/v1';  // 프로덕션 (추후 변경)

// 메모리에 Access Token 저장 (보안 - AsyncStorage 사용 금지)
let accessToken: string | null = null;

/**
 * Access Token 설정 (로그인/회원가입 후 호출)
 */
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

/**
 * Access Token 가져오기
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

/**
 * API 요청 헬퍼
 * - 자동 Authorization 헤더 추가
 * - 401 응답 시 토큰 갱신 시도
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Access Token이 있으면 헤더에 추가
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Refresh Token 쿠키 포함
  });

  // 401 → Access Token 만료 → Refresh 시도
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // 갱신 성공 → 원래 요청 재시도
      headers['Authorization'] = `Bearer ${accessToken}`;
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });
      return retryResponse.json() as Promise<T>;
    }
  }

  return response.json() as Promise<T>;
};

/**
 * Access Token 갱신 (Refresh Token 사용)
 */
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Refresh Token 쿠키 전송
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.accessToken) {
        setAccessToken(data.data.accessToken);
        return true;
      }
    }

    // 갱신 실패 → 토큰 제거 (로그인 화면으로 이동 필요)
    setAccessToken(null);
    return false;
  } catch {
    setAccessToken(null);
    return false;
  }
};

// ──── Auth API ────
export const authApi = {
  register: (body: {
    email: string;
    password: string;
    displayName: string;
    tosVersion: string;
    tosAgreedAt: string;
  }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    apiRequest('/auth/logout', { method: 'POST' }),

  getSessions: () =>
    apiRequest('/auth/sessions'),
};
