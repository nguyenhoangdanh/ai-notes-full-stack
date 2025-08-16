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
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotesService } from './notes.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateNoteDto, UpdateNoteDto, SearchNotesDto } from './dto/notes.dto';
import { User } from '../types/user.types';

@ApiTags('notes')
@ApiBearerAuth()
@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() user: User,
  ) {
    return this.notesService.create(createNoteDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes for user' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  async findAll(
    @CurrentUser() user: User,
    @Query('workspaceId') workspaceId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notesService.findAll(
      user.id, 
      workspaceId, 
      limit ? parseInt(limit) : undefined
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search notes by query' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async search(
    @Query() searchDto: SearchNotesDto,
    @CurrentUser() user: User,
  ) {
    return this.notesService.search(searchDto.q, user.id, searchDto.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  @ApiResponse({ status: 200, description: 'Note retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.notesService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note by ID' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @CurrentUser() user: User,
  ) {
    return this.notesService.update(id, updateNoteDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete note by ID' })
  @ApiResponse({ status: 204, description: 'Note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.notesService.remove(id, user.id);
  }

  @Post(':id/process-rag')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Process note for RAG (vector embeddings)' })
  @ApiResponse({ status: 202, description: 'Note processing started' })
  async processForRAG(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    // Process asynchronously
    this.notesService.processForRAG(id, user.id);
    return { message: 'Processing started' };
  }
}
