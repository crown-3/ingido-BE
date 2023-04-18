import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthLoginDTO {
  //class validator
  @IsString()
  @MinLength(2)
  @MaxLength(12)
  @Matches(/^[^#]+$/, {
    message: 'username must not include #',
  })
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(12)
  @Matches(/^[^#]+$/, {
    message: 'tag must not include #',
  })
  tag: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts English and number',
  }) //정규식으로 검사 : 영어랑 숫자만
  password: string;
}

export class AuthCredentialDTO extends AuthLoginDTO {
  @IsString()
  @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
    message: 'personal color 1 must be HEX',
  })
  personal_color_1: string;

  @IsString()
  @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
    message: 'personal color 2 must be HEX',
  })
  personal_color_2: string;
}
