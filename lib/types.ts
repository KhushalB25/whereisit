export type ItemStatus = "active" | "finished";
export type RoomCategory = "Bedroom" | "Living Room" | "Kitchen" | "Bathroom" | "Study" | "Storage" | "Garage" | "Balcony" | "Other";
export type ItemCategory = "Documents" | "Electronics" | "Clothing" | "Food" | "Keys" | "Tools" | "Medicines" | "Cosmetics" | "Miscellaneous" | "Custom";

export const ROOM_CATEGORIES: RoomCategory[] = ["Bedroom", "Living Room", "Kitchen", "Bathroom", "Study", "Storage", "Garage", "Balcony", "Other"];
export const ITEM_CATEGORIES: ItemCategory[] = ["Documents", "Electronics", "Clothing", "Food", "Keys", "Tools", "Medicines", "Cosmetics", "Miscellaneous", "Custom"];

export type ApiTimestamp = {
  seconds: number;
  nanoseconds: number;
  millis: number;
  iso: string;
};

export type ItemType = "inventory" | "wishlist";

export type WishlistPriority = "low" | "medium" | "high";

export type InventoryItem = {
  id: string;
  userId: string;
  name: string | null;
  location: string | null;
  category: string;
  roomCategory: RoomCategory;
  isPrivate: boolean;
  encryptionSalt: string | null;
  encryptedData: string | null;
  quantity: number;
  expiryDate: ApiTimestamp | null;
  dailyConsumptionRate: number;
  consumptionIntervalDays: number;
  lastConsumedAt?: ApiTimestamp | null;
  photoURL: string | null;
  notes: string | null;
  createdAt: ApiTimestamp;
  updatedAt: ApiTimestamp;
  status: ItemStatus;
  lastAction?: string;
  lastInteractedAt?: ApiTimestamp | null;
  itemType?: ItemType;
  estimatedPrice?: number;
  priority?: WishlistPriority;
  purchaseLink?: string;
};

export type InventoryFormValues = {
  name: string;
  location: string;
  roomCategory: RoomCategory;
  category: ItemCategory;
  customCategory: string;
  isPrivate: boolean;
  encryptionSalt?: string | null;
  encryptedData?: string | null;
  quantity: number;
  expiryDate: string;
  dailyConsumptionRate: number;
  consumptionIntervalDays: number;
  notes: string;
  photoFile?: File | null;
  itemType?: ItemType;
  estimatedPrice?: number;
  priority?: WishlistPriority;
  purchaseLink?: string;
};

export type ConsumptionLog = {
  id: string;
  timestamp: ApiTimestamp | null;
  quantityConsumed: number;
  date: string;
};

export type LocationHistoryEntry = {
  id: string;
  oldLocation: string | null;
  newLocation: string | null;
  oldRoomCategory: string | null;
  newRoomCategory: string | null;
  changedAt: ApiTimestamp;
};

export type SharePermission = "view" | "edit";

export type ShareRecord = {
  id: string;
  itemId: string;
  sharedWithEmail: string;
  permission: SharePermission;
  createdAt: ApiTimestamp;
  accepted?: boolean;
};

export type ShoppingItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  isSuggested: boolean;
  linkedItemId?: string;
  notes?: string;
  createdAt: ApiTimestamp;
};

export type UserProfile = {
  displayName: string;
  email: string;
  createdAt: ApiTimestamp;
};

export type SecurityQuestionRecord = {
  questionIndex: number;
  answerHash: string;
};

export const SECURITY_QUESTIONS_PRESET = [
  "What was the name of your first pet?",
  "What was the name of your elementary school?",
  "What was your childhood nickname?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the make and model of your first car?",
  "What was the name of your first teacher?",
  "What is the name of your favorite book?",
  "What was the name of your best childhood friend?",
  "What is your favorite food?",
] as const;
