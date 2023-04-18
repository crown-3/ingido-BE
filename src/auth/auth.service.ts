import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialDTO, AuthLoginDTO } from './DTO/auth-credential.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /** 회원가입 */
  async signUp(authCredentialDTO: AuthCredentialDTO): Promise<void> {
    const { password } = this.userRepository.create(authCredentialDTO);

    //보안
    const salt = await bcrypt.genSalt(); //salt 값 생성으로 이중암호화
    const hashedPassword = await bcrypt.hash(password, salt); //hash
    const user = { ...authCredentialDTO, password: hashedPassword, ingido: 0 }; //hash된 password 적용

    try {
      await this.userRepository.save(user);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY')
        throw new ConflictException('Tag already exists');
      else
        throw new InternalServerErrorException(
          'Some error occured in the process of saving the user (Figure it out manually)',
        );
    }
  }

  /** 로그인 */
  async signIn(authLoginDTO: AuthLoginDTO): Promise<{ accessToken: string }> {
    const { name, tag, password } = authLoginDTO;

    //태그 비교
    const user = await this.userRepository.findOneBy({ name, tag });
    if (!user)
      throw new UnauthorizedException(
        `Login failed : name and tag combination not found`,
      );

    //비밀번호 비교
    const isPasswordRight = await bcrypt.compare(password, user.password);
    if (!isPasswordRight)
      throw new UnauthorizedException(`Login failed : password not correct`);

    //로그인 성공 시 유저 토큰 생성
    const payload = { tag };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  /** 회원정보 수정 */
  async updateUserInfo(
    authCredentialDTO: AuthCredentialDTO,
    user: User,
  ): Promise<void> {
    const { name, tag, personal_color_1, personal_color_2, password } =
      authCredentialDTO;

    //비밀번호 비교
    const isPasswordRight = await bcrypt.compare(password, user.password);
    if (!isPasswordRight)
      throw new UnauthorizedException(`Patch failed : password not correct`);

    const updatedUser = {
      ...user,
      name,
      tag,
      personal_color_1,
      personal_color_2,
    };

    try {
      await this.userRepository.save(updatedUser);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY')
        throw new ConflictException('Tag already exists');
      else
        throw new InternalServerErrorException(
          'Some error occured in the process of saving the user (Figure it out manually)',
        );
    }
  }
}
