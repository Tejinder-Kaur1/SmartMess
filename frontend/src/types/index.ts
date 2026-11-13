export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  rollNumber?: string;
}

export interface Menu {
  id: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  items: string[];
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  status: string;
  user?: { name: string; email: string; rollNumber?: string };
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  rating: number;
  comment?: string;
  date: string;
  user?: { name: string; email: string };
}

export interface Complaint {
  id: string;
  userId: string;
  category: 'FOOD_QUALITY' | 'HYGIENE' | 'SERVICE' | 'MENU' | 'OTHER';
  description: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
  user?: { name: string; email: string };
}

export interface FoodWaste {
  id: string;
  date: string;
  kilograms: number;
}

export interface MonthlyReport {
  totalMealsAttended: number;
  avgAttendance: number;
  avgRating: number;
  totalComplaints: number;
  resolvedComplaints: number;
  avgFoodWaste: number;
}
