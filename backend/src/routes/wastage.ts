import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const wastage = await prisma.foodWaste.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(wastage);
  } catch (error) {
    console.error('Fetch wastage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date, kilograms } = req.body;

    if (!date || kilograms === undefined) {
      return res.status(400).json({ error: 'Date and kilograms are required' });
    }

    const [year, month, day] = (date as string).split('T')[0].split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const existing = await prisma.foodWaste.findFirst({
      where: { date: { gte: startOfDay, lte: endOfDay } }
    });

    if (existing) {
      const waste = await prisma.foodWaste.update({
        where: { id: existing.id },
        data: { kilograms: parseFloat(kilograms) }
      });
      return res.status(200).json(waste);
    }

    const waste = await prisma.foodWaste.create({
      data: { date: startOfDay, kilograms: parseFloat(kilograms) }
    });

    res.status(201).json(waste);
  } catch (error) {
    console.error('Add waste record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
