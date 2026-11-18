/** Empty-state art for the checkout's address cards — simple flat shapes in the site's red / slate palette. */

export function MapPinIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      {/* clouds */}
      <ellipse cx="38" cy="58" rx="22" ry="9" fill="#EEF2F7" />
      <ellipse cx="166" cy="36" rx="16" ry="7" fill="#EEF2F7" />
      {/* folded map, seen at an angle */}
      <path d="M44 84 L82 70 L118 84 L156 70 L162 100 L124 114 L88 100 L50 114 Z" fill="#E2E8F0" />
      <path d="M82 70 L88 100 L50 114 L44 84 Z" fill="#CBD5E1" />
      <path d="M118 84 L124 114 L162 100 L156 70 Z" fill="#CBD5E1" />
      <path d="M58 92 L76 86 M96 92 L112 98 M132 90 L150 84" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
      {/* pin */}
      <ellipse cx="102" cy="86" rx="10" ry="3.5" fill="#0B1220" opacity="0.12" />
      <path d="M102 84 C92 70 82 60 82 46 A20 20 0 0 1 122 46 C122 60 112 70 102 84 Z" fill="#E2001A" />
      <circle cx="102" cy="45" r="7.5" fill="#fff" />
    </svg>
  );
}

export function TaxDocumentIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      {/* soft red blob behind */}
      <ellipse cx="100" cy="66" rx="70" ry="40" fill="#FDECEE" />
      <circle cx="34" cy="96" r="5" fill="#FDECEE" />
      <circle cx="170" cy="34" r="4" fill="#FDECEE" />
      {/* document with a folded corner */}
      <path d="M68 16 H122 L138 32 V108 H68 Z" fill="#fff" stroke="#E2E8F0" strokeWidth="2" />
      <path d="M122 16 V32 H138 Z" fill="#CBD5E1" />
      <rect x="76" y="26" width="30" height="13" rx="3" fill="#E2001A" />
      <text x="91" y="36" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
        TAX
      </text>
      <rect x="78" y="52" width="50" height="4" rx="2" fill="#CBD5E1" />
      <rect x="78" y="64" width="50" height="4" rx="2" fill="#CBD5E1" />
      <rect x="78" y="76" width="34" height="4" rx="2" fill="#CBD5E1" />
      <rect x="116" y="76" width="12" height="4" rx="2" fill="#CBD5E1" />
    </svg>
  );
}
