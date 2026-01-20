import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  dateOfBirth!: Date;
}

export class GetUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  items!: UserResponseDto[];

  @ApiProperty({ nullable: true, description: 'Cursor for next page (base64)' })
  nextCursor!: string | null;
}

