# ARI API 설계 (API Design)

> **Copyright © BZ'NEXA. All rights reserved.**
>
> Base URL: `/api/v1` | Protocol: REST | Format: JSON

---

## 1. 공통 규약

### Response Format

```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "인증 토큰이 만료되었습니다.",
    "statusCode": 401
  }
}
```

### 공통 헤더

| 헤더 | 값 | 필수 |
| :--- | :--- | :--- |
| `Authorization` | `Bearer {accessToken}` | 인증 필요 API |
| `Content-Type` | `application/json` | POST/PATCH |
| `X-Device-Id` | 디바이스 고유 ID | 앱 전용 |
| `Accept-Language` | `ko` / `en` | 선택 |

### 인증 레벨

| 레벨 | 설명 |
| :--- | :--- |
| 🔓 **Public** | 인증 불필요 |
| 🔐 **Auth** | Access Token 필수 |
| 🛡️ **Admin** | 관리자 권한 필수 |

---

## 2. Auth API — 인증

### `POST /auth/register` 🔓

회원가입. ToS 동의 필수.

**Request Body:**
```json
{
  "email": "artist@example.com",
  "password": "SecureP@ss123",
  "displayName": "AI작곡가",
  "tosVersion": "1.0.0",
  "tosAgreedAt": "2026-05-08T00:00:00Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "displayName": "..." },
    "accessToken": "jwt..."
  }
}
```

> Refresh Token은 `Set-Cookie` (httpOnly, Secure, SameSite=Strict)로 전달

---

### `POST /auth/login` 🔓

**Request Body:**
```json
{
  "email": "artist@example.com",
  "password": "SecureP@ss123"
}
```

**Response:** `200 OK` — register와 동일 구조

---

### `POST /auth/refresh` 🔓

Refresh Token (쿠키)으로 새 Access Token 발급. **Rotation 적용.**

**Response:** `200 OK` — 새 accessToken + 새 Refresh Token 쿠키

---

### `POST /auth/logout` 🔐

현재 세션의 Refresh Token 무효화.

**Response:** `200 OK`

---

### `DELETE /auth/sessions/:sessionId` 🔐

특정 세션 강제 로그아웃 (기기 관리).

---

### `GET /auth/sessions` 🔐

활성 세션 목록 조회.

**Response:**
```json
{
  "data": [
    {
      "id": "session-uuid",
      "deviceName": "iPhone 15",
      "ipAddress": "203.xxx.xxx.xxx",
      "lastUsedAt": "2026-05-08T10:00:00Z",
      "isCurrent": true
    }
  ]
}
```

---

## 3. Users API — 사용자

### `GET /users/me` 🔐

내 프로필 조회.

### `PATCH /users/me` 🔐

프로필 수정 (displayName, bio, avatar).

### `GET /users/:id/profile` 🔓

공개 아티스트 프로필 조회.

---

## 4. Tracks API — 음원

### `POST /tracks` 🔐

음원 업로드. `multipart/form-data` 사용.

**Request:**
```
POST /api/v1/tracks
Content-Type: multipart/form-data

- file: (오디오 파일, WAV/FLAC/MP3, max 100MB)
- coverImage: (이미지, JPEG/PNG, max 5MB, optional)
- title: "한강의 선율"
- genre: "korean-fusion"
- mood: "dreamy"
- tags: "국악,퓨전,ambient"
- description: "AI로 재해석한 한국적 선율"
- aiModel: "Suno v4"
- trainingDataSource: "자체 제작 미디 데이터"
- isFullyAi: true
```

**처리 흐름:**
1. 파일 검증 (형식, 크기)
2. 원본 → Storage 임시 저장
3. `content_declarations` 기록
4. RabbitMQ → 워터마킹 + 인코딩 큐 발행
5. 완료 후 `tracks`, `track_files` 레코드 생성

**Response:** `201 Created`

---

### `GET /tracks` 🔓

음원 목록 (페이지네이션 + 필터).

**Query Parameters:**

| 파라미터 | 타입 | 설명 |
| :--- | :--- | :--- |
| `page` | number | 페이지 (default: 1) |
| `limit` | number | 개수 (default: 20, max: 50) |
| `genre` | string | 장르 필터 |
| `mood` | string | 분위기 필터 |
| `search` | string | 제목/태그 검색 |
| `sort` | string | latest / popular / trending |
| `userId` | UUID | 특정 유저의 트랙만 |

