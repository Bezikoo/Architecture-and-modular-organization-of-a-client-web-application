import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ticketService = {
  async getAllTickets({ page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'desc', category = '', status = '' }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order },
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      tickets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getTicketById(id) {
    return prisma.ticket.findUnique({ where: { id: Number(id) } });
  },

  async createTicket(ticketData) {
    return prisma.ticket.create({ data: ticketData });
  },

  async updateTicket(id, ticketData) {
    return prisma.ticket.update({
      where: { id: Number(id) },
      data: ticketData,
    });
  },

  async deleteTicket(id) {
    return prisma.ticket.delete({ where: { id: Number(id) } });
  },
};
