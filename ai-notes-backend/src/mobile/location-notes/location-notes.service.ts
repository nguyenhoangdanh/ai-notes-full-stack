import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationNoteDto, UpdateLocationNoteDto } from './dto/location-notes.dto';

@Injectable()
export class LocationNotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, radius?: number, lat?: number, lng?: number) {
    // Base query for user's location notes
    let locationNotes = await this.prisma.locationNote.findMany({
      where: {
        userId,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If radius and coordinates are provided, filter by distance
    if (radius && lat !== undefined && lng !== undefined) {
      locationNotes = locationNotes.filter(locationNote => {
        const distance = this.calculateDistance(
          lat,
          lng,
          locationNote.latitude,
          locationNote.longitude,
        );
        return distance <= radius;
      });
    }

    return locationNotes.map(locationNote => ({
      ...locationNote,
      distance: (lat !== undefined && lng !== undefined)
        ? this.calculateDistance(lat, lng, locationNote.latitude, locationNote.longitude)
        : undefined,
    }));
  }

  async findOne(id: string, userId: string) {
    const locationNote = await this.prisma.locationNote.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!locationNote) {
      throw new NotFoundException('Location note not found');
    }

    return locationNote;
  }

  async findByNoteId(noteId: string, userId: string) {
    return this.prisma.locationNote.findFirst({
      where: {
        noteId,
        userId,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async create(createLocationNoteDto: CreateLocationNoteDto, userId: string) {
    // Validate note ownership
    const note = await this.prisma.note.findFirst({
      where: {
        id: createLocationNoteDto.noteId,
        ownerId: userId,
        isDeleted: false,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found or not owned by user');
    }

    // Check if location already exists for this note
    const existingLocation = await this.prisma.locationNote.findFirst({
      where: {
        noteId: createLocationNoteDto.noteId,
        userId,
      },
    });

    if (existingLocation) {
      throw new ConflictException('Location already exists for this note');
    }

    const locationNote = await this.prisma.locationNote.create({
      data: {
        ...createLocationNoteDto,
        userId,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return locationNote;
  }

  async update(id: string, updateLocationNoteDto: UpdateLocationNoteDto, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    const locationNote = await this.prisma.locationNote.update({
      where: {
        id,
        userId,
      },
      data: updateLocationNoteDto,
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return locationNote;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    await this.prisma.locationNote.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async findNearbyNotes(userId: string, latitude: number, longitude: number, radiusKm: number = 5) {
    // Get all location notes for the user
    const locationNotes = await this.prisma.locationNote.findMany({
      where: {
        userId,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Filter by distance and sort by proximity
    const nearbyNotes = locationNotes
      .map(locationNote => ({
        ...locationNote,
        distance: this.calculateDistance(
          latitude,
          longitude,
          locationNote.latitude,
          locationNote.longitude,
        ),
      }))
      .filter(locationNote => locationNote.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearbyNotes;
  }

  async getLocationStats(userId: string) {
    const totalLocationNotes = await this.prisma.locationNote.count({
      where: { userId },
    });

    const uniquePlaces = await this.prisma.locationNote.groupBy({
      by: ['placeName'],
      where: {
        userId,
        placeName: { not: null },
      },
      _count: {
        placeName: true,
      },
    });

    const averageAccuracy = await this.prisma.locationNote.aggregate({
      where: {
        userId,
        accuracy: { not: null },
      },
      _avg: {
        accuracy: true,
      },
    });

    return {
      totalLocationNotes,
      uniquePlaces: uniquePlaces.length,
      averageAccuracyMeters: averageAccuracy._avg.accuracy || 0,
      mostVisitedPlaces: uniquePlaces
        .sort((a, b) => b._count.placeName - a._count.placeName)
        .slice(0, 10)
        .map(place => ({
          placeName: place.placeName,
          noteCount: place._count.placeName,
        })),
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<{ address?: string; placeName?: string }> {
    // In a real implementation, you would call a geocoding service like:
    // - Google Maps Geocoding API
    // - OpenStreetMap Nominatim
    // - MapBox Geocoding API
    // For now, we'll return a mock response
    
    return {
      address: `Mock Address for ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      placeName: `Mock Place Name`,
    };
  }

  async addLocationWithGeocode(
    noteId: string,
    latitude: number,
    longitude: number,
    accuracy: number,
    userId: string,
  ) {
    // Get address and place name from coordinates
    const geoData = await this.reverseGeocode(latitude, longitude);

    const createLocationNoteDto: CreateLocationNoteDto = {
      noteId,
      latitude,
      longitude,
      accuracy,
      address: geoData.address,
      placeName: geoData.placeName,
    };

    return this.create(createLocationNoteDto, userId);
  }
}