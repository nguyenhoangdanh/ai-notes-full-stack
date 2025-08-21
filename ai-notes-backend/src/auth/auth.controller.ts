import { Controller, Get, Post, Body, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { User, GoogleOAuthUser } from '../types/user.types';
import { EnvironmentConfig } from '../config/config.environment';

interface AuthenticatedRequest extends Request {
  user: GoogleOAuthUser;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: EnvironmentConfig,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register with email and password' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    const result = await this.authService.register(registerDto);
    this.setAuthCookie(res, result.access_token);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);
    this.setAuthCookie(res, result.access_token);
    return result;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth(@Req() req: Request): Promise<void> {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async googleAuthRedirect(@Req() req: AuthenticatedRequest, @Res() res: Response): Promise<void> {
    const result = await this.authService.googleLogin(req.user);
    
    // Set cookie for authentication
    this.setAuthCookie(res, result.access_token);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;
    
    res.redirect(redirectUrl);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid' })
  async verifyToken(@CurrentUser() user: User): Promise<{ valid: boolean; user: User }> {
    return {
      valid: true,
      user,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    this.clearAuthCookie(res);
    return { message: 'Logged out successfully' };
  }

  /**
   * Set authentication cookie with proper security settings
   */
  private setAuthCookie(res: Response, token: string): void {
    const isProduction = this.config.isProduction;
    const domain = this.config.cookieDomain;
    const secure = this.config.cookieSecure;

    res.cookie('ai-notes-token', token, {
      httpOnly: true, // Prevents XSS attacks
      secure: secure, // HTTPS only in production  
      sameSite: isProduction ? 'none' : 'lax', // Cross-site cookies for production
      domain: domain || undefined, // Don't set domain for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/', // Available on all paths
    });
  }

  /**
   * Clear authentication cookie
   */
  private clearAuthCookie(res: Response): void {
    const domain = this.config.cookieDomain;
    
    res.clearCookie('ai-notes-token', {
      domain: domain || undefined,
      path: '/',
      secure: this.config.cookieSecure,
      sameSite: this.config.isProduction ? 'none' : 'lax',
    });
  }
}
