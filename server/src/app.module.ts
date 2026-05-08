/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 루트 애플리케이션 모듈
 * 모든 기능 모듈을 통합하고, 전역 설정을 관리합니다.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// 설정
import configuration from './config/configuration.js';

// 기능 모듈
import { AuthModule } from './auth/auth.module.js';
import { StorageModule } from './storage/storage.module.js';

// 가드
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';

// 엔티티 (TypeORM auto-load 대신 명시적 등록)
import { User } from './users/entities/user.entity.js';
import { UserSession } from './users/entities/user-session.entity.js';
import { Track } from './tracks/entities/track.entity.js';
import { TrackFile } from './tracks/entities/track-file.entity.js';
import { TrackWatermark } from './watermark/entities/track-watermark.entity.js';
import { Report } from './reports/entities/report.entity.js';
import { ReportAction } from './reports/entities/report-action.entity.js';
import { AuditLog } from './legal/entities/audit-log.entity.js';

@Module({
  imports: [
    // ──── 환경 설정 ────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '../.env', // 모노레포 루트의 .env 사용
    }),

    // ──── PostgreSQL + TypeORM ────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [
          User,
          UserSession,
          Track,
          TrackFile,
          TrackWatermark,
          Report,
          ReportAction,
          AuditLog,
        ],
        // 개발 환경에서만 자동 스키마 동기화 (프로덕션에서는 migration 사용)
        synchronize: configService.get<string>('nodeEnv') === 'development',
        logging: configService.get<string>('nodeEnv') === 'development',
      }),
    }),

    // ──── Rate Limiting (Redis 기반) ────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (_configService: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,   // 1분 (밀리초)
            limit: 100,   // 기본 100회/분
          },
        ],
      }),
    }),

    // ──── 기능 모듈 ────
    AuthModule,
    StorageModule,

    // TODO: 추후 추가 모듈
    // UsersModule,
    // TracksModule,
    // StreamingModule,
    // WatermarkModule,
    // ReportsModule,
    // ChartsModule,    // Phase 2
    // CollabModule,    // Phase 2
  ],
  providers: [
    // JWT Auth Guard를 전역으로 적용
    // @Public() 데코레이터가 없는 모든 라우트에 인증 요구
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
