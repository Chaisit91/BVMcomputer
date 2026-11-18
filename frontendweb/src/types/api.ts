import type { ProductCategorySlug } from '../data/catalog';

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
  /** Present only when the customer ticked "ขอใบกำกับภาษี" at checkout. */
  taxInvoice?: CheckoutTaxInvoice;
}

/** Tax-invoice details entered at checkout (same fields as a saved tax address, minus the default flag). */
export type CheckoutTaxInvoice = Omit<TaxAddressInput, 'isDefault'>;

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

/**
 * One saved product in the customer's wishlist (GET /wishlist). Only a reference is stored —
 * name, price and stock are read from the live catalog, so they're never out of date.
 */
export interface WishlistEntry {
  category: ProductCategorySlug;
  productId: string;
  /** ISO timestamp — drives the "ล่าสุด" sort. */
  addedAt: string;
}

/** Fields the customer fills in for a shipping address (POST/PUT /account/addresses). */
export interface SavedAddressInput {
  recipientName: string;
  phone: string;
  /** House number, village, soi, road — everything before the sub-district. */
  addressLine: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  /** Ask for this one to become the default; the server unsets the previous default. */
  isDefault: boolean;
}

/** A saved shipping address (GET /account/addresses). Exactly one has `isDefault` when the list isn't empty. */
export interface SavedAddress extends SavedAddressInput {
  id: string;
}

export type TaxPayerType = 'individual' | 'company';

/** Fields for a tax-invoice / receipt address (POST/PUT /account/tax-addresses). */
export interface TaxAddressInput {
  payerType: TaxPayerType;
  /** Full name (individual) or registered company name (company). */
  name: string;
  /** 13-digit taxpayer ID — the national ID number for individuals. */
  taxId: string;
  phone: string;
  addressLine: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  /** Ask for this one to become the default; the server unsets the previous default. */
  isDefault: boolean;
}

/** A saved tax-invoice address (GET /account/tax-addresses). Exactly one is default when the list isn't empty. */
export interface TaxAddress extends TaxAddressInput {
  id: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'jcb' | 'amex' | 'unknown';

/**
 * A saved card (GET /account/payment-methods). Deliberately has no full card number and no CVV —
 * the full number only ever goes to the payment gateway, which hands back a token.
 */
export interface PaymentMethod {
  id: string;
  brand: CardBrand;
  last4: string;
  holderName: string;
  expMonth: number;
  /** Four-digit year. */
  expYear: number;
  /**
   * Issuing bank as identified from the card's BIN/IIN by the payment provider, e.g. "ธนาคารกรุงไทย (KRUNG THAI BANK)".
   * null when it couldn't be identified — never filled in by guessing or by the customer.
   */
  bankName: string | null;
  isDefault: boolean;
}

/** POST /account/payment-methods — just the gateway token; the backend reads brand, last 4 and issuer from the provider. */
export interface AddPaymentMethodRequest {
  token: string;
  makeDefault: boolean;
}

/** Where an order is in fulfilment. The tabs on "คำสั่งซื้อของฉัน" filter by this. */
export type OrderStatus = 'to_ship' | 'shipping' | 'delivered';

/** One line of an order, as it was when the customer bought it (prices don't follow later catalog changes). */
export interface OrderItem {
  name: string;
  quantity: number;
  /** Price per unit at the time of purchase. */
  unitPrice: number;
  imageUrl?: string;
}

/** A row in the order history (GET /account/orders). */
export interface OrderSummary {
  id: string;
  /** Shown to the customer, e.g. "ORD-20261114-089". */
  orderNumber: string;
  /** ISO timestamp with offset. */
  placedAt: string;
  status: OrderStatus;
  items: OrderItem[];
  /** Net amount actually charged — from the backend, never re-added on the client. */
  total: number;
}

/** Carrier milestones, in order: accepted into the carrier's system → in transit → out for delivery → delivered. */
export type OrderTrackingStep = 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';

export interface OrderTrackingEvent {
  step: OrderTrackingStep;
  /** ISO timestamp of when the parcel reached this step. */
  at: string;
}

/** One scan / update from the carrier ("ประวัติการอัปเดตล่าสุด"). */
export interface OrderTrackingUpdate {
  /** ISO timestamp. */
  at: string;
  description: string;
  /** Branch or hub where it happened, when the carrier reports one. */
  location: string | null;
}

export interface OrderCarrier {
  name: string;
  /** Carrier hotline, e.g. "1436". */
  phone: string | null;
}

/** One order in full (GET /account/orders/:id). */
export interface OrderDetail extends OrderSummary {
  subtotal: number;
  shippingFee: number;
  discount: number;
  /** Delivery company and parcel number, once the parcel has been handed over. */
  carrier: OrderCarrier | null;
  trackingNumber: string | null;
  /** Milestones reached so far, oldest first. */
  trackingEvents: OrderTrackingEvent[];
  /** Carrier updates, newest first. */
  trackingUpdates: OrderTrackingUpdate[];
  /** ISO timestamp the carrier expects to deliver by; null once delivered or when not known yet. */
  estimatedDeliveryBy: string | null;
  /** Delivery address as printed on the parcel, when the backend includes it. */
  shippingAddress: { recipientName: string; phone: string; address: string } | null;
}
