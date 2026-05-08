/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - NestJS 서버 엔트리포인트
 * 보안 설정, CORS, Validation Pipe, 글로벌 필터/인터셉터 초기화
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ──── API 기본 경로 설정 ────
  app.setGlobalPrefix('api/v1');

  // ──── 보안 헤더 (Helmet) ────
  app.use(helmet());

  // ──── 쿠키 파서 (Refresh Token 쿠키 읽기용) ────
  app.use(cookieParser());

  // ──── CORS 설정 ────
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true, // Refresh Token 쿠키 전송 허용
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
  });

  // ──── 전역 Validation Pipe ────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // DTO에 없는 필드 자동 제거
      forbidNonWhitelisted: true, // DTO에 없는 필드 전송 시 에러
      transform: true,      // 자동 타입 변환
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ──── 전역 예외 필터 (통일된 에러 형식) ────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ──── 전역 응답 인터셉터 (통일된 성공 형식) ────
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ──── 서버 시작 ────
  const port = process.env.SERVER_PORT || 4000;
  await app.listen(port);

  logger.log(`🎵 ARI API Server running on port ${port}`);
  logger.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
