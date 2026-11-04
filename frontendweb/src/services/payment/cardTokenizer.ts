import type { CardBrand } from '../../types/api';

/** Raw card details as typed into the form. Lives only in the form and this call — never in Redux or storage. */
export interface CardDetails {
  number: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  cvv: string;
}

/** What a payment gateway returns for a card: an opaque token plus safe display fields. */
export interface CardToken {
  token: string;
  brand: CardBrand;
  last4: string;
  holderName: string;
  expMonth: number;
  expYear: number;
}

export function detectCardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'mastercard';
  if (/^35(2[89]|[3-8]\d)/.test(digits)) return 'jcb';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
}

/** Luhn checksum — catches most mistyped card numbers before anything is sent. */
export function passesLuhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return digits.length > 0 && sum % 10 === 0;
}

/**
 * Turn card details into a gateway token. The full number and CVV go no further than this function.
 *
 * - demo (no backend): builds a local demo token from the safe fields only — nothing is charged or stored.
 * - live: must call the payment gateway's client SDK (e.g. Omise.js / Stripe.js) so card data goes straight
 *   from the browser to the gateway, never through MAXCOM's servers. Not wired up yet, so it refuses
 *   rather than sending card data anywhere.
 */
export async function tokenizeCard(card: CardDetails, { demo }: { demo: boolean }): Promise<CardToken> {
  const digits = card.number.replace(/\D/g, '');
  const safe = {
    brand: detectCardBrand(digits),
    last4: digits.slice(-4),
    holderName: card.holderName,
    expMonth: card.expMonth,
    expYear: card.expYear,
  };

  if (demo) {
    return { token: `demo_tok_${Date.now().toString(36)}`, ...safe };
  }

  // TODO(payment-gateway): replace with the gateway SDK's createToken call and return its token id.
  throw new Error('ยังไม่ได้เชื่อมต่อระบบ Payment Gateway จึงยังไม่สามารถเพิ่มบัตรได้');
}
