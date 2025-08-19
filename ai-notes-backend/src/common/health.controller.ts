import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnvironmentConfig } from '../config/config.environment';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly config: EnvironmentConfig) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.config.nodeEnv,
      version: '1.0.0',
      services: {
        database: 'connected', // In a real app, you'd check actual DB connection
        redis: 'connected',    // In a real app, you'd check actual Redis connection
      }
    };
  }
}