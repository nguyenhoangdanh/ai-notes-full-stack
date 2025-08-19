import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspacesService } from './workspaces.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { CreateWorkspaceDto } from './dto/workspaces.dto';

@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for user' })
  @ApiResponse({ status: 200, description: 'Workspaces retrieved successfully' })
  async findAll(@CurrentUser() user: User) {
    return this.workspacesService.findAll(user.id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default workspace for user' })
  @ApiResponse({ status: 200, description: 'Default workspace retrieved successfully' })
  async findDefault(@CurrentUser() user: User) {
    return this.workspacesService.findDefault(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new workspace' })
  @ApiResponse({ status: 201, description: 'Workspace created successfully' })
  async create(
    @Body() data: CreateWorkspaceDto,
    @CurrentUser() user: User,
  ) {
    return this.workspacesService.create(data, user.id);
  }
}
