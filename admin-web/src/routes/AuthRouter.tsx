import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { CaseCreatePage } from '../pages/inventory/case/CaseCreatePage'
import { CaseEditPage } from '../pages/inventory/case/CaseEditPage'
import { CaseListPage } from '../pages/inventory/case/CaseListPage'
import { CoolingCreatePage } from '../pages/inventory/cooling/CoolingCreatePage'
import { CoolingEditPage } from '../pages/inventory/cooling/CoolingEditPage'
import { CoolingListPage } from '../pages/inventory/cooling/CoolingListPage'
import { CpuCreatePage } from '../pages/inventory/cpu/CpuCreatePage'
import { CpuEditPage } from '../pages/inventory/cpu/CpuEditPage'
import { CpuListPage } from '../pages/inventory/cpu/CpuListPage'
import { CustomBuildCreatePage } from '../pages/inventory/custom-build/CustomBuildCreatePage'
import { CustomBuildEditPage } from '../pages/inventory/custom-build/CustomBuildEditPage'
import { CustomBuildPage } from '../pages/inventory/custom-build/CustomBuildPage'
import { DesktopPcCreatePage } from '../pages/inventory/desktop-pc/DesktopPcCreatePage'
import { DesktopPcEditPage } from '../pages/inventory/desktop-pc/DesktopPcEditPage'
import { DesktopPcListPage } from '../pages/inventory/desktop-pc/DesktopPcListPage'
import { GpuCreatePage } from '../pages/inventory/gpu/GpuCreatePage'
import { GpuEditPage } from '../pages/inventory/gpu/GpuEditPage'
import { GpuListPage } from '../pages/inventory/gpu/GpuListPage'
import { MotherboardCreatePage } from '../pages/inventory/motherboard/MotherboardCreatePage'
import { MotherboardEditPage } from '../pages/inventory/motherboard/MotherboardEditPage'
import { MotherboardListPage } from '../pages/inventory/motherboard/MotherboardListPage'
import { PromoSetCreatePage } from '../pages/inventory/promo-sets/PromoSetCreatePage'
import { PromoSetEditPage } from '../pages/inventory/promo-sets/PromoSetEditPage'
import { PromoSetListPage } from '../pages/inventory/promo-sets/PromoSetListPage'
import { PsuCreatePage } from '../pages/inventory/psu/PsuCreatePage'
import { PsuEditPage } from '../pages/inventory/psu/PsuEditPage'
import { PsuListPage } from '../pages/inventory/psu/PsuListPage'
import { RamCreatePage } from '../pages/inventory/ram/RamCreatePage'
import { RamEditPage } from '../pages/inventory/ram/RamEditPage'
import { RamListPage } from '../pages/inventory/ram/RamListPage'
import { StorageCreatePage } from '../pages/inventory/storage/StorageCreatePage'
import { StorageEditPage } from '../pages/inventory/storage/StorageEditPage'
import { StorageListPage } from '../pages/inventory/storage/StorageListPage'
import { LoginPage } from '../pages/login/LoginPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AuthRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory/custom-build" element={<CustomBuildPage />} />
          <Route path="/inventory/custom-build/new" element={<CustomBuildCreatePage />} />
          <Route path="/inventory/custom-build/:orderId" element={<CustomBuildEditPage readOnly />} />
          <Route path="/inventory/custom-build/:orderId/edit" element={<CustomBuildEditPage />} />
          <Route path="/inventory/promo-sets" element={<PromoSetListPage />} />
          <Route path="/inventory/promo-sets/new" element={<PromoSetCreatePage />} />
          <Route path="/inventory/promo-sets/:setId/edit" element={<PromoSetEditPage />} />
          <Route path="/inventory/desktop-pc" element={<DesktopPcListPage />} />
          <Route path="/inventory/desktop-pc/new" element={<DesktopPcCreatePage />} />
          <Route path="/inventory/desktop-pc/:productId" element={<DesktopPcEditPage readOnly />} />
          <Route path="/inventory/desktop-pc/:productId/edit" element={<DesktopPcEditPage />} />
          <Route path="/inventory/cpu" element={<CpuListPage />} />
          <Route path="/inventory/cpu/new" element={<CpuCreatePage />} />
          <Route path="/inventory/cpu/:cpuId/edit" element={<CpuEditPage />} />
          <Route path="/inventory/gpu" element={<GpuListPage />} />
          <Route path="/inventory/gpu/new" element={<GpuCreatePage />} />
          <Route path="/inventory/gpu/:gpuId" element={<GpuEditPage readOnly />} />
          <Route path="/inventory/gpu/:gpuId/edit" element={<GpuEditPage />} />
          <Route path="/inventory/motherboard" element={<MotherboardListPage />} />
          <Route path="/inventory/motherboard/new" element={<MotherboardCreatePage />} />
          <Route path="/inventory/motherboard/:motherboardId" element={<MotherboardEditPage readOnly />} />
          <Route path="/inventory/motherboard/:motherboardId/edit" element={<MotherboardEditPage />} />
          <Route path="/inventory/ram" element={<RamListPage />} />
          <Route path="/inventory/ram/new" element={<RamCreatePage />} />
          <Route path="/inventory/ram/:ramId" element={<RamEditPage readOnly />} />
          <Route path="/inventory/ram/:ramId/edit" element={<RamEditPage />} />
          <Route path="/inventory/storage" element={<StorageListPage />} />
          <Route path="/inventory/storage/new" element={<StorageCreatePage />} />
          <Route path="/inventory/storage/:storageId" element={<StorageEditPage readOnly />} />
          <Route path="/inventory/storage/:storageId/edit" element={<StorageEditPage />} />
          <Route path="/inventory/case" element={<CaseListPage />} />
          <Route path="/inventory/case/new" element={<CaseCreatePage />} />
          <Route path="/inventory/case/:caseId" element={<CaseEditPage readOnly />} />
          <Route path="/inventory/case/:caseId/edit" element={<CaseEditPage />} />
          <Route path="/inventory/psu" element={<PsuListPage />} />
          <Route path="/inventory/psu/new" element={<PsuCreatePage />} />
          <Route path="/inventory/psu/:psuId" element={<PsuEditPage readOnly />} />
          <Route path="/inventory/psu/:psuId/edit" element={<PsuEditPage />} />
          <Route path="/inventory/cooling" element={<CoolingListPage />} />
          <Route path="/inventory/cooling/new" element={<CoolingCreatePage />} />
          <Route path="/inventory/cooling/:coolingId" element={<CoolingEditPage readOnly />} />
          <Route path="/inventory/cooling/:coolingId/edit" element={<CoolingEditPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
