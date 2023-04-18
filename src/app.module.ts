import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { typeORMConfig } from './configs/typeorm.config';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forRoot(typeORMConfig), UserModule],
})
export class AppModule {}
