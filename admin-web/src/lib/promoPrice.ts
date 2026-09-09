// Backend has no `promoEnabled` field — a promo is just a non-null `promoPrice`
// on Product (see Backend-web prisma schema.prisma Product.promoPrice). These
// convert between that and the frontend forms' explicit toggle + number pair.
export function toPromoEnabled(promoPrice: number | null | undefined): boolean {
  return promoPrice != null
}

export function toPromoPriceField(promoEnabled: boolean, promoPrice: number): number | null {
  return promoEnabled ? promoPrice : null
}
