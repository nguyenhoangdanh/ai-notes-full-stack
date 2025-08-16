import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { User, UserWithPassword, GoogleOAuthUser, JwtPayload } from '../types/user.types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
    });

    // Generate JWT token
    const payload: JwtPayload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email (include password for verification)
    const user = await this.usersService.findByEmail(loginDto.email, true) as UserWithPassword | null;
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      throw new UnauthorizedException('Please use Google login or reset your password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    };
  }

  async googleLogin(user: GoogleOAuthUser): Promise<AuthResponseDto> {
    let existingUser = await this.usersService.findByEmail(user.email);
    
    if (!existingUser) {
      existingUser = await this.usersService.create({
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        image: user.picture,
        // No password for OAuth users
      });
    } else if (!existingUser.image && user.picture) {
      // Update user image if not set
      await this.usersService.update(existingUser.id, {
        image: user.picture,
        name: existingUser.name || (user.firstName + ' ' + user.lastName),
      });
      existingUser.image = user.picture;
    }

    const payload: JwtPayload = { email: user.email, sub: existingUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        image: existingUser.image,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return await this.usersService.findByEmail(payload.email);
  }
}
