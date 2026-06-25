export type ListingCategory =
  | 'home_repairs'
  | 'cooking'
  | 'tutoring'
  | 'languages'
  | 'music'
  | 'gardening'
  | 'crafts'
  | 'fitness'
  | 'tech_help'
  | 'career'
  | 'finance'
  | 'first_aid';

export const LISTING_CATEGORIES: ListingCategory[] = [
  'home_repairs', 'cooking', 'tutoring', 'languages',
  'music', 'gardening', 'crafts', 'fitness',
  'tech_help', 'career', 'finance', 'first_aid',
];

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
  home_repairs: 'Home Repairs',
  cooking: 'Cooking',
  tutoring: 'Tutoring',
  languages: 'Languages',
  music: 'Music',
  gardening: 'Gardening',
  crafts: 'Crafts',
  fitness: 'Fitness',
  tech_help: 'Tech Help',
  career: 'Career',
  finance: 'Finance',
  first_aid: 'First Aid',
};

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  location: GeoPoint;
  neighbourhoodName: string;
  creditBalance: number;
  createdAt: string;
}

export interface Listing {
  id: string;
  userId: string;
  type: 'offer' | 'request';
  title: string;
  description: string;
  category: ListingCategory;
  tags: string[];
  location: GeoPoint;
  geohash?: string;
  radiusKm: number;
  creditsPerHour: number;
  isActive: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  listingId: string;
  listingTitle: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCounts: Record<string, number>;
  createdAt: string;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  listingId: string;
  credits: number;
  note?: string;
  createdAt: string;
}

export interface ListingFormValues {
  title: string;
  description: string;
  category: ListingCategory;
  type: 'offer' | 'request';
  creditsPerHour: number;
  tags: string;
  radiusKm: number;
}
