import express from 'express';
import cors from 'cors';
import ticketRoutes from './routes/ticketRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

export default app;
