import {
  Body,
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import {
  FriendDTO,
  IngidoDTO,
  SearchQueryDTO,
  SearchUsersList,
} from './DTO/friend.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/add_friend/:id')
  addFriend(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.userService.addFriend({ user, targetUserId: id });
  }

  @Get('/get_user_auth')
  getUserAuth(@GetUser() user: User): Promise<User> {
    return this.userService.getUserAuth(user);
  }

  @Get('/get_user_info/:id')
  getUserInfo(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.getUserInfo(id);
  }

  @Get('/get_all_friends')
  getAllFriends(@GetUser() user: User): Promise<User[]> {
    return this.userService.getAllFriends(user);
  }

  @Get('/search_user/:search_query')
  searchUser(
    @Param('search_query') searchQuery: string,
  ): Promise<SearchUsersList[]> {
    return this.userService.searchUser(searchQuery);
  }

  @Patch('/ingido/:id')
  manipulateIngido(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) ingidoDTO: IngidoDTO,
  ) {
    return this.userService.manipulateIngido(id, ingidoDTO.ingidoAmount);
  }

  @Delete('/delete_friend/:id')
  deleteFriend(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.userService.deleteFriend({ user, targetUserId: id });
  }
}
