import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user?.role === 'STUDENT') {
      const feedback = await prisma.feedback.findMany({
        where: { userId: req.user.id },
        orderBy: { date: 'desc' }
      });
      return res.json({ records: feedback });
    } else {
      const feedback = await prisma.feedback.findMany({
        include: {
          user: {
            select: { name: true, email: true, rollNumber: true }
          }
        },
        orderBy: { date: 'desc' }
      });

      const totalCount = feedback.length;
      const avgRating = totalCount > 0
        ? feedback.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / totalCount
        : 0;

      return res.json({
        records: feedback,
        stats: { totalCount, avgRating: Number(avgRating.toFixed(2)) }
      });
    }
  } catch (error) {
    console.error('Fetch feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { mealType, rating, comment } = req.body;

    if (!mealType || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'MealType and a valid rating (1-5) are required' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user!.id,
        mealType: mealType as MealType,
        rating,
        comment
      },
      include: {
        user: {
          select: { name: true, email: true, rollNumber: true }
        }
      }
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
