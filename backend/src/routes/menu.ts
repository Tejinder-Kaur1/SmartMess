import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { date, mealType } = req.query;
    const query: any = {};

    if (date) {
      const [year, month, day] = (date as string).split('T')[0].split('-').map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
      query.date = { gte: startOfDay, lte: endOfDay };
    }
    if (mealType) {
      query.mealType = mealType as MealType;
    }

    const menus = await prisma.menu.findMany({
      where: query,
      orderBy: [
        { date: 'asc' },
        { mealType: 'asc' }
      ]
    });

    res.json(menus);
  } catch (error) {
    console.error('Fetch menus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date, mealType, items } = req.body;

    if (!date || !mealType || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Date, mealType, and items array are required' });
    }

    const [year, month, day] = (date as string).split('T')[0].split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const existing = await prisma.menu.findFirst({
      where: {
        mealType: mealType as MealType,
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (existing) {
      const updated = await prisma.menu.update({
        where: { id: existing.id },
        data: { items }
      });
      return res.status(200).json(updated);
    }

    const menu = await prisma.menu.create({
      data: {
        date: startOfDay,
        mealType: mealType as MealType,
        items
      }
    });

    res.status(201).json(menu);
  } catch (error: any) {
    console.error('Create menu error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Menu already exists for this date and meal type' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const menu = await prisma.menu.update({
      where: { id: req.params.id },
      data: { items }
    });

    res.json(menu);
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.menu.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
