/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 인증 서비스
 * JWT + Refresh Token Rotation + Anti-Hijacking
 */

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { UserSession } from '../users/entities/user-session.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './strategies/jwt.strategy.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 회원가입
   * ToS 동의 정보도 함께 기록 (법적 방어)
   */
  async register(
    dto: RegisterDto,
    userAgent: string,
    ipAddress: string,
  ) {
    // 이메일 중복 체크
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException({
        error: 'AUTH_EMAIL_EXISTS',
        message: '이미 사용 중인 이메일입니다.',
      });
    }

    // 비밀번호 해싱 (bcrypt, 12 rounds)
    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

    // 사용자 생성
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });
    await this.userRepository.save(user);

    // TODO: tos_acceptances 테이블에 동의 기록 저장
    // await this.tosRepository.save({ userId: user.id, tosVersion: dto.tosVersion, ... })

    this.logger.log(`새 사용자 등록: ${user.id}`);

    // 토큰 발급
    return this.issueTokens(user, userAgent, ipAddress);
  }

  /**
   * 로그인
   */
  async login(dto: LoginDto, userAgent: string, ipAddress: string) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException({
        error: 'AUTH_INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        error: 'AUTH_ACCOUNT_DISABLED',
        message: '비활성화된 계정입니다.',
      });
    }

    // 마지막 로그인 시각 업데이트
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    return this.issueTokens(user, userAgent, ipAddress);
  }

  /**
   * Refresh Token으로 Access Token 재발급
   * Refresh Token Rotation 적용 (보안)
   */
  async refresh(refreshToken: string, userAgent: string, ipAddress: string) {
    const tokenHash = this.hashToken(refreshToken);

    // 세션 조회
    const session = await this.sessionRepository.findOne({
      where: { refreshTokenHash: tokenHash },
      relations: ['user'],
    });

    if (!session) {
      // 존재하지 않는 토큰 → 이미 rotation되었거나 무효
      this.logger.warn(`존재하지 않는 Refresh Token 사용 시도`);
      throw new UnauthorizedException({
        error: 'AUTH_REFRESH_REVOKED',
        message: '유효하지 않은 세션입니다. 다시 로그인해주세요.',
      });
    }

    // 폐기된 토큰 감지 → 탈취 가능성 → 전체 세션 무효화
    if (session.isRevoked) {
      this.logger.error(`⚠️ 폐기된 Refresh Token 재사용 감지! userId: ${session.userId}`);
      await this.revokeAllSessions(session.userId);
      throw new UnauthorizedException({
        error: 'AUTH_TOKEN_HIJACKED',
        message: '보안 이상이 감지되어 모든 세션이 로그아웃되었습니다.',
      });
    }

    // 만료 확인
    if (new Date() > session.expiresAt) {
      throw new UnauthorizedException({
        error: 'AUTH_REFRESH_EXPIRED',
        message: '세션이 만료되었습니다. 다시 로그인해주세요.',
      });
    }

    // 이전 Refresh Token 폐기 (Rotation)
    await this.sessionRepository.update(session.id, { isRevoked: true });

    // 새 토큰 발급
    return this.issueTokens(session.user, userAgent, ipAddress);
  }

  /**
   * 로그아웃 (현재 세션 폐기)
   */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.sessionRepository.update(
      { refreshTokenHash: tokenHash },
      { isRevoked: true },
    );
  }

  /**
   * 특정 세션 강제 로그아웃
   */
  async revokeSession(sessionId: string, userId: string): Promise<void> {
    await this.sessionRepository.update(
      { id: sessionId, userId },
      { isRevoked: true },
    );
  }

  /**
   * 활성 세션 목록 조회
   */
  async getSessions(userId: string) {
    return this.sessionRepository.find({
      where: { userId, isRevoked: false },
      select: ['id', 'deviceName', 'ipAddress', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 해당 유저의 모든 세션 강제 로그아웃 (탈취 감지 시)
   */
  private async revokeAllSessions(userId: string): Promise<void> {
    await this.sessionRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    this.logger.warn(`유저 ${userId}의 모든 세션 강제 로그아웃`);
  }

  /**
   * Access Token + Refresh Token 발급
   */
  private async issueTokens(user: User, userAgent: string, ipAddress: string) {
    const uaHash = createHash('sha256')
      .update(userAgent)
      .digest('hex')
      .substring(0, 16);
    const ipRange = ipAddress.split('.').slice(0, 3).join('.');

    // Access Token 생성 (JWT)
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      uaHash,
      ipRange,
    };

    // expiresIn을 초 단위 숫자로 변환 (StringValue 타입 호환)
    const expiryStr = this.configService.get<string>('jwt.accessExpiry') || '15m';
    const expirySeconds = this.parseExpiryToSeconds(expiryStr);

    const accessToken = this.jwtService.sign(
      { ...payload } as Record<string, unknown>,
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: expirySeconds,
      },
    );

    // Refresh Token 생성 (Opaque UUID)
    const refreshToken = randomUUID();
    const refreshTokenHash = this.hashToken(refreshToken);

    // 세션 저장
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일

    const session = this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      userAgentHash: uaHash,
      ipAddress,
      deviceName: this.parseDeviceName(userAgent),
      expiresAt,
    });
    await this.sessionRepository.save(session);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      accessToken,
      refreshToken, // 쿠키로 전달할 것
    };
  }

  /**
   * 토큰 SHA-256 해싱 (DB 저장용)
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * User-Agent에서 디바이스 이름 추출 (세션 관리 UI용)
   */
  private parseDeviceName(userAgent: string): string {
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown Device';
  }

  /**
   * 만료 시간 문자열('15m', '7d')을 초(number)로 변환
   */
  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // 기본 15분
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] || 60);
  }
}
