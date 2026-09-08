import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { store } from './app/store';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CpuCategoryPage } from './pages/CpuCategoryPage';
import { GpuCategoryPage } from './pages/GpuCategoryPage';
import { MotherboardCategoryPage } from './pages/MotherboardCategoryPage';
import { RamCategoryPage } from './pages/RamCategoryPage';
import { StorageCategoryPage } from './pages/StorageCategoryPage';
import { PsuCategoryPage } from './pages/PsuCategoryPage';
import { CaseCategoryPage } from './pages/CaseCategoryPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/cpu" element={<CpuCategoryPage />} />
            <Route path="/category/gpu" element={<GpuCategoryPage />} />
            <Route path="/category/motherboard" element={<MotherboardCategoryPage />} />
            <Route path="/category/ram" element={<RamCategoryPage />} />
            <Route path="/category/storage" element={<StorageCategoryPage />} />
            <Route path="/category/psu" element={<PsuCategoryPage />} />
            <Route path="/category/case" element={<CaseCategoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
