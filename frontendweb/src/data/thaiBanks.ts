/**
 * Card-issuing banks in Thailand, for the "ธนาคารผู้ออกบัตร" field. Once a payment gateway is connected,
 * the issuer should come from the gateway's card token (BIN lookup) instead of being picked by hand.
 */
export const thaiCardIssuers = [
  'ธนาคารกรุงเทพ (Bangkok Bank)',
  'ธนาคารกสิกรไทย (Kasikornbank)',
  'ธนาคารกรุงไทย (Krungthai Bank)',
  'ธนาคารไทยพาณิชย์ (Siam Commercial Bank)',
  'ธนาคารกรุงศรีอยุธยา (Krungsri)',
  'ธนาคารทหารไทยธนชาต (ttb)',
  'ธนาคารยูโอบี (UOB)',
  'ธนาคารซีไอเอ็มบี ไทย (CIMB Thai)',
  'ธนาคารเกียรตินาคินภัทร (KKP)',
  'ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)',
  'ธนาคารออมสิน (Government Savings Bank)',
  'ธนาคารอาคารสงเคราะห์ (GH Bank)',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)',
] as const;

/** Select value meaning "not in the list" — the form then asks for the bank name as text. */
export const OTHER_BANK = 'other';
