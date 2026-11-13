import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/monthly', authenticate, requireAdmin, async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const parsedYear = parseInt(year as string);
    const parsedMonth = parseInt(month as string);

    const startDate = new Date(parsedYear, parsedMonth - 1, 1);
    const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59, 999);

    const [attendances, feedback, complaints, wastage] = await Promise.all([
      prisma.attendance.findMany({
        where: { date: { gte: startDate, lte: endDate } }
      }),
      prisma.feedback.findMany({
        where: { date: { gte: startDate, lte: endDate } }
      }),
      prisma.complaint.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.foodWaste.findMany({
        where: { date: { gte: startDate, lte: endDate } }
      })
    ]);

    const totalMealsAttended = attendances.length;

    const uniqueUsers = new Set(attendances.map((a: { userId: string }) => a.userId)).size;
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const studentBase = totalStudents > 0 ? totalStudents : (uniqueUsers > 0 ? uniqueUsers : 1);
    const daysInMonth = new Date(parsedYear, parsedMonth, 0).getDate();
    const isCurrentMonthYear = new Date().getFullYear() === parsedYear && (new Date().getMonth() + 1) === parsedMonth;
    const daysConsidered = isCurrentMonthYear ? Math.max(1, new Date().getDate()) : daysInMonth;
    const maxExpectedMeals = studentBase * daysConsidered * 3;
    const avgAttendance = maxExpectedMeals > 0
      ? Math.min(100, (totalMealsAttended / maxExpectedMeals) * 100)
      : 0;

    const avgRating = feedback.length > 0
      ? feedback.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / feedback.length
      : 0;

    const resolvedComplaints = complaints.filter((c: { status: string }) => c.status === 'RESOLVED').length;

    const avgFoodWaste = wastage.length > 0
      ? wastage.reduce((sum: number, w: { kilograms: number }) => sum + w.kilograms, 0) / wastage.length
      : 0;

    res.json({
      totalMealsAttended,
      avgAttendance: Number(avgAttendance.toFixed(2)),
      avgRating: Number(avgRating.toFixed(2)),
      totalComplaints: complaints.length,
      resolvedComplaints,
      avgFoodWaste: Number(avgFoodWaste.toFixed(2)),
      breakdown: {
        attendances,
        complaints,
        wastage
      }
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
