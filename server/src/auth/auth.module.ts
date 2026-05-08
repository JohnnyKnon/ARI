/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 인증 모듈
 * JWT + Passport + Refresh Token Rotation
 * 소셜 로그인 Strategy 추가 시 이 모듈에 등록
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';
import { UserSession } from '../users/entities/user-session.entity.js';

/**
 * 만료 시간 문자열('15m', '7d')을 초(number)로 변환
 * @nestjs/jwt 최신 버전에서 expiresIn이 number | StringValue만 허용
 */
function parseExpiryToSeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // 기본 15분
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (multipliers[unit] || 60);
}

@Module({
  imports: [
    // Passport 설정
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT 설정 (비동기로 환경변수에서 시크릿 로드)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: parseExpiryToSeconds(
            configService.get<string>('jwt.accessExpiry') || '15m',
          ),
        },
      }),
    }),

    // 엔티티 등록
    TypeOrmModule.forFeature([User, UserSession]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    // 추후 소셜 로그인 Strategy 추가 위치:
    // KakaoStrategy,
    // GoogleStrategy,
    // AppleStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
