import { ticketService } from '../services/ticketService.js';

export const ticketController = {
  async getTickets(req, res, next) {
    try {
      const { page, limit, search, sortBy, order, category, status } = req.query;
      const result = await ticketService.getAllTickets({ page, limit, search, sortBy, order, category, status });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getTicketById(req, res, next) {
    try {
      const ticket = await ticketService.getTicketById(req.params.id);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  },

  async createTicket(req, res, next) {
    try {
      const ticket = await ticketService.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  },

  async updateTicket(req, res, next) {
    try {
      const ticket = await ticketService.updateTicket(req.params.id, req.body);
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  },

  async deleteTicket(req, res, next) {
    try {
      await ticketService.deleteTicket(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
