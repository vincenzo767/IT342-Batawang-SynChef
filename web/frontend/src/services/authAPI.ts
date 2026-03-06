import axios from 'axios';

const API_BASE_URL = '/api';

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  username: string;
  fullName: string;
  profileImageUrl: string;
  emailVerified: boolean;
}

const authAPI = {
  register: (data: RegisterRequest) =>
    axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, data),

  login: (data: LoginRequest) =>
    axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, data),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authAPI;
