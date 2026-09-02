import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { errorMiddleware } from './middleware/errorMiddleware'
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

app.use('/api/cpus', cpuRouter)
app.use('/api/gpus', gpuRouter)
app.use('/api/motherboards', motherboardRouter)
app.use('/api/rams', ramRouter)
app.use('/api/storages', storageRouter)
app.use('/api/cases', caseRouter)
app.use('/api/psus', psuRouter)
app.use('/api/coolings', coolingRouter)
app.use('/api/desktop-pcs', desktopPcRouter)
app.use('/api/promo-sets', promoSetRouter)
app.use('/api/customers', customerRouter)
app.use('/api/orders', orderRouter)
app.use('/api/custom-builds', customBuildRouter)
app.use('/api/banners', bannerRouter)
app.use('/api/admins', adminRouter)
app.use('/api/auth', authRouter)

app.use(errorMiddleware)

const PORT = process.env.PORT ?? 4000
app.listen(PORT, () => console.log(`Backend-web listening on port ${PORT}`))
