import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import * as config from 'config';

@Injectable() //걍 Passport랑 jwt 쓰면 이따구로 쓴다는걸 알면 될듯
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'), //auth.module에서 사용한 그 secret key
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload) {
    const { tag } = payload;
    const user: User = await this.userRepository.findOneBy({ tag });

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
