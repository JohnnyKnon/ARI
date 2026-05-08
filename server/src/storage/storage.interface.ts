/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 스토리지 프로바이더 인터페이스
 * S3, 로컬, GCS 등 어떤 백엔드든 교체 가능하도록 추상화
 */

/**
 * 스토리지 제공자 인터페이스
 * 구현체를 교체해도 비즈니스 로직 변경 없이 동작합니다.
 *
 * 현재 구현체:
 * - LocalStorageProvider (개발용)
 *
 * 추후 추가 예정:
 * - S3StorageProvider (프로덕션)
 * - GCSStorageProvider (선택)
 */
export interface IStorageProvider {
  /**
   * 파일 업로드
   * @param file - 파일 버퍼
   * @param key - 스토리지 키 (예: "tracks/uuid/original.wav")
   * @param mimeType - MIME 타입
   * @returns 저장된 파일의 접근 URL 또는 키
   */
  upload(file: Buffer, key: string, mimeType: string): Promise<string>;

  /**
   * 파일 다운로드
   * @param key - 스토리지 키
   * @returns 파일 버퍼
   */
  download(key: string): Promise<Buffer>;

  /**
   * 서명된 URL 생성 (임시 접근 URL)
   * @param key - 스토리지 키
   * @param expiresIn - 만료 시간 (초, 기본 3600)
   * @returns 서명된 URL
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * 파일 삭제
   * @param key - 스토리지 키
   */
  delete(key: string): Promise<void>;

  /**
   * 파일 존재 여부 확인
   * @param key - 스토리지 키
   */
  exists(key: string): Promise<boolean>;
}

// DI 토큰 (NestJS Inject용)
export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
