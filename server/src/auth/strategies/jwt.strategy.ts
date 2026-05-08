/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - JWT Access Token 전략
 * User-Agent 해시 + IP 대역 검증으로 토큰 하이잭킹 방지
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import type { Request } from 'express';
import { createHash } from 'crypto';

// JWT 페이로드 타입
export interface JwtPayload {
  sub: string;       // userId
  role: string;      // 사용자 역할
  uaHash: string;    // User-Agent 해시 (바인딩)
  ipRange: string;   // IP /24 대역 (바인딩)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    // 요청 객체를 validate에 전달하기 위해 StrategyOptionsWithRequest 사용
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret') || '',
      passReqToCallback: true,
    };
    super(options);
  }

  /**
   * 토큰 검증 + Anti-Hijacking 바인딩 체크
   */
  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    // 1. User-Agent 바인딩 검증
    const currentUaHash = createHash('sha256')
      .update(req.headers['user-agent'] || '')
      .digest('hex')
      .substring(0, 16);

    if (payload.uaHash && payload.uaHash !== currentUaHash) {
      throw new UnauthorizedException({
        error: 'AUTH_TOKEN_HIJACKED',
        message: '비정상적인 접근이 감지되었습니다. 다시 로그인해주세요.',
      });
    }

    // 2. IP 대역 바인딩 검증 (/24 대역 비교)
    const clientIp = req.ip || req.socket.remoteAddress || '';
    const currentIpRange = clientIp.split('.').slice(0, 3).join('.');

    if (payload.ipRange && payload.ipRange !== currentIpRange) {
      throw new UnauthorizedException({
        error: 'AUTH_TOKEN_HIJACKED',
        message: 'IP 대역이 변경되었습니다. 다시 로그인해주세요.',
      });
    }

    return payload;
  }
}
