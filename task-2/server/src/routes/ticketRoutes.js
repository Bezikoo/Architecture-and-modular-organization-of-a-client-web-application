import { Router } from 'express';
import { ticketController } from '../controllers/ticketController.js';

const router = Router();

router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.post('/', ticketController.createTicket);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

export default router;
