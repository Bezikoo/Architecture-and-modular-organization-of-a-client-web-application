import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userService = {
  async getAllUsers({ page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'desc' }) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getUserById(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  },

  async createUser(userData) {
    return prisma.user.create({ data: userData });
  },

  async updateUser(id, userData) {
    return prisma.user.update({
      where: { id: Number(id) },
      data: userData,
    });
  },

  async deleteUser(id) {
    return prisma.user.delete({ where: { id: Number(id) } });
  },
};
