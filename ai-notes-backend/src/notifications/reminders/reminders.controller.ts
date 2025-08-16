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
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminders.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(@Body() createReminderDto: CreateReminderDto, @CurrentUser() user: any) {
    return this.remindersService.create(createReminderDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('complete') isComplete?: string) {
    const complete = isComplete ? isComplete === 'true' : undefined;
    return this.remindersService.findAll(user.id, complete);
  }

  @Get('due')
  getDueReminders(@CurrentUser() user: any) {
    return this.remindersService.getDueReminders(user.id);
  }

  @Get('upcoming')
  getUpcomingReminders(@CurrentUser() user: any, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.remindersService.getUpcomingReminders(user.id, limitNumber);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.remindersService.getReminderStats(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.remindersService.findOne(id, user.id);
  }

  @Post(':id/complete')
  markComplete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.remindersService.markComplete(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
    @CurrentUser() user: any,
  ) {
    return this.remindersService.update(id, updateReminderDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.remindersService.remove(id, user.id);
  }
}