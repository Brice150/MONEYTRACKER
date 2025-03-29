import { RealEstate } from './real-estate';

export interface RealEstates {
  id: string;
  realEstates: RealEstate[];
  userId?: string;
}
