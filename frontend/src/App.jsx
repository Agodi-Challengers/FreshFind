import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { DataProvider, useData } from "./context/DataContext.jsx";
import { ClockProvider } from "./context/ClockContext.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";
import { BookmarksProvider } from "./context/BookmarksContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import UtilityBar from "./components/UtilityBar.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import BottomTabBar from "./components/BottomTabBar.jsx";
import ChatLauncher from "./components/ChatLauncher.jsx";
import { getVisitorCount } from "./lib/visitors.js";
import HomePage from "./pages/HomePage.jsx";
import FindMarketPage from "./pages/FindMarketPage.jsx";
import DirectoryPage from "./pages/DirectoryPage.jsx";
import ProduceGuidePage from "./pages/ProduceGuidePage.jsx";
import ProduceDetailPage from "./pages/ProduceDetailPage.jsx";
import SeasonalPage from "./pages/SeasonalPage.jsx";
import MarketDetailPage from "./pages/MarketDetailPage.jsx";
import SavedPage from "./pages/SavedPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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
      <ChatLauncher />
    </>
  );
}

function DataError() {
  return (
    <div className="ff-loading" role="alert">
      <p>Sorry, market data could not be loaded. Please refresh the page.</p>
      <button
        type="button"
        className="ff-btn ff-btn--primary"
        style={{ marginTop: 12 }}
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  );
}

function AppRoutes() {
  const { ready, error } = useData();
  if (error) return <DataError />;
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="find" element={<FindMarketPage />} />
          <Route path="directory" element={<DirectoryPage />} />
          <Route path="produce" element={<ProduceGuidePage />} />
          <Route path="produce/:id" element={<ProduceDetailPage />} />
          <Route path="seasonal" element={<SeasonalPage />} />
          <Route path="markets/:id" element={<MarketDetailPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
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
