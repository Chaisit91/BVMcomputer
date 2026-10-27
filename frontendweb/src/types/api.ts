/** Lifecycle of one async request, shared by every slice. */
export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

/** `token` is optional — cookie-session backends can omit it and rely on withCredentials. */
export interface LoginResponse {
  user: AuthUser;
  token?: string;
}

export type ShippingMethodId = 'standard' | 'express';
export type PaymentMethodId = 'bank' | 'card' | 'qr' | 'cod';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
}

export interface CreateOrderRequest {
  items: { productId: string; category: string; quantity: number; unitPrice: number }[];
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
  couponCode?: string;
  saveAddress: boolean;
}

export interface CreateOrderResponse {
  orderId: string;
  status: 'pending' | 'paid';
  /** Final amount as calculated by the backend — the source of truth, not the cart total. */
  total: number;
  /** Payment-gateway page to send the customer to (card / QR), when the backend returns one. */
  paymentUrl?: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  discount: number;
  message?: string;
}

export type Gender = 'male' | 'female' | 'other';

/** The signed-in customer's own profile (GET/PUT /account/profile). */
export interface UserProfile {
  id: string;
  /** Login email — shown read-only; changing it is a separate, verified flow. */
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  /** ISO date "YYYY-MM-DD", when the customer has given one. */
  birthDate?: string;
  gender?: Gender;
  avatarUrl?: string;
  /** ISO timestamp of sign-up, if the backend provides it. */
  memberSince?: string;
}

export type UpdateProfileRequest = Pick<UserProfile, 'firstName' | 'lastName' | 'phone' | 'birthDate' | 'gender'>;

/**
 * - live: read from / saved to the backend.
 * - demo: backend unreachable (API_MODE auto/mock) — nothing was actually loaded from or saved to a server.
 */
export type AccountDataSource = 'live' | 'demo';

/** Counts shown on the account page (GET /account/summary). */
export interface AccountSummary {
  orders: number;
  wishlist: number;
  shipping: number;
  pendingPayment: number;
}
