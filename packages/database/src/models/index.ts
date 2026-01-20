// Export all models here
export { User } from './user';
export { Role } from './role';
export { Newsletter } from './newsletter';
export { default as PromoConfig } from './promoConfig';
export type { PromoConfigDocument } from './promoConfig';
export { MenuCategory } from './menuCategory';
export { MenuItem } from './menuItem';
export { ContactMail, type IContactMail } from './contactMail';
export { default as GlobalHoursConfiguration } from './globalHours';
export type { GlobalHoursConfigurationDocument, DayHours, WeeklyHours, ExceptionalClosure } from './globalHours';
export { default as SpaceConfiguration } from './spaceConfiguration';
export type { SpaceConfigurationDocument, PricingTier, PricingStructure, AvailableReservationTypes, DepositPolicy } from './spaceConfiguration';
export { Booking } from './booking';
export type { BookingDocument, BookingStatus, ReservationType } from './booking';
