import { IsArray, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatHistoryItemDto {
  @IsIn(['user', 'model'])
  role!: 'user' | 'model';

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history!: ChatHistoryItemDto[];
}