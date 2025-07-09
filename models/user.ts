import { Channel, Media, Video, Task, UserSettings, Role } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  password?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string | null;
  avatarUrl?: string | null;
  
  // Relations
  channels?: Channel[];
  media?: Media[];
  videos?: Video[];
  tasks?: Task[];
  settings?: UserSettings | null;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  password?: string;
  googleId?: string;
  avatarUrl?: string;
  role?: Role;
}

export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string;
  role?: Role;
}

export interface UserWithSettings extends User {
  settings: UserSettings;
}

export interface UserWithChannels extends User {
  channels: Channel[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}