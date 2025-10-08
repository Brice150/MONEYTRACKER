export enum PropertyType {
  BUILDING = 'Building',
  HOUSE = 'House',
  APPARTMENT = 'Appartment',
  LAND = 'Land',
  PARKING = 'Parking',
  OTHER = 'Other',
}

export const PropertyTypeIcons: Record<PropertyType, string> = {
  [PropertyType.BUILDING]: 'bx bxs-business',
  [PropertyType.HOUSE]: 'bx bxs-home',
  [PropertyType.APPARTMENT]: 'bx bxs-building-house',
  [PropertyType.LAND]: 'bx bxs-landscape',
  [PropertyType.PARKING]: 'bx bxs-parking',
  [PropertyType.OTHER]: 'bx bxs-category',
};
