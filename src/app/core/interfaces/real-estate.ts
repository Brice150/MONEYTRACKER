import { Property } from './property';

export interface RealEstate {
  id: string;
  properties: Property[];
  userId?: string;
}
