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
import { PomodoroService } from './pomodoro.service';
import { CreatePomodoroSessionDto, UpdatePomodoroSessionDto } from './dto/pomodoro.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('pomodoro')
@UseGuards(JwtAuthGuard)
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Post()
  create(@Body() createPomodoroDto: CreatePomodoroSessionDto, @CurrentUser() user: any) {
    return this.pomodoroService.create(createPomodoroDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.pomodoroService.findAll(user.id, limitNumber);
  }

  @Get('active')
  findActive(@CurrentUser() user: any) {
    return this.pomodoroService.findActive(user.id);
  }

  @Get('stats')
  getStats(
    @CurrentUser() user: any,
    @Query('start') startDate?: string,
    @Query('end') endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.pomodoroService.getStats(user.id, new Date(startDate), new Date(endDate));
    }
    return this.pomodoroService.getStats(user.id);
  }

  @Get('stats/today')
  getTodayStats(@CurrentUser() user: any) {
    return this.pomodoroService.getTodayStats(user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePomodoroDto: UpdatePomodoroSessionDto,
    @CurrentUser() user: any,
  ) {
    return this.pomodoroService.update(id, updatePomodoroDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pomodoroService.remove(id, user.id);
  }
}