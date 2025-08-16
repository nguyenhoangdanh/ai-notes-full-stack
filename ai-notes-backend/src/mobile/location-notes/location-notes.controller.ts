import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LocationNotesService } from './location-notes.service';
import { CreateLocationNoteDto, UpdateLocationNoteDto } from './dto/location-notes.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('location-notes')
@UseGuards(JwtAuthGuard)
export class LocationNotesController {
  constructor(private readonly locationNotesService: LocationNotesService) {}

  @Post()
  create(@Body() createLocationNoteDto: CreateLocationNoteDto, @CurrentUser() user: any) {
    return this.locationNotesService.create(createLocationNoteDto, user.id);
  }

  @Post('add-with-geocode')
  addWithGeocode(
    @Body() body: {
      noteId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
    },
    @CurrentUser() user: any,
  ) {
    return this.locationNotesService.addLocationWithGeocode(
      body.noteId,
      body.latitude,
      body.longitude,
      body.accuracy || 0,
      user.id,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('radius') radius?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const radiusKm = radius ? parseFloat(radius) : undefined;
    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lng ? parseFloat(lng) : undefined;
    
    return this.locationNotesService.findAll(user.id, radiusKm, latitude, longitude);
  }

  @Get('nearby')
  findNearby(
    @CurrentUser() user: any,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 5;
    
    return this.locationNotesService.findNearbyNotes(user.id, latitude, longitude, radiusKm);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.locationNotesService.getLocationStats(user.id);
  }

  @Get('note/:noteId')
  findByNoteId(@Param('noteId') noteId: string, @CurrentUser() user: any) {
    return this.locationNotesService.findByNoteId(noteId, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.locationNotesService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocationNoteDto: UpdateLocationNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.locationNotesService.update(id, updateLocationNoteDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.locationNotesService.remove(id, user.id);
  }
}