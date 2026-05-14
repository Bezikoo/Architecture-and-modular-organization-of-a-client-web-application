export type TicketCategory = 'technical' | 'billing' | 'general' | 'complaint';
export type TicketStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export const TICKET_CATEGORIES: TicketCategory[] = ['technical', 'billing', 'general', 'complaint'];
export const TICKET_STATUSES: TicketStatus[] = ['new', 'in_progress', 'resolved', 'closed'];

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Технічна',
  billing: 'Оплата',
  general: 'Загальна',
  complaint: 'Скарга',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'Нова',
  in_progress: 'В обробці',
  resolved: 'Вирішена',
  closed: 'Закрита',
};

export interface Ticket {
  id: number;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFormData {
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  description: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketsResponse {
  tickets: Ticket[];
  pagination: PaginationData;
}
