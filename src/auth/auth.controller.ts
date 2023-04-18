import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthCredentialDTO, AuthLoginDTO } from './DTO/auth-credential.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialDTO: AuthCredentialDTO,
  ): Promise<void> {
    return this.authService.signUp(authCredentialDTO);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authLoginDTO: AuthLoginDTO,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authLoginDTO);
  }

  @Patch('/update_user_info')
  @UseGuards(AuthGuard())
  updateUserInfo(
    @GetUser() user: User,
    @Body(ValidationPipe) authCredentialDTO: AuthCredentialDTO,
  ): Promise<void> {
    return this.authService.updateUserInfo(authCredentialDTO, user);
  }
}
