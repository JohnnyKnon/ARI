# ARI 브랜드 스타일시트 (Brand Style Sheet)

> **Copyright © BZ'NEXA. All rights reserved.**

본 문서는 ARI 플랫폼의 웹(Next.js) 및 앱(React Native) 전반에 걸쳐 적용되는 공통 브랜드 디자인 규격입니다.

---

## 1. 타이포그래피 (Typography)

### 기본 폰트: Pretendard

| 용도 | Weight | Size (Web/App) | Line Height |
| :--- | :--- | :--- | :--- |
| **Display** | Bold (700) | 32px / 28sp | 1.3 |
| **Heading 1** | SemiBold (600) | 24px / 22sp | 1.35 |
| **Heading 2** | SemiBold (600) | 20px / 18sp | 1.4 |
| **Heading 3** | Medium (500) | 18px / 16sp | 1.4 |
| **Body** | Regular (400) | 16px / 14sp | 1.6 |
| **Body Small** | Regular (400) | 14px / 12sp | 1.5 |
| **Caption** | Regular (400) | 12px / 11sp | 1.4 |
| **Button** | SemiBold (600) | 14px / 14sp | 1.0 |

### 폰트 불러오기

- **Web (Next.js):** CDN (`cdn.jsdelivr.net/gh/orioncactus/pretendard`)
- **App (React Native):** `assets/fonts/` 에 OTF/TTF 포함

---

## 2. 브랜드 컬러 (Color Palette)

### Primary

| 이름 | HEX | 용도 |
| :--- | :--- | :--- |
| **ARI Purple** | `#7C3AED` | 메인 CTA |
| **ARI Purple Light** | `#A78BFA` | 호버 상태 |
| **ARI Purple Dark** | `#5B21B6` | 프레스 상태 |
| **ARI Purple Soft** | `#EDE9FE` | 배경 하이라이트 |

### Secondary

| 이름 | HEX | 용도 |
| :--- | :--- | :--- |
| **Coral** | `#F97316` | 트렌딩 |
| **Teal** | `#14B8A6` | 재생 중 |
| **Rose** | `#F43F5E` | 좋아요 |

### Semantic

| 이름 | HEX | 용도 |
| :--- | :--- | :--- |
| **Success** | `#22C55E` | 완료/승인 |
| **Warning** | `#EAB308` | 경고 |
| **Error** | `#EF4444` | 오류/신고 |
| **Info** | `#3B82F6` | 안내 |

### Neutral (Light Mode)

| 이름 | HEX | 용도 |
| :--- | :--- | :--- |
| **Gray 900** | `#111827` | 본문 텍스트 |
| **Gray 700** | `#374151` | 보조 텍스트 |
| **Gray 500** | `#6B7280` | 플레이스홀더 |
| **Gray 300** | `#D1D5DB` | 구분선 |
| **Gray 100** | `#F3F4F6` | 배경 |
| **White** | `#FFFFFF` | 기본 배경 |

### Dark Mode

| 이름 | HEX | 용도 |
| :--- | :--- | :--- |
| **BG Primary** | `#0F0F1A` | 메인 배경 |
| **BG Secondary** | `#1A1A2E` | 카드 배경 |
| **BG Tertiary** | `#252540` | 입력 필드 |
| **Text Primary** | `#F9FAFB` | 본문 |
| **Text Secondary** | `#9CA3AF` | 보조 텍스트 |
| **Border** | `#374151` | 구분선 |

---

## 3. 그라디언트 (Gradients)

| 이름 | 값 | 용도 |
| :--- | :--- | :--- |
| **Brand** | `135deg, #7C3AED → #F97316` | 히어로, 프리미엄 |
| **Player** | `180deg, #0F0F1A → #1A1A2E` | 플레이어 배경 |
| **Chart** | `135deg, #7C3AED → #14B8A6` | 차트 강조 |

---

## 4. 디자인 토큰 (Design Tokens)

### 간격 (Spacing)

`xs: 4px` · `sm: 8px` · `md: 16px` · `lg: 24px` · `xl: 32px` · `2xl: 48px` · `3xl: 64px`

### 라운딩 (Border Radius)

| 토큰 | 값 | 용도 |
| :--- | :--- | :--- |
| `radius-sm` | 6px | 태그, 뱃지 |
| `radius-md` | 12px | 카드, 입력 필드 |
| `radius-lg` | 16px | 모달 |
| `radius-xl` | 24px | 플레이어 위젯 |
| `radius-full` | 9999px | 아바타 |

### 그림자 (Shadows)

| 토큰 | 값 |
| :--- | :--- |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.1)` |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.15)` |
| `shadow-player` | `0 -4px 24px rgba(124,58,237,0.2)` |

### 애니메이션

| 토큰 | 값 |
| :--- | :--- |
| `ease-default` | `200ms ease-in-out` |
| `ease-smooth` | `300ms cubic-bezier(0.4,0,0.2,1)` |
| `ease-bounce` | `500ms cubic-bezier(0.34,1.56,0.64,1)` |

---

## 5. 아이콘

| 사이즈 | 값 | 용도 |
| :--- | :--- | :--- |
| Small | 16px/dp | 인라인 |
| Medium | 24px/dp | 네비게이션 |
| Large | 32px/dp | 플레이어 |
| XLarge | 48px/dp | 온보딩 |

> **라이브러리:** Lucide Icons (Web) / React Native Vector Icons (App)
