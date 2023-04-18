import { Friend } from 'src/user/friend.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['tag'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  /** 유저명 */
  name: string;

  @Column()
  /** 유저 태그 (unique) */
  tag: string;

  @Column()
  /** 비밀번호 */
  password: string;

  @Column()
  /** 퍼스널 커스텀 컬러 1 */
  personal_color_1: string;

  @Column()
  /** 퍼스널 커스텀 컬러 2 */
  personal_color_2: string;

  @Column()
  ingido: number;
}
