/**
 * Types Index - apps/site
 * Point d'entrée centralisé pour tous les types
 */

// Booking Types
export type {
  BookingFormData,
  ValidationErrors,
  PriceCalculation,
  PromoDetails,
  ReservationDetails,
  BookingStatus,
  AvailabilitySlot,
  CalculatePriceResponse,
  CreatePaymentIntentResponse,
} from './booking';

// User Types
export type {
  ClientProfile,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  UserStats,
  UserSettings,
  UpdateProfileData,
  ChangePasswordData,
  UserSession,
} from './user';

// Blog Types
export type {
  ArticlePreview,
  ArticleFull,
  Article,
  CategoryPreview,
  CategoryWithCount,
  Category,
  ArticleAuthor,
  ArticleSEO,
  ArticleComment,
  CommentAuthor,
  CreateCommentData,
  ArticleFilters,
} from './blog';

// Common Types
export type {
  ApiResponse,
  PaginatedResult,
  PaginationParams,
  SortParams,
  SelectOption,
  LoadingState,
  ApiError,
  PageMetadata,
  BreadcrumbItem,
  Coordinates,
  Address,
  TimeRange,
  DateRange,
  UploadedFile,
  Result,
  Nullable,
  Optional,
  PartialExcept,
  BaseComponentProps,
} from './common';
