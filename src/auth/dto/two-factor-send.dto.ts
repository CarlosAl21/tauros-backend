import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorSendDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;
}
