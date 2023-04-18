import { User } from 'src/auth/user.entity';

export class FriendDTO {
  user: User;
  targetUserId: number;
}

export class IngidoDTO {
  ingidoAmount: number;
}

export class SearchQueryDTO {
  searchQuery: string;
}

export class SearchUsersList {
  nametag: string;
  id: number;
}
