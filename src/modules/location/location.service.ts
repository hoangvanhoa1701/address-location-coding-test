import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Location } from './location.entity';
import {
  CreateLocationDto,
  LocationNestedDto,
  UpdateLocationDto,
} from './location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async getAllNestedLocations(): Promise<LocationNestedDto[]> {
    const rootLocations: Location[] = await this.locationRepository.find({
      where: {
        parentLocationId: IsNull(),
        deletedAt: IsNull(),
      },
    });
    return await this.fetchNestedLocations(rootLocations);
  }

  private async fetchNestedLocations(
    locations: LocationNestedDto[] | Location[] | any,
  ): Promise<LocationNestedDto[]> {
    const allLocations: LocationNestedDto[] = [];

    for (const location of locations) {
      const children: Location[] = await this.locationRepository.find({
        where: { parentLocationId: location.id, deletedAt: IsNull() },
      });

      if (children.length > 0) {
        location.children = await this.fetchNestedLocations(children);
      } else {
        location.children = [];
      }

      allLocations.push(location);
    }

    return allLocations;
  }

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    // Need to check parentLocationId !== null
    // Because the parentLocationId is allowed to be null or 0
    if (createLocationDto.parentLocationId !== null) {
      const parentLocation: Location = await this.locationRepository.findOne({
        where: { id: createLocationDto.parentLocationId, deletedAt: IsNull() },
      });
      if (!parentLocation) {
        throw new NotFoundException('Parent location not found!');
      }
    }

    const newLocation: Location =
      this.locationRepository.create(createLocationDto);
    return this.locationRepository.save(newLocation);
  }

  async deleteLocationAndChildren(locationId: number): Promise<void> {
    const location: Location = await this.locationRepository.findOne({
      where: { id: locationId, deletedAt: IsNull() },
    });
    if (!location) {
      throw new NotFoundException('Location not found!');
    }

    const children: Location[] = await this.locationRepository.find({
      where: { parentLocationId: locationId, deletedAt: IsNull() },
    });
    for (const child of children) {
      await this.deleteLocationAndChildren(child.id);
    }

    // soft delete
    location.deletedAt = new Date();
    await this.locationRepository.save(location);
  }

  async update(
    id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location: Location = await this.locationRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!location) {
      throw new NotFoundException('Location not found!');
    }

    if (updateLocationDto.parentLocationId === id) {
      throw new BadRequestException(
        'Parent location ID cannot be the same as the location ID.',
      );
    }

    // Check if the parentLocationId is a child or descendant of the current location
    if (updateLocationDto.parentLocationId) {
      const parentLocation = await this.locationRepository.findOne({
        where: {
          id: updateLocationDto.parentLocationId,
          deletedAt: IsNull(),
        },
      });
      if (!parentLocation) {
        throw new NotFoundException(
          `Parent location with ID ${updateLocationDto.parentLocationId} not found.`,
        );
      }

      let currentLocation: Location = parentLocation;
      while (currentLocation.parentLocationId) {
        if (currentLocation.parentLocationId === id) {
          throw new BadRequestException(
            'Circular dependency detected, parentLocationId cannot be a child or descendant of itself.',
          );
        }
        if (currentLocation.parentLocationId === location.id) {
          throw new BadRequestException(
            'Parent location ID cannot be a child or descendant of the location.',
          );
        }
        currentLocation = await this.locationRepository.findOne({
          where: { id: currentLocation.parentLocationId, deletedAt: IsNull() },
        });
      }
    }

    // Update location properties based on updateLocationDto
    if (updateLocationDto.building) {
      location.building = updateLocationDto.building;
    }
    if (updateLocationDto.locationName) {
      location.locationName = updateLocationDto.locationName;
    }
    if (updateLocationDto.locationNumber) {
      location.locationNumber = updateLocationDto.locationNumber;
    }
    if (updateLocationDto.area) {
      location.area = updateLocationDto.area;
    }

    // Need to check parentLocationId !== undefined and !== null
    // Because the parentLocationId is allowed to be null or 0
    if (updateLocationDto.parentLocationId !== undefined) {
      if (updateLocationDto.parentLocationId !== null) {
        const parentLocation = await this.locationRepository.findOne({
          where: {
            id: updateLocationDto.parentLocationId,
            deletedAt: IsNull(),
          },
        });
        if (!parentLocation) {
          throw new NotFoundException(
            `Parent location with ID ${updateLocationDto.parentLocationId} not found.`,
          );
        }
      }
      location.parentLocationId = updateLocationDto.parentLocationId;
    }

    await this.locationRepository.save(location);
    return location;
  }
}
