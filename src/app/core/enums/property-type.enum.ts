export enum PropertyType {
  BUILDING = 'Building',
  HOUSE = 'House',
  APPARTMENT = 'Appartment',
  LAND = 'Land',
  PARKING = 'Parking',
  COMMERCIAL = 'Commercial',
  OTHER = 'Other',
}

export const PropertyTypeIcons: Record<PropertyType, string> = {
  [PropertyType.BUILDING]: 'bx bxs-business',
  [PropertyType.HOUSE]: 'bx bxs-home',
  [PropertyType.APPARTMENT]: 'bx bxs-building-house',
  [PropertyType.LAND]: 'bx bxs-landscape',
  [PropertyType.PARKING]: 'bx bxs-parking',
  [PropertyType.COMMERCIAL]: 'bx bxs-store',
  [PropertyType.OTHER]: 'bx bxs-home-smile',
};
