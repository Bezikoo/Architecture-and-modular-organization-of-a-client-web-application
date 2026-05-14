import axios from 'axios';
import type { Ticket, TicketFormData, TicketsResponse } from '../types/ticket';

const API_URL = 'http://localhost:3000/api/tickets';

export const ticketApi = {
  async getTickets(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
    category?: string;
    status?: string;
  } = {}): Promise<TicketsResponse> {
    const response = await axios.get<TicketsResponse>(API_URL, { params });
    return response.data;
  },

  async getTicketById(id: number): Promise<Ticket> {
    const response = await axios.get<Ticket>(`${API_URL}/${id}`);
    return response.data;
  },

  async createTicket(data: TicketFormData): Promise<Ticket> {
    const response = await axios.post<Ticket>(API_URL, data);
    return response.data;
  },

  async updateTicket(id: number, data: TicketFormData): Promise<Ticket> {
    const response = await axios.put<Ticket>(`${API_URL}/${id}`, data);
    return response.data;
  },

  async deleteTicket(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },
};
