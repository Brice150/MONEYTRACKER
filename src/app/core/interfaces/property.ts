import { PropertyType } from '../enums/property-type.enum';

export interface Property {
  type: PropertyType;
  city: string;
  surface: number;
  price: number;
  rent: number;
  ownershipRatio: number;
  remainingLoan: number;
}
