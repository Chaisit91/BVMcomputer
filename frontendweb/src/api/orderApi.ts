import { apiPost, mockDelay, withMockFallback } from './request';
import type { CouponValidationResponse, CreateOrderRequest, CreateOrderResponse } from '../types/api';

// Mock-only numbers — the backend owns real shipping fees and coupon rules.
const MOCK_SHIPPING_FEE = { standard: 0, express: 50 } as const;
const MOCK_COD_FEE = 50;
const MOCK_COUPON_DISCOUNT = 100;

/** POST /orders — the backend recalculates the total and returns the final amount. */
export function createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  return withMockFallback(
    'POST /orders',
    () => apiPost<CreateOrderResponse>('/orders', request),
    async () => {
      await mockDelay(800);
      const subtotal = request.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const fees = MOCK_SHIPPING_FEE[request.shippingMethod] + (request.paymentMethod === 'cod' ? MOCK_COD_FEE : 0);
      const discount = request.couponCode ? Math.min(MOCK_COUPON_DISCOUNT, subtotal) : 0;
      return {
        orderId: `BVM-${Date.now().toString().slice(-8)}`,
        status: 'pending',
        total: subtotal + fees - discount,
      };
    },
  );
}

/** POST /coupons/validate — whether a code applies to this subtotal, and how much it takes off. */
export function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResponse> {
  return withMockFallback(
    'POST /coupons/validate',
    () => apiPost<CouponValidationResponse>('/coupons/validate', { code, subtotal }),
    async () => {
      await mockDelay();
      return { valid: true, discount: Math.min(MOCK_COUPON_DISCOUNT, subtotal) };
    },
  );
}
