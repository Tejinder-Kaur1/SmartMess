import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use plain string constants — Prisma accepts string values for enum fields at runtime
const MealType = { BREAKFAST: 'BREAKFAST', LUNCH: 'LUNCH', DINNER: 'DINNER' } as const;
const ComplaintCategory = { FOOD_QUALITY: 'FOOD_QUALITY', HYGIENE: 'HYGIENE', SERVICE: 'SERVICE', MENU: 'MENU', OTHER: 'OTHER' } as const;
const ComplaintStatus = { PENDING: 'PENDING', RESOLVED: 'RESOLVED' } as const;
const Role = { STUDENT: 'STUDENT', ADMIN: 'ADMIN' } as const;
type MealTypeValue = typeof MealType[keyof typeof MealType];
type ComplaintCategoryValue = typeof ComplaintCategory[keyof typeof ComplaintCategory];
type ComplaintStatusValue = typeof ComplaintStatus[keyof typeof ComplaintStatus];
type RoleValue = typeof Role[keyof typeof Role];

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Clear existing data in correct order
  console.log('Clearing database tables...');
  await prisma.complaint.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.foodWaste.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create admin user
  console.log('Creating Admin User...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@smartmess.com',
      password: adminPassword,
      role: Role.ADMIN,
    }
  });

  // 3. Create students
  console.log('Creating Students...');
  const studentPassword = await bcrypt.hash('student123', 10);

  // Special demo student
  await prisma.user.create({
    data: {
      name: 'Demo Student',
      email: 'student@smartmess.com',
      password: studentPassword,
      role: Role.STUDENT,
      rollNumber: 'DEMO001'
    }
  });

  // 15 realistic students
  const students = [];
  for (let i = 1; i <= 15; i++) {
    const student = await prisma.user.create({
      data: {
        name: `Student ${i}`,
        email: `student${i}@smartmess.com`,
        password: studentPassword,
        role: Role.STUDENT,
        rollNumber: `CS2024${i.toString().padStart(3, '0')}`
      }
    });
    students.push(student);
  }

  // 4. Create menus for last 7 days + today + next 3 days (11 days)
  console.log('Creating Menus...');
  const breakfastItems = [['Poha', 'Chai', 'Banana'], ['Paratha', 'Curd', 'Pickle'], ['Upma', 'Coconut Chutney', 'Coffee']];
  const lunchItems = [['Rice', 'Dal', 'Paneer Masala', 'Salad', 'Papad'], ['Chapati', 'Rajma', 'Rice', 'Raita'], ['Biryani', 'Raita', 'Salad']];
  const dinnerItems = [['Roti', 'Dal Tadka', 'Aloo Sabji', 'Rice'], ['Chapati', 'Shahi Paneer', 'Dal', 'Salad'], ['Naan', 'Mix Veg', 'Dal Makhani']];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = -7; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    await prisma.menu.createMany({
      data: [
        {
          date,
          mealType: MealType.BREAKFAST,
          items: breakfastItems[Math.abs(i) % breakfastItems.length]
        },
        {
          date,
          mealType: MealType.LUNCH,
          items: lunchItems[Math.abs(i) % lunchItems.length]
        },
        {
          date,
          mealType: MealType.DINNER,
          items: dinnerItems[Math.abs(i) % dinnerItems.length]
        }
      ]
    });
  }

  // 5. Create Attendance for last 7 days
  console.log('Creating Attendance records...');
  for (let i = -7; i <= 0; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    for (const student of students) {
      // ~80% attendance rate
      if (Math.random() > 0.2) {
        await prisma.attendance.create({
          data: {
            userId: student.id,
            date,
            mealType: MealType.BREAKFAST
          }
        });
      }
      if (Math.random() > 0.2) {
        await prisma.attendance.create({
          data: {
            userId: student.id,
            date,
            mealType: MealType.LUNCH
          }
        });
      }
      if (Math.random() > 0.2) {
        await prisma.attendance.create({
          data: {
            userId: student.id,
            date,
            mealType: MealType.DINNER
          }
        });
      }
    }
  }

  // 6. Create Feedback for last 7 days
  console.log('Creating Feedback...');
  const comments = ['Food was good today', 'Paneer could be better', 'Loved the rajma!', 'Rice was a bit undercooked', 'Excellent meal!'];
  for (let i = -7; i <= 0; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    for (let j = 0; j < 3; j++) {
      const student = students[Math.floor(Math.random() * students.length)];
      await prisma.feedback.create({
        data: {
          userId: student.id,
          mealType: Object.values(MealType)[Math.floor(Math.random() * 3)],
          rating: Math.floor(Math.random() * 3) + 3, // 3 to 5
          comment: comments[Math.floor(Math.random() * comments.length)],
          date
        }
      });
    }
  }

  // 7. Create Complaints
  console.log('Creating Complaints...');
  const complaintDescriptions = [
    'Plates were not clean properly',
    'Water cooler is not working on 2nd floor',
    'Found a bug in the salad today',
    'Please add more sweet dishes to the menu',
    'Staff behaviour was rude during breakfast'
  ];

  for (let i = 0; i < 10; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    await prisma.complaint.create({
      data: {
        userId: student.id,
        category: Object.values(ComplaintCategory)[Math.floor(Math.random() * 5)],
        description: complaintDescriptions[i % complaintDescriptions.length],
        status: i % 2 === 0 ? ComplaintStatus.RESOLVED : ComplaintStatus.PENDING,
      }
    });
  }

  // 8. Create Food Waste for last 10 days
  console.log('Creating Food Waste records...');
  for (let i = -10; i <= 0; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    await prisma.foodWaste.create({
      data: {
        date,
        kilograms: Math.floor(Math.random() * (20 - 8 + 1) + 8) // Random between 8 and 20
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
