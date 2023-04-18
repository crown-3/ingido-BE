import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Repository } from 'typeorm';
import { FriendDTO, SearchUsersList } from './DTO/friend.dto';
import { Friend } from './friend.entity';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
  ) {}

  /** 유저 정보를 액세스 토큰만으로 불러오기 */
  async getUserAuth(user: User): Promise<User> {
    const gotUser = await this.userRepository.findOneBy({ id: user.id });

    if (!user)
      throw new InternalServerErrorException(`User id ${user.id} not found`);
    return gotUser;
  }

  /** 유저 정보 불러오기 */
  async getUserInfo(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException(`User id ${userId} not found`);

    return user;
  }

  /** 인기도 조작 */
  async manipulateIngido(userId: number, amount: number): Promise<User> {
    const user = await this.getUserInfo(userId);
    user.ingido += amount;

    await this.userRepository.save(user);
    return user;
  }

  /** 친구 추가 */
  async addFriend(friendDTO: FriendDTO): Promise<void> {
    const { user, targetUserId } = friendDTO;
    const targetUser = await this.getUserInfo(targetUserId);

    if (targetUserId === user.id) {
      throw new ConflictException(`Cannot add itself a friend`);
    }

    this.logger.verbose(
      `User ${user.name} is trying add to friend ${targetUser.name}`,
    );

    // 중복되는 값이 있다면 바로 reject
    const isFriendExist = await this.friendRepository
      .createQueryBuilder()
      .where({
        user: user,
        target_user: targetUser,
      })
      .getOne();

    const isReverseFriendExist = await this.friendRepository
      .createQueryBuilder()
      .where({
        user: targetUser,
        target_user: user,
      })
      .getOne();

    if (isFriendExist || isReverseFriendExist) {
      throw new ConflictException(`This friend relationship already exists`);
    }

    const friend = this.friendRepository.create({
      user: user,
      target_user: targetUser,
    });

    const reverseFriend = this.friendRepository.create({
      user: targetUser,
      target_user: user,
    });

    await this.friendRepository.save(friend);
    await this.friendRepository.save(reverseFriend);
  }

  /** 유저의 전체 친구 조회 */
  async getAllFriends(user: User): Promise<User[]> {
    const friendListRaw = await this.friendRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['target_user'],
    });

    this.logger.verbose(`User ${user.name} is trying to get friends list`);

    const friends = friendListRaw.map((i) => i.target_user);

    return friends;
  }

  /** search query를 받아서 일치하는 것들 return */
  async searchUser(searchQuery: string): Promise<SearchUsersList[]> {
    this.logger.verbose('Search Query : ', searchQuery);
    if (!searchQuery) return [];
    else {
      const allUsersList = await this.userRepository.find();
      const users = allUsersList.map((user) => {
        return {
          nametag: user.name + '#' + user.tag,
          id: user.id,
        };
      });

      const returnValues = [];
      for (const user in users) {
        if (users[user].nametag.includes(searchQuery)) {
          returnValues.push(users[user]);
        }
      }
      return returnValues;
    }
  }

  /** 친구 삭제 */
  async deleteFriend(friendDTO: FriendDTO): Promise<void> {
    const { user, targetUserId } = friendDTO;

    //일단 param으로 id 조회
    const targetUser = await this.getUserInfo(targetUserId);

    //friendReopsitory Table 삭제 시도
    const result = await this.friendRepository
      .createQueryBuilder()
      .relation(User, 'target_user')
      .delete()
      .from(Friend)
      .where({
        user: { id: user.id },
        target_user: { id: targetUserId },
      })
      .execute();

    //역방향 삭제 시도
    const resultReverse = await this.friendRepository
      .createQueryBuilder()
      .relation(User, 'target_user')
      .delete()
      .from(Friend)
      .where({
        user: { id: targetUserId },
        target_user: { id: user.id },
      })
      .execute();

    if (result.affected === 0 || resultReverse.affected === 0) {
      if (result.affected === 0 && resultReverse.affected === 0) {
        // 둘 다 없음
        throw new NotFoundException(
          `User id ${user.id} and target user id ${targetUserId} are not friend`,
        );
      }

      //하나만 있음 (서버 에러)
      throw new InternalServerErrorException(
        `One directional friend relationship is found`,
      );
    }
  }
}
