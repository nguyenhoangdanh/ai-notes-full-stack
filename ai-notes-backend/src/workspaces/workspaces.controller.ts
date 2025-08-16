import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspacesService } from './workspaces.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';

interface CreateWorkspaceDto {
  name: string;
}

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.workspacesService.findAll(user.id);
  }

  @Get('default')
  async findDefault(@CurrentUser() user: User) {
    return this.workspacesService.findDefault(user.id);
  }

  @Post()
  async create(
    @Body() data: CreateWorkspaceDto,
    @CurrentUser() user: User,
  ) {
    return this.workspacesService.create(data, user.id);
  }
}
