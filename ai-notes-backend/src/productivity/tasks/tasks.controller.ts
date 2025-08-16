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
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/tasks.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TaskStatus, TaskPriority } from '@prisma/client';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
  ) {
    return this.tasksService.findAll(user.id, status, priority);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.tasksService.getTaskStats(user.id);
  }

  @Get('overdue')
  getOverdue(@CurrentUser() user: any) {
    return this.tasksService.getOverdueTasks(user.id);
  }

  @Get('due')
  getTasksByDueDate(
    @CurrentUser() user: any,
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.tasksService.getTasksByDueDate(user.id, start, end);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.remove(id, user.id);
  }
}