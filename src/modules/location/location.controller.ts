import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto, UpdateLocationDto } from './location.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Location } from './location.entity';

@ApiTags('locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiOperation({ summary: 'Get all locations' })
  @Get('')
  async getAllNestedLocations(): Promise<any[]> {
    return this.locationService.getAllNestedLocations();
  }

  @ApiOperation({ summary: 'Create a new location' })
  @Post()
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.locationService.create(createLocationDto);
  }

  @ApiOperation({ summary: 'Update a location' })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<UpdateLocationDto> {
    return await this.locationService.update(id, updateLocationDto);
  }

  @ApiOperation({ summary: 'Delete a location' })
  @Delete(':id')
  async deleteLocationAndChildren(@Param('id') id: number): Promise<void> {
    return await this.locationService.deleteLocationAndChildren(id);
  }
}
