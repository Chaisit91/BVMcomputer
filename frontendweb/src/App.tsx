import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { store } from './app/store';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CpuCategoryPage } from './pages/CpuCategoryPage';
import { GpuCategoryPage } from './pages/GpuCategoryPage';
import { MotherboardCategoryPage } from './pages/MotherboardCategoryPage';

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
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
