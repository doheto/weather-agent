export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateData {
  email: string;
  name?: string;
  picture?: string;
  googleId?: string;
}

export interface UserUpdateData {
  name?: string;
  picture?: string;
  googleId?: string;
} 