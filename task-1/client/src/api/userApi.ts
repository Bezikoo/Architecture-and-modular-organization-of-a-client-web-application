import axios from 'axios';
import type { User, UserFormData, UsersResponse } from '../types/user';

const API_URL = 'http://localhost:3000/api/users';

export const userApi = {
  async getUsers(params: { page?: number; limit?: number; search?: string; sortBy?: string; order?: string } = {}): Promise<UsersResponse> {
    const response = await axios.get<UsersResponse>(API_URL, { params });
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await axios.get<User>(`${API_URL}/${id}`);
    return response.data;
  },

  async createUser(userData: UserFormData): Promise<User> {
    const response = await axios.post<User>(API_URL, userData);
    return response.data;
  },

  async updateUser(id: number, userData: UserFormData): Promise<User> {
    const response = await axios.put<User>(`${API_URL}/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },
};
