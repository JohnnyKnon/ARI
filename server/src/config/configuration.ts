/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 환경 설정 로더
 * 모든 환경변수를 구조화된 객체로 반환합니다.
 */

export default () => ({
  // 서버 기본 설정
  port: parseInt(process.env.SERVER_PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // PostgreSQL 데이터베이스
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'ari_db',
    user: process.env.DB_USER || 'ari_user',
    password: process.env.DB_PASSWORD || '',
  },

  // Redis 캐시/세션
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  // RabbitMQ 메시지 큐
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  },

  // JWT 인증
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // 스토리지 (S3 추상화 대비)
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    // S3 설정 (추후 활성화)
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'ap-northeast-2',
      bucket: process.env.AWS_S3_BUCKET || '',
    },
  },

  // CORS 허용 오리진
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  },

  // 워터마킹
  watermark: {
    algorithmVersion: process.env.WATERMARK_ALGORITHM_VERSION || '1.0.0',
    strength: process.env.WATERMARK_STRENGTH || 'medium',
  },
});
