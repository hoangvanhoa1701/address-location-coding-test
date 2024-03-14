import { ApiProperty, PartialType } from '@nestjs/swagger';

export class LocationNestedDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  area: number;

  @ApiProperty()
  number: number;

  @ApiProperty()
  parentLocationId: number;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateLocationDto {
  @ApiProperty()
  building: string;

  @ApiProperty()
  locationName: string;

  @ApiProperty()
  locationNumber: string;

  @ApiProperty()
  area: number;

  @ApiProperty({ required: false })
  parentLocationId?: number;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
