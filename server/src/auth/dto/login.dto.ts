/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 로그인 DTO
 */

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  password!: string;
}
