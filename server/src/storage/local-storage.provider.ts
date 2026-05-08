/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 로컬 스토리지 프로바이더
 * 개발 환경에서 파일을 로컬 디스크에 저장합니다.
 * 프로덕션에서는 S3StorageProvider로 교체합니다.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { IStorageProvider } from './storage.interface.js';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly basePath: string;

  constructor(private readonly configService: ConfigService) {
    // 환경변수에서 로컬 저장 경로 가져오기
    this.basePath = this.configService.get<string>('storage.localPath') || './uploads';
  }

  async upload(file: Buffer, key: string, _mimeType: string): Promise<string> {
    const filePath = path.join(this.basePath, key);
    const dir = path.dirname(filePath);

    // 디렉토리가 없으면 생성
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, file);

    this.logger.debug(`파일 업로드 완료: ${key}`);
    return key;
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(this.basePath, key);
    return fs.readFile(filePath);
  }

  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    // 로컬 환경에서는 직접 경로 반환 (개발용)
    // 프로덕션에서는 S3 Pre-signed URL로 대체됨
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    try {
      await fs.unlink(filePath);
      this.logger.debug(`파일 삭제 완료: ${key}`);
    } catch (error) {
      this.logger.warn(`파일 삭제 실패 (이미 없을 수 있음): ${key}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.basePath, key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
