import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import menuRoutes from './routes/menu';
import attendanceRoutes from './routes/attendance';
import feedbackRoutes from './routes/feedback';
import complaintRoutes from './routes/complaints';
import wastageRoutes from './routes/wastage';
import reportRoutes from './routes/reports';
import './types/express.d';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/wastage', wastageRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SmartMess Backend running on port ${PORT}`);
});
