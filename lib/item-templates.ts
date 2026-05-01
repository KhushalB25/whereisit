import type { ItemCategory, RoomCategory } from "@/lib/types";

export type ItemTemplate = {
  name: string;
  category: ItemCategory;
  roomCategory: RoomCategory;
  dailyConsumptionRate: number;
  consumptionIntervalDays: number;
  expiryDays?: number;
  quantity: number;
};

export const ITEM_TEMPLATES: ItemTemplate[] = [
  // ── Food ──
  { name: "Milk", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 1, consumptionIntervalDays: 1, expiryDays: 7, quantity: 1 },
  { name: "Bread", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 1, consumptionIntervalDays: 1, expiryDays: 5, quantity: 1 },
  { name: "Eggs", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 1, consumptionIntervalDays: 1, expiryDays: 14, quantity: 12 },
  { name: "Butter", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 0.5, consumptionIntervalDays: 1, expiryDays: 21, quantity: 1 },
  { name: "Cheese", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 0.3, consumptionIntervalDays: 1, expiryDays: 30, quantity: 1 },
  { name: "Yogurt", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 1, consumptionIntervalDays: 1, expiryDays: 10, quantity: 4 },
  { name: "Chicken Breast", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 1, consumptionIntervalDays: 2, expiryDays: 3, quantity: 2 },
  { name: "Apples", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 1, consumptionIntervalDays: 1, expiryDays: 14, quantity: 6 },
  { name: "Rice (1kg)", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 0.2, consumptionIntervalDays: 1, quantity: 1 },
  { name: "Pasta", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 0.5, consumptionIntervalDays: 2, quantity: 2 },

  // ── Beverages ──
  { name: "Orange Juice", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 1, consumptionIntervalDays: 1, expiryDays: 7, quantity: 1 },
  { name: "Coffee Beans", category: "Food", roomCategory: "Kitchen", dailyConsumptionRate: 0.3, consumptionIntervalDays: 1, quantity: 1 },

  // ── Medicines ──
  { name: "Paracetamol", category: "Medicines", roomCategory: "Storage", dailyConsumptionRate: 0, consumptionIntervalDays: 1, quantity: 1 },
  { name: "Vitamin D", category: "Medicines", roomCategory: "Storage", dailyConsumptionRate: 1, consumptionIntervalDays: 1, quantity: 30 },
  { name: "First Aid Kit", category: "Medicines", roomCategory: "Storage", dailyConsumptionRate: 0, consumptionIntervalDays: 1, quantity: 1 },

  // ── Cosmetics / Personal Care ──
  { name: "Toothpaste", category: "Cosmetics", roomCategory: "Bathroom", dailyConsumptionRate: 0.1, consumptionIntervalDays: 1, quantity: 1 },
  { name: "Shampoo", category: "Cosmetics", roomCategory: "Bathroom", dailyConsumptionRate: 0.05, consumptionIntervalDays: 1, quantity: 1 },
  { name: "Body Wash", category: "Cosmetics", roomCategory: "Bathroom", dailyConsumptionRate: 0.05, consumptionIntervalDays: 1, quantity: 1 },
  { name: "Toilet Paper", category: "Cosmetics", roomCategory: "Bathroom", dailyConsumptionRate: 0.5, consumptionIntervalDays: 1, quantity: 8 },

  // ── Cleaning / Tools ──
  { name: "Dish Soap", category: "Tools", roomCategory: "Kitchen", dailyConsumptionRate: 0.1, consumptionIntervalDays: 1, quantity: 1 },
  { name: "Laundry Detergent", category: "Tools", roomCategory: "Storage", dailyConsumptionRate: 0.2, consumptionIntervalDays: 7, quantity: 1 },
  { name: "Trash Bags", category: "Tools", roomCategory: "Kitchen", dailyConsumptionRate: 1, consumptionIntervalDays: 3, quantity: 20 },
  { name: "AA Batteries", category: "Electronics", roomCategory: "Storage", dailyConsumptionRate: 0, consumptionIntervalDays: 1, quantity: 4 },

  // ── Documents ──
  { name: "Passport", category: "Documents", roomCategory: "Study", dailyConsumptionRate: 0, consumptionIntervalDays: 1, quantity: 1 },
  { name: "Warranty Card", category: "Documents", roomCategory: "Study", dailyConsumptionRate: 0, consumptionIntervalDays: 1, quantity: 1 },

  // ── Electronics ──
  { name: "HDMI Cable", category: "Electronics", roomCategory: "Living Room", dailyConsumptionRate: 0, consumptionIntervalDays: 1, quantity: 1 },
  { name: "Phone Charger", category: "Electronics", roomCategory: "Bedroom", dailyConsumptionRate: 0, consumptionIntervalDays: 1, quantity: 1 },
];
