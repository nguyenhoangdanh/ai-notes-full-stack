import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVoiceNoteDto, UpdateVoiceNoteDto } from './dto/voice-notes.dto';
import { TranscriptionStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VoiceNotesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async findAll(userId: string, noteId?: string) {
    const where: any = {
      userId,
    };

    if (noteId) {
      where.noteId = noteId;
    }

    return this.prisma.voiceNote.findMany({
      where,
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const voiceNote = await this.prisma.voiceNote.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!voiceNote) {
      throw new NotFoundException('Voice note not found');
    }

    return voiceNote;
  }

  async create(createVoiceNoteDto: CreateVoiceNoteDto, userId: string) {
    // Validate note ownership if noteId is provided
    if (createVoiceNoteDto.noteId) {
      const note = await this.prisma.note.findFirst({
        where: {
          id: createVoiceNoteDto.noteId,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found or not owned by user');
      }
    }

    const voiceNote = await this.prisma.voiceNote.create({
      data: {
        ...createVoiceNoteDto,
        userId,
        status: TranscriptionStatus.PROCESSING,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Queue transcription processing
    this.queueTranscription(voiceNote.id);

    return voiceNote;
  }

  async update(id: string, updateVoiceNoteDto: UpdateVoiceNoteDto, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    const updateData: any = { ...updateVoiceNoteDto };

    if (updateVoiceNoteDto.status) {
      updateData.status = updateVoiceNoteDto.status;
      if (updateVoiceNoteDto.status === 'COMPLETED') {
        updateData.processedAt = new Date();
      }
    }

    const voiceNote = await this.prisma.voiceNote.update({
      where: {
        id,
        userId,
      },
      data: updateData,
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return voiceNote;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    await this.prisma.voiceNote.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async getTranscriptionStatus(id: string, userId: string) {
    const voiceNote = await this.findOne(id, userId);
    return {
      id: voiceNote.id,
      status: voiceNote.status,
      transcription: voiceNote.transcription,
      quality: voiceNote.quality,
      processedAt: voiceNote.processedAt,
    };
  }

  private async queueTranscription(voiceNoteId: string) {
    // In a real implementation, this would queue the transcription job
    // For now, we'll simulate processing
    try {
      console.log(`Queuing transcription for voice note ${voiceNoteId}`);
      
      // Simulate async transcription processing
      setTimeout(async () => {
        await this.processTranscription(voiceNoteId);
      }, 5000); // 5 second delay to simulate processing

    } catch (error) {
      console.error(`Failed to queue transcription for voice note ${voiceNoteId}:`, error);
      await this.prisma.voiceNote.update({
        where: { id: voiceNoteId },
        data: {
          status: TranscriptionStatus.FAILED,
          processedAt: new Date(),
        },
      });
    }
  }

  private async processTranscription(voiceNoteId: string) {
    try {
      const voiceNote = await this.prisma.voiceNote.findUnique({
        where: { id: voiceNoteId },
      });

      if (!voiceNote) {
        console.error(`Voice note ${voiceNoteId} not found for transcription`);
        return;
      }

      // In a real implementation, you would:
      // 1. Load the audio file from voiceNote.filepath
      // 2. Send it to a speech-to-text service (Google Cloud Speech, OpenAI Whisper, etc.)
      // 3. Get the transcription result
      
      // For demo purposes, we'll use a placeholder transcription
      const mockTranscription = `[Transcribed audio from ${voiceNote.filename}] - This is a placeholder transcription. In a real implementation, this would be the actual speech-to-text result.`;
      
      await this.prisma.voiceNote.update({
        where: { id: voiceNoteId },
        data: {
          transcription: mockTranscription,
          quality: 0.85, // Mock quality score
          status: TranscriptionStatus.COMPLETED,
          processedAt: new Date(),
        },
      });

      console.log(`Transcription completed for voice note ${voiceNoteId}`);

    } catch (error) {
      console.error(`Transcription failed for voice note ${voiceNoteId}:`, error);
      await this.prisma.voiceNote.update({
        where: { id: voiceNoteId },
        data: {
          status: TranscriptionStatus.FAILED,
          processedAt: new Date(),
        },
      });
    }
  }

  async getVoiceNoteStats(userId: string) {
    const [total, completed, processing, failed] = await Promise.all([
      this.prisma.voiceNote.count({
        where: { userId },
      }),
      this.prisma.voiceNote.count({
        where: { userId, status: TranscriptionStatus.COMPLETED },
      }),
      this.prisma.voiceNote.count({
        where: { userId, status: TranscriptionStatus.PROCESSING },
      }),
      this.prisma.voiceNote.count({
        where: { userId, status: TranscriptionStatus.FAILED },
      }),
    ]);

    const totalDuration = await this.prisma.voiceNote.aggregate({
      where: { userId },
      _sum: { duration: true },
    });

    return {
      total,
      completed,
      processing,
      failed,
      totalDurationSeconds: totalDuration._sum.duration || 0,
    };
  }

  async retryTranscription(id: string, userId: string) {
    const voiceNote = await this.findOne(id, userId);

    if (voiceNote.status === TranscriptionStatus.PROCESSING) {
      throw new Error('Transcription is already in progress');
    }

    await this.prisma.voiceNote.update({
      where: { id, userId },
      data: {
        status: TranscriptionStatus.PROCESSING,
        transcription: null,
        quality: null,
        processedAt: null,
      },
    });

    this.queueTranscription(id);

    return { message: 'Transcription retry queued' };
  }
}