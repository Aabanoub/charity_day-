export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  className: string;
  createdAt?: string;
}

export type SectionStatus = 'OPEN' | 'CLOSED' | 'COMPLETED';

export interface Section {
  id: string; // 'meat_chicken' | 'supermarket' | 'vegetables_fruits' | 'spices' | 'paper_products'
  nameEn: string;
  nameAr: string;
  imageUrl: string;
  status: SectionStatus;
  displayOrder: number;
  updatedAt?: string;
}

export interface Item {
  id: string;
  name: string;
  photoUrl: string;
  description?: string;
  sectionId?: string; // Links to Section.id
  active?: boolean;
  orderIndex?: number;
  createdAt?: string;
}

export interface PriceSubmission {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userClass: string;
  price: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMessage {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  active: boolean;
}

export interface LowestBidderInfo {
  name: string;
  className: string;
  phone: string;
  comment?: string;
  price: number;
  submittedAt: string;
}

export interface AdminItemSummary {
  id: string;
  name: string;
  photoUrl: string;
  description?: string;
  sectionId?: string;
  active: boolean;
  lowestPrice: number | null;
  pricesCount: number;
  lowestBidder: LowestBidderInfo | null;
  allSubmissions: Array<{
    id: string;
    userId: string;
    userName: string;
    userClass: string;
    userPhone: string;
    price: number;
    comment?: string;
    submittedAt: string;
  }>;
}

export interface SiteStatusSettings {
  isClosed: boolean;
  title: string;
  message: string;
}
