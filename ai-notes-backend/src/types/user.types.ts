export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  password: string | null;
}

export interface GoogleOAuthUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export interface JwtPayload {
  email: string;
  sub: string;
  iat?: number;
  exp?: number;
}

export interface CreateUserData {
  email: string;
  name?: string;
  image?: string;
  password?: string;
}

export interface UpdateUserData {
  name?: string;
  image?: string;
}


