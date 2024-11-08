import { User } from '../../users/domain/user';

export class Session {
  id: string;
  user: User;
  hash: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
