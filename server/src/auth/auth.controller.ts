/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 인증 컨트롤러
 * 회원가입, 로그인, 토큰 갱신, 로그아웃
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Res,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './decorators/public.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from './strategies/jwt.strategy.js';

// Refresh Token 쿠키 이름
const REFRESH_TOKEN_COOKIE = 'ari_refresh_token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * GET /api/v1/auth/check-email - 이메일 중복 체크
   * BZ'NEXA Copyright
   */
  @Public()
  @Get('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Req() req: Request) {
    const email = req.query.email as string;
    if (!email) {
      return { isDuplicate: false };
    }
    const isDuplicate = await this.authService.checkEmailDuplicate(email);
    return { isDuplicate };
  }

  /**
   * POST /api/v1/auth/register - 회원가입

   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.socket.remoteAddress || '';

    const result = await this.authService.register(dto, userAgent, ipAddress);

    // Refresh Token을 httpOnly 쿠키로 설정 (Anti-Hijacking)
    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  /**
   * POST /api/v1/auth/login - 로그인
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.socket.remoteAddress || '';

    const result = await this.authService.login(dto, userAgent, ipAddress);

    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  /**
   * POST /api/v1/auth/refresh - Access Token 재발급
   * Refresh Token Rotation 적용
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      return { accessToken: null };
    }

    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.socket.remoteAddress || '';

    const result = await this.authService.refresh(refreshToken, userAgent, ipAddress);

    // 새 Refresh Token 쿠키 설정 (Rotation)
    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  /**
   * POST /api/v1/auth/logout - 로그아웃
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // 쿠키 제거
    res.clearCookie(REFRESH_TOKEN_COOKIE);

    return { message: '로그아웃되었습니다.' };
  }

  /**
   * GET /api/v1/auth/sessions - 활성 세션 목록
   */
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser() user: JwtPayload) {
    return this.authService.getSessions(user.sub);
  }

  /**
   * DELETE /api/v1/auth/sessions/:id - 특정 세션 강제 로그아웃
   */
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.authService.revokeSession(sessionId, user.sub);
    return { message: '세션이 종료되었습니다.' };
  }

  /**
   * Refresh Token 쿠키 설정
   * httpOnly + Secure + SameSite=Strict (CSRF + XSS 방지)
   */
  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,                    // JS 접근 차단
      secure: process.env.NODE_ENV === 'production', // HTTPS 전용 (프로덕션)
      sameSite: 'strict',               // CSRF 방지
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7일 (밀리초)
      path: '/api/v1/auth',             // auth 경로에서만 전송
    });
  }
}
