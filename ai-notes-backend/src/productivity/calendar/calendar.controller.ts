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
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() createCalendarEventDto: CreateCalendarEventDto, @CurrentUser() user: any) {
    return this.calendarService.create(createCalendarEventDto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('start') startDate?: string,
    @Query('end') endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.calendarService.findAll(user.id, new Date(startDate), new Date(endDate));
    }
    return this.calendarService.findAll(user.id);
  }

  @Get('upcoming')
  getUpcoming(@CurrentUser() user: any, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.calendarService.getUpcomingEvents(user.id, limitNumber);
  }

  @Get('today')
  getTodayEvents(@CurrentUser() user: any) {
    return this.calendarService.getTodayEvents(user.id);
  }

  @Get('week')
  getThisWeek(@CurrentUser() user: any) {
    return this.calendarService.getEventsThisWeek(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.calendarService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCalendarEventDto: UpdateCalendarEventDto,
    @CurrentUser() user: any,
  ) {
    return this.calendarService.update(id, updateCalendarEventDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.calendarService.remove(id, user.id);
  }
}