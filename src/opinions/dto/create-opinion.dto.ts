import { IsNotEmpty, IsString } from 'class-validator';
export class CreateOpinionDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsString()
  @IsNotEmpty()
  discussionId: string;
}
