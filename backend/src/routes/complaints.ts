import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

type ComplaintCategory = 'FOOD_QUALITY' | 'HYGIENE' | 'SERVICE' | 'MENU' | 'OTHER';
type ComplaintStatus = 'PENDING' | 'RESOLVED';
const VALID_STATUSES: ComplaintStatus[] = ['PENDING', 'RESOLVED'];

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user?.role === 'STUDENT') {
      const complaints = await prisma.complaint.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(complaints);
    } else {
      const complaints = await prisma.complaint.findMany({
        include: {
          user: {
            select: { name: true, email: true, rollNumber: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(complaints);
    }
  } catch (error) {
    console.error('Fetch complaints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { category, description } = req.body;

    if (!category || !description) {
      return res.status(400).json({ error: 'Category and description are required' });
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: req.user!.id,
        category: category as ComplaintCategory,
        description
      },
      include: {
        user: {
          select: { name: true, email: true, rollNumber: true }
        }
      }
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status as ComplaintStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { status: status as ComplaintStatus },
      include: {
        user: {
          select: { name: true, email: true, rollNumber: true }
        }
      }
    });

    res.json(complaint);
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
