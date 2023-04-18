import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/user.entity';
import { Friend } from './friend.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend]), AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
