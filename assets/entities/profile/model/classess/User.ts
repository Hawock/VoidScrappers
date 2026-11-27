import { ProfileDto } from '../../api/dto/profile.dto';

export class User {
  public id: string;
  public nickname: string;

  constructor(payload: ProfileDto) {
    this.id = payload.id;
    this.nickname = payload.nickname;
  }

  public getDisplayName(): string {
    return this.nickname;
  }
}