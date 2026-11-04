import type { SavedAddress } from '../../types/api';

type AddressParts = Pick<SavedAddress, 'addressLine' | 'subdistrict' | 'district' | 'province' | 'postalCode'>;

/** "36/134 ซอย 4/13 ต.บางพูด อ.ปากเกร็ด จ.นนทบุรี 11120" — Bangkok uses แขวง/เขต instead of ต./อ./จ. */
export function formatAddress(address: AddressParts): string {
  const isBangkok = address.province === 'กรุงเทพมหานคร';
  return [
    address.addressLine,
    isBangkok ? `แขวง${address.subdistrict}` : `ต.${address.subdistrict}`,
    isBangkok ? `เขต${address.district}` : `อ.${address.district}`,
    isBangkok ? address.province : `จ.${address.province}`,
    address.postalCode,
  ].join(' ');
}

/** 0943808038 -> 094-380-8038 (mobile) / 021234567 -> 02-123-4567 (landline). */
export function formatPhone(phone: string): string {
  if (/^0\d{9}$/.test(phone)) return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  if (/^0\d{8}$/.test(phone)) return `${phone.slice(0, 2)}-${phone.slice(2, 5)}-${phone.slice(5)}`;
  return phone;
}
