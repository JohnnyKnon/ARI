/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - 회원가입 DTO
 * ToS 동의 정보 필수 포함 (법적 방어)
 */

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(100)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.',
  })
  password!: string;

  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50)
  displayName!: string;

  // 이용약관 동의 버전 (법적 기록 필수)
  @IsString()
  @IsNotEmpty({ message: '이용약관 버전은 필수입니다.' })
  tosVersion!: string;

  // 이용약관 동의 시각
  @IsString()
  @IsNotEmpty({ message: '이용약관 동의 시각은 필수입니다.' })
  tosAgreedAt!: string;
}
