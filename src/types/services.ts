
// Service types and categories
export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  estimatedTime: number; // in minutes
  basePrice: number;
  isActive: boolean;
}