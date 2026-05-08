/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 스토리지 모듈
 * 환경변수(STORAGE_PROVIDER)에 따라 적절한 스토리지 구현체를 제공합니다.
 */

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from './storage.interface.js';
import { LocalStorageProvider } from './local-storage.provider.js';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('storage.provider') || 'local';

        switch (provider) {
          case 'local':
            return new LocalStorageProvider(configService);

          // 추후 S3 프로바이더 추가 시:
          // case 's3':
          //   return new S3StorageProvider(configService);

          // 추후 GCS 프로바이더 추가 시:
          // case 'gcs':
          //   return new GCSStorageProvider(configService);

          default:
            return new LocalStorageProvider(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