---

### `GET /tracks/:id` 🔓

음원 상세 조회. 조회 시 `plays` 기록 생성하지 않음 (스트리밍 시에만).

---

### `PATCH /tracks/:id` 🔐

메타데이터 수정 (본인 업로드만).

### `DELETE /tracks/:id` 🔐

음원 삭제 (본인 or Admin).

---

## 5. Streaming API — 스트리밍

### `GET /tracks/:id/stream` 🔓

오디오 스트리밍. Range Request 지원.

**Response Headers:**
```
Content-Type: audio/mpeg
Accept-Ranges: bytes
Content-Range: bytes 0-999999/5000000
```

**동작:**
- 재생 시작 시 `plays` 레코드 생성
- 30초 이상 재생 시 유효 재생으로 카운트 (어뷰징 방지)
- 비로그인 유저: IP 해시로 중복 카운트 제한

---

### `GET /tracks/:id/download` 🔐

Pocket MP3 다운로드. ARI Pass 구독자 전용 (MVP에서는 로그인 유저 전체).

---

## 6. Engagement API — 좋아요/공유

### `POST /tracks/:id/like` 🔐

좋아요 토글 (존재하면 삭제, 없으면 생성).

### `GET /tracks/:id/like` 🔐

좋아요 여부 확인.

### `POST /tracks/:id/share` 🔐

공유 기록.

**Request Body:**
```json
{ "platform": "kakao" }
```

---

## 7. Reports API — 신고

### `POST /reports` 🔐

신고 접수. 접수 즉시 자동 심사 큐 발행.

**Request Body:**
```json
{
  "trackId": "uuid",
  "reason": "copyright",
  "description": "상업 음원 '봄날'과 유사한 멜로디 패턴 발견",
  "evidenceUrls": ["https://example.com/evidence1.mp3"]
}
```

**reason 값:** `copyright` | `inappropriate` | `fraud` | `other`

**Response:** `201 Created`
```json
{
  "data": {
    "id": "report-uuid",
    "status": "pending",
    "message": "신고가 접수되었습니다. 검토 후 결과를 안내드리겠습니다."
  }
}
```

---

### `GET /reports` 🛡️

신고 목록 (관리자용).

**Query:** `status`, `reason`, `page`, `limit`

---

### `PATCH /reports/:id` 🛡️

신고 처리 (블라인드/반려/복원).

**Request Body:**
```json
{
  "action": "blind",
  "note": "유사도 검사 결과 85% 일치 확인"
}
```

**action 값:** `blind` | `reject` | `restore` | `delete`

---

## 8. Error Codes

| 코드 | HTTP | 설명 |
| :--- | :--- | :--- |
| `AUTH_INVALID_CREDENTIALS` | 401 | 이메일/비밀번호 불일치 |
| `AUTH_TOKEN_EXPIRED` | 401 | Access Token 만료 |
| `AUTH_TOKEN_HIJACKED` | 401 | 토큰 바인딩 불일치 (UA/IP) |
| `AUTH_REFRESH_REVOKED` | 401 | Refresh Token 무효화됨 |
| `USER_NOT_FOUND` | 404 | 사용자 없음 |
| `TRACK_NOT_FOUND` | 404 | 음원 없음 |
| `TRACK_BLINDED` | 403 | 블라인드 처리된 음원 |
| `TRACK_FILE_TOO_LARGE` | 413 | 파일 크기 초과 |
| `TRACK_FORMAT_INVALID` | 422 | 지원하지 않는 형식 |
| `REPORT_DUPLICATE` | 409 | 동일 음원 중복 신고 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `RATE_LIMITED` | 429 | 요청 제한 초과 |

---

## 9. Rate Limiting (Redis 기반)

| 엔드포인트 | 제한 |
| :--- | :--- |
| `POST /auth/login` | 5회/분 (IP 기준) |
| `POST /auth/register` | 3회/시간 (IP 기준) |
| `POST /tracks` | 10회/시간 (유저 기준) |
| `POST /reports` | 5회/시간 (유저 기준) |
| 기타 GET | 100회/분 (유저/IP 기준) |
