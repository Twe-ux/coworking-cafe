// Export all models here

// ===== Auth & Users =====
export { User } from './user';
export { Role } from './role';
export { Permission } from './permission';
export type { PermissionDocument } from './permission';
export { Session } from './session';
export type { SessionDocument } from './session';

// ===== HR & Staff =====
export { TimeEntry } from './timeEntry';
export type { TimeEntryDocument } from './timeEntry';
export { Shift } from './shift';
export type { ShiftDocument } from './shift';
export { Availability } from './availability';
export type { AvailabilityDocument } from './availability';

// ===== Booking =====
export { Booking } from './booking';
export type { BookingDocument, BookingStatus, ReservationType } from './booking';
export { Space } from './space';
export type { SpaceDocument, SpaceAmenity, SpaceType } from './space';
export { default as SpaceConfiguration } from './spaceConfiguration';
export type { SpaceConfigurationDocument, PricingTier, PricingStructure, AvailableReservationTypes, DepositPolicy } from './spaceConfiguration';

// ===== Blog =====
export { Article } from './article';
export type { ArticleDocument } from './article';
export { Category } from './category';
export type { CategoryDocument } from './category';
export { Comment } from './comment';
export type { CommentDocument } from './comment';

// ===== Messaging =====
export { Conversation } from './conversation';
export type { ConversationDocument, ConversationType, ConversationParticipant } from './conversation';
export { Message } from './message';
export type { MessageDocument, MessageType, MessageStatus, MessageAttachment, ReadReceipt } from './message';

// ===== Other =====
export { Newsletter } from './newsletter';
export { default as PromoConfig } from './promoConfig';
export type { PromoConfigDocument } from './promoConfig';
export { MenuCategory } from './menuCategory';
export { MenuItem } from './menuItem';
export { ContactMail, type IContactMail } from './contactMail';
export { default as GlobalHoursConfiguration } from './globalHours';
export type { GlobalHoursConfigurationDocument, DayHours, WeeklyHours, ExceptionalClosure } from './globalHours';
