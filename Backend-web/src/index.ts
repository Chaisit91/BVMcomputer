import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { authMiddleware } from './middleware/authMiddleware'
import { errorMiddleware } from './middleware/errorMiddleware'
import { requireRole } from './middleware/roleMiddleware'
import { adminRouter } from './modules/admin/admin.router'
import { authRouter } from './modules/auth/auth.router'
import { bannerRouter } from './modules/banner/banner.router'
import { caseRouter } from './modules/case/case.router'
import { coolingRouter } from './modules/cooling/cooling.router'
import { customBuildRouter } from './modules/custom-build/custom-build.router'
import { customerRouter } from './modules/customer/customer.router'
import { desktopPcRouter } from './modules/desktop-pc/desktop-pc.router'
import { gpuRouter } from './modules/gpu/gpu.router'
import { motherboardRouter } from './modules/motherboard/motherboard.router'
import { orderRouter } from './modules/order/order.router'
import { promoSetRouter } from './modules/promo-set/promo-set.router'
import { psuRouter } from './modules/psu/psu.router'
import { ramRouter } from './modules/ram/ram.router'
import { storageRouter } from './modules/storage/storage.router'
import { cpuRouter } from './modules/cpu/cpu.router'

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN ?? '').split(',').map((origin) => origin.trim()).filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // no Origin header (curl, server-to-server) -> allow; browser requests always send one
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

// Single source of truth for who can touch what — mirrors
// admin-web/src/lib/permissions.ts's sectionPrefixes exactly, so the two
// never drift apart. super_admin passes every requireRole check regardless
// of which role is named (see roleMiddleware.ts).
const inventory = [authMiddleware, requireRole('inventory_manager')] as const
const sales = [authMiddleware, requireRole('sales_staff')] as const
const content = [authMiddleware, requireRole('content_moderator')] as const
const admin = [authMiddleware, requireRole('super_admin')] as const

app.use('/api/cpus', ...inventory, cpuRouter)
app.use('/api/gpus', ...inventory, gpuRouter)
app.use('/api/motherboards', ...inventory, motherboardRouter)
app.use('/api/rams', ...inventory, ramRouter)
app.use('/api/storages', ...inventory, storageRouter)
app.use('/api/cases', ...inventory, caseRouter)
app.use('/api/psus', ...inventory, psuRouter)
app.use('/api/coolings', ...inventory, coolingRouter)
app.use('/api/desktop-pcs', ...inventory, desktopPcRouter)
app.use('/api/promo-sets', ...inventory, promoSetRouter)
app.use('/api/custom-builds', ...inventory, customBuildRouter)
app.use('/api/customers', ...sales, customerRouter)
app.use('/api/orders', ...sales, orderRouter)
app.use('/api/banners', ...content, bannerRouter)
app.use('/api/admins', ...admin, adminRouter)
app.use('/api/auth', authRouter)

app.use(errorMiddleware)

const PORT = process.env.PORT ?? 4000
app.listen(PORT, () => console.log(`Backend-web listening on port ${PORT}`))
