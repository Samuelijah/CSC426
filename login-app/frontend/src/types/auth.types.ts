export interface User {
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface FormErrors {
  username?: string;
  password?: string;
  email?: string;
}

export interface MessageState {
  type: 'success' | 'error';
  text: string;
}

export interface LoginFormData {
  username: string;
  password: string;
  email: string;
}

export interface LoginProps {
  onLogin: (user: User, token: string) => void;
  showLogin: boolean;
  onToggle: () => void;
}