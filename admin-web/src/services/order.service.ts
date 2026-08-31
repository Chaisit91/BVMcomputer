import type { OrderFormValues } from '../schemas/order.schema'
import type { Order, OrderLineItem, OrderSummary } from '../types/order'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const orders: Order[] = [
  {
    id: '1',
    orderCode: 'ORD-9921',
    orderedAt: '24 ต.ค. 15:45',
    customerName: 'สมชาย ยอดรัก',
    customerPhone: '081-234-5678',
    shippingAddress: '123/45 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพมหานคร',
    postalCode: '10110',
    province: 'กรุงเทพมหานคร',
    district: 'บางรัก',
    subdistrict: 'สีลม',
    paymentMethod: 'โอนเงิน',
    paymentStatus: 'paid',
    status: 'preparing',
    trackingNumber: '',
    shippingNote: 'ต้องการให้จัดส่งช่วงบ่าย และบรรจุหีบห่อกันกระแทกอย่างหนาแน่นเนื่องจากมีชิ้นส่วนกระจกบนเคสคอมพิวเตอร์',
    paymentSlipFilename: 'slip_transfer_ORD-9921.jpg',
    paymentSlipUploadedAt: '24 ต.ค. 2023, 15:30',
    items: [
      { name: 'Intel Core i5-13400F 2.5 GHz 10C/16T', category: 'CPU (ซีพียู)', quantity: 1, unitPrice: 7150 },
      { name: 'ASUS Dual GeForce RTX 4060 Ti OC Edition 8GB GDDR6', category: 'GPU (การ์ดจอ)', quantity: 1, unitPrice: 16500 },
      { name: 'Kingston FURY Beast DDR5 32GB (2x16GB) 5600MHz CL40', category: 'RAM (แรม)', quantity: 2, unitPrice: 4400 },
    ],
  },
  {
    id: '2',
    orderCode: 'ORD-9920',
    orderedAt: '24 ต.ค. 14:10',
    customerName: 'กมลวรรณ สิงห์โต',
    customerPhone: '089-123-4567',
    shippingAddress: '88 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร',
    postalCode: '10310',
    province: 'กรุงเทพมหานคร',
    district: 'ห้วยขวาง',
    subdistrict: 'ห้วยขวาง',
    paymentMethod: 'บัตรเครดิต',
    paymentStatus: 'paid',
    status: 'shipping',
    trackingNumber: 'TH38291047562',
    shippingNote: '',
    paymentSlipFilename: 'slip_creditcard_ORD-9920.jpg',
    paymentSlipUploadedAt: '24 ต.ค. 2023, 14:15',
    items: [{ name: 'MSI Optix G274F 27" 165Hz Gaming Monitor', category: 'จอมอนิเตอร์', quantity: 1, unitPrice: 12800 }],
  },
  {
    id: '3',
    orderCode: 'ORD-9919',
    orderedAt: '24 ต.ค. 12:30',
    customerName: 'พงษ์ศักดิ์ แซ่ตั้ง',
    customerPhone: '062-555-1234',
    shippingAddress: '210 ถนนลาดพร้าว แขวงจันทรเกษม เขตจตุจักร กรุงเทพมหานคร',
    postalCode: '10900',
    province: 'กรุงเทพมหานคร',
    district: 'จตุจักร',
    subdistrict: 'จันทรเกษม',
    paymentMethod: 'พร้อมเพย์',
    paymentStatus: 'paid',
    status: 'completed',
    trackingNumber: 'TH38291047230',
    shippingNote: '',
    paymentSlipFilename: 'slip_promptpay_ORD-9919.jpg',
    paymentSlipUploadedAt: '24 ต.ค. 2023, 12:35',
    items: [
      { name: 'ASUS ROG STRIX Z790-E Gaming WIFI', category: 'เมนบอร์ด', quantity: 1, unitPrice: 18900 },
      { name: 'Intel Core i7-14700K', category: 'CPU (ซีพียู)', quantity: 1, unitPrice: 14900 },
      { name: 'GIGABYTE RTX 4070 Ti Super Gaming OC 16GB', category: 'GPU (การ์ดจอ)', quantity: 1, unitPrice: 34900 },
      { name: 'Corsair Vengeance DDR5 32GB 6000MHz', category: 'RAM (แรม)', quantity: 1, unitPrice: 4900 },
      { name: 'Samsung 990 PRO NVMe SSD 2TB', category: 'อุปกรณ์จัดเก็บข้อมูล', quantity: 1, unitPrice: 11300 },
    ],
  },
  {
    id: '4',
    orderCode: 'ORD-9918',
    orderedAt: '24 ต.ค. 11:15',
    customerName: 'อัญชลี รัตนโกสินทร์',
    customerPhone: '095-777-8899',
    shippingAddress: '15 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพมหานคร',
    postalCode: '10400',
    province: 'กรุงเทพมหานคร',
    district: 'ดินแดง',
    subdistrict: 'ดินแดง',
    paymentMethod: 'โอนเงิน',
    paymentStatus: 'unpaid',
    status: 'pending_payment',
    trackingNumber: '',
    shippingNote: '',
    paymentSlipFilename: '',
    paymentSlipUploadedAt: '',
    items: [
      { name: 'เมาส์เกมมิ่งไร้สาย', category: 'อุปกรณ์เสริม', quantity: 1, unitPrice: 2000 },
      { name: 'แผ่นรองเมาส์ขนาดใหญ่', category: 'อุปกรณ์เสริม', quantity: 1, unitPrice: 2500 },
    ],
  },
  {
    id: '5',
    orderCode: 'ORD-9917',
    orderedAt: '23 ต.ค. 18:22',
    customerName: 'ธีรพล ประสิทธิ์ดี',
    customerPhone: '083-222-3344',
    shippingAddress: '77 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร',
    postalCode: '10110',
    province: 'กรุงเทพมหานคร',
    district: 'วัฒนา',
    subdistrict: 'คลองตันเหนือ',
    paymentMethod: 'พร้อมเพย์',
    paymentStatus: 'paid',
    status: 'completed',
    trackingNumber: 'TH38291046114',
    shippingNote: '',
    paymentSlipFilename: 'slip_promptpay_ORD-9917.jpg',
    paymentSlipUploadedAt: '23 ต.ค. 2023, 18:25',
    items: [{ name: 'คีย์บอร์ดมินิ Wireless', category: 'อุปกรณ์เสริม', quantity: 1, unitPrice: 1590 }],
  },
  {
    id: '6',
    orderCode: 'ORD-9916',
    orderedAt: '23 ต.ค. 17:05',
    customerName: 'นภาลัย สวรรค์สร้าง',
    customerPhone: '086-444-5566',
    shippingAddress: '9 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร',
    postalCode: '10900',
    province: 'กรุงเทพมหานคร',
    district: 'จตุจักร',
    subdistrict: 'ลาดยาว',
    paymentMethod: 'บัตรเครดิต',
    paymentStatus: 'paid',
    status: 'completed',
    trackingNumber: 'TH38291045992',
    shippingNote: '',
    paymentSlipFilename: 'slip_creditcard_ORD-9916.jpg',
    paymentSlipUploadedAt: '23 ต.ค. 2023, 17:10',
    items: [
      { name: 'จอมอนิเตอร์ 24 นิ้ว 75Hz', category: 'จอมอนิเตอร์', quantity: 1, unitPrice: 8900 },
      { name: 'เก้าอี้เกมมิ่ง', category: 'เฟอร์นิเจอร์', quantity: 1, unitPrice: 16000 },
    ],
  },
  {
    id: '7',
    orderCode: 'ORD-9915',
    orderedAt: '23 ต.ค. 15:40',
    customerName: 'เกรียงศักดิ์ มีชัย',
    customerPhone: '081-999-1122',
    shippingAddress: '33 ถนนพหลโยธิน แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร',
    postalCode: '10900',
    province: 'กรุงเทพมหานคร',
    district: 'จตุจักร',
    subdistrict: 'จอมพล',
    paymentMethod: 'โอนเงิน',
    paymentStatus: 'unpaid',
    status: 'cancelled',
    trackingNumber: '',
    shippingNote: 'ลูกค้าขอยกเลิกคำสั่งซื้อเนื่องจากเปลี่ยนใจ',
    paymentSlipFilename: '',
    paymentSlipUploadedAt: '',
    items: [
      { name: 'พาวเวอร์ซัพพลาย 750W 80+ Gold', category: 'พาวเวอร์ซัพพลาย', quantity: 1, unitPrice: 3890 },
      { name: 'เคสคอมพิวเตอร์ ATX Mid Tower', category: 'เคส', quantity: 1, unitPrice: 4990 },
      { name: 'ชุดระบายความร้อน CPU AIO 240mm', category: 'ชุดระบายความร้อน', quantity: 1, unitPrice: 6590 },
      { name: 'เมนบอร์ด B760 Micro-ATX', category: 'เมนบอร์ด', quantity: 1, unitPrice: 15730 },
    ],
  },
  {
    id: '8',
    orderCode: 'ORD-9914',
    orderedAt: '23 ต.ค. 14:12',
    customerName: 'จิราภรณ์ สุขสวัสดิ์',
    customerPhone: '092-333-4455',
    shippingAddress: '5 ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพมหานคร',
    postalCode: '10310',
    province: 'กรุงเทพมหานคร',
    district: 'ห้วยขวาง',
    subdistrict: 'บางกะปิ',
    paymentMethod: 'โอนเงิน',
    paymentStatus: 'paid',
    status: 'paid',
    trackingNumber: '',
    shippingNote: '',
    paymentSlipFilename: 'slip_transfer_ORD-9914.jpg',
    paymentSlipUploadedAt: '23 ต.ค. 2023, 14:18',
    items: [
      { name: 'เมาส์ไร้สาย', category: 'อุปกรณ์เสริม', quantity: 1, unitPrice: 1500 },
      { name: 'คีย์บอร์ด Mechanical', category: 'อุปกรณ์เสริม', quantity: 1, unitPrice: 2200 },
      { name: 'หูฟังเกมมิ่ง', category: 'อุปกรณ์เสริม', quantity: 1, unitPrice: 3500 },
    ],
  },
]

export function getOrderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export function getOrderSummary(): Promise<OrderSummary> {
  return mockDelay({
    pendingPaymentCount: 12,
    paidCount: 8,
    preparingCount: 5,
    shippingCount: 3,
    completedCount: 1847,
    cancelledCount: 23,
  })
}

export function getOrders(): Promise<Order[]> {
  return mockDelay(orders)
}

export function getOrderDetail(id: string): Promise<Order | null> {
  return mockDelay(orders.find((item) => item.id === id) ?? null)
}

export function saveOrder(_id: string, _data: OrderFormValues & { items: OrderLineItem[] }): Promise<void> {
  return mockDelay(undefined)
}
