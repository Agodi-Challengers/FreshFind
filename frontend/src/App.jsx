import { useEffect, useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext.jsx';
import { ClockProvider } from './context/ClockContext.jsx';
import { LocationProvider } from './context/LocationContext.jsx';
import { BookmarksProvider } from './context/BookmarksContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import UtilityBar from './components/UtilityBar.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import BottomTabBar from './components/BottomTabBar.jsx';
import { getVisitorCount } from './lib/visitors.js';
import NotFoundPage from './pages/NotFoundPage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

/** Page chrome shared by every route except login / sign up. */
function SiteLayout() {
  const [visitors] = useState(getVisitorCount);
  return (
    <>
      <a href="#main" className="ff-skip-link">
        Skip to content
      </a>
      <UtilityBar visitors={visitors} />
      <SiteHeader />
      <main id="main" className="ff-main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter visitors={visitors} />
      <BottomTabBar />
    </>
  );
}

function AppRoutes() {
  const { ready, error } = useData();
  if (error) {
    return (
      <div className="ff-loading" role="alert">
        Sorry, market data could not be loaded. Please refresh the page.
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="ff-loading" role="status">
        Loading markets…
      </div>
    );
  }
  return (
    <LocationProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </LocationProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <DataProvider>
          <ClockProvider>
            <BookmarksProvider>
              <AppRoutes />
            </BookmarksProvider>
          </ClockProvider>
        </DataProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
