// User Profile Types

/**
 * User profile data structure
 */
export interface UserProfile {
  email: string;
  username: string;
  givenName: string;
  phone?: string;
  companyName?: string;
  newsletter?: boolean;
  emailVerifiedAt?: Date | null;
  createdAt: Date;
}

/**
 * Profile update payload (from client)
 */
export interface UserProfileUpdatePayload {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
}

/**
 * Profile update data for MongoDB (server-side)
 */
export interface UserProfileUpdateData {
  givenName: string;
  email: string;
  phone?: string;
  companyName?: string;
}

/**
 * API Response for GET /api/user/profile
 */
export interface GetUserProfileResponse {
  user: {
    email: string;
    username: string;
    givenName: string;
    phone?: string;
    companyName?: string;
    newsletter?: boolean;
    emailVerifiedAt?: Date | null;
    createdAt: Date;
  };
}

/**
 * API Response for PUT /api/user/profile
 */
export interface UpdateUserProfileResponse {
  message: string;
  user: {
    email: string;
    username: string;
    name: string;
    phone?: string;
    companyName?: string;
  };
}

/**
 * API Error Response
 */
export interface ProfileErrorResponse {
  error: string;
}

/**
 * Form state for profile editing
 */
export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
}

/**
 * Message state for UI feedback
 */
export interface ProfileMessage {
  type: "success" | "error" | "";
  text: string;
}
