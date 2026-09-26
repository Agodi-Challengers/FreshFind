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

import ChatLauncher from "./components/ChatLauncher.jsx";
import ChatWidget from "./components/chat/ChatWidget.jsx";
import CtaBanner from "./components/CtaBanner.jsx";
import { getVisitorCount } from "./lib/visitors.js";
import HomePage from "./pages/HomePage.jsx";
import FindMarketPage from "./pages/FindMarketPage.jsx";
import DirectoryPage from "./pages/DirectoryPage.jsx";
import MarketDetailPage from "./pages/MarketDetailPage.jsx";
import ProduceGuidePage from "./pages/ProduceGuidePage.jsx";
import ProduceDetailPage from "./pages/ProduceDetailPage.jsx";
import SeasonalPage from "./pages/SeasonalPage.jsx";
import BookmarksPage from "./pages/BookmarksPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}


function SiteLayout() {
  const [visitors] = useState(getVisitorCount);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <UtilityBar visitors={visitors} />
      <SiteHeader />
      <main id="main" className="main" tabIndex={-1}>
        <Outlet />
      </main>
      <CtaBanner />
      <SiteFooter visitors={visitors} />
      <ChatLauncher />
    </>
  );
}

function AppRoutes() {
  const { ready, error } = useData();
  if (error) {
    return (
      <div className="loading" role="alert">
        Sorry, market data could not be loaded. Please refresh the page.
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="loading" role="status">
        Loading markets…
      </div>
    );
  }
  return (
    <LocationProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="find" element={<FindMarketPage />} />
          <Route path="directory" element={<DirectoryPage />} />
          <Route path="markets/:id" element={<MarketDetailPage />} />
          <Route path="produce" element={<ProduceGuidePage />} />
          <Route path="produce/:id" element={<ProduceDetailPage />} />
          <Route path="seasonal" element={<SeasonalPage />} />
          <Route path="saved" element={<BookmarksPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="signup" element={<AuthPage mode="signup" />} />
      </Routes>
    </LocationProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        {/* Live chat (Tawk.to). Loads once for the whole site, only if switched on in .env. */}
        <ChatWidget />
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
