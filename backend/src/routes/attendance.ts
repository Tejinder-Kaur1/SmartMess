import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { date } = req.query;

    if (req.user?.role === 'STUDENT') {
      const query: any = { userId: req.user.id };
      if (date) {
        const [year, month, day] = (date as string).split('T')[0].split('-').map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        query.date = { gte: startOfDay, lte: endOfDay };
      }

      const records = await prisma.attendance.findMany({
        where: query,
        orderBy: { date: 'desc' }
      });
      return res.json(records);
    } else {
      const query: any = {};
      if (date) {
        const [year, month, day] = (date as string).split('T')[0].split('-').map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        query.date = { gte: startOfDay, lte: endOfDay };
      }

      const records = await prisma.attendance.findMany({
        where: query,
        include: {
          user: {
            select: { name: true, email: true, rollNumber: true }
          }
        },
        orderBy: { date: 'desc' }
      });
      return res.json(records);
    }
  } catch (error) {
    console.error('Fetch attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { date, mealType } = req.body;
    const userId = req.user!.id;

    if (!date || !mealType) {
      return res.status(400).json({ error: 'Date and mealType are required' });
    }

    const [year, month, day] = (date as string).split('T')[0].split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        userId,
        mealType: mealType as MealType,
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Attendance already marked for this meal', record: existing });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: startOfDay,
        mealType: mealType as MealType,
        status: 'ATTENDED'
      },
      include: {
        user: {
          select: { name: true, email: true, rollNumber: true }
        }
      }
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
