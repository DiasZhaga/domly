// src/App.js
import React, { useState, useEffect } from "react";  
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WOW from "wowjs";
import 'animate.css/animate.min.css';

import { AuthProvider } from "./components/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Spinner from "./components/Spinner";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import BuyProperty from "./pages/BuyProperty";
import PropertyDetails from "./pages/PropertyDetails";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import AddProperty from "./pages/AddProperty";
import MyAds from "./pages/MyAds";  
import Messages from "./pages/Messages";
import EditAdPage from "./pages/EditAd";
import EditPhotosPage from "./pages/EditPhotosPage";
import AccountPayments from "./pages/AccountPayments";
import PurchaseConfirmation from "./pages/PurchaseConfirmation";

const App = () => {
  const [loading, setLoading]   = useState(true);
  const [showButton, setShowButton] = useState(false);

  // simulate initial spinner
  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  // wow.js init
  useEffect(() => {
    new WOW.WOW().init();
  }, []);

  // scroll-to-top button visibility
  useEffect(() => {
    const onScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (loading) return <Spinner />;

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />

        {/* Navbar now sees auth state and will swap "Sign in" → user-menu */}
        <Navbar />

        <Routes>
          <Route path="/"                   element={<Home />} />
          <Route path="/buy-property"       element={<BuyProperty />} />
          <Route path="/property-details/:id"
                                             element={<PropertyDetails />} />
          <Route path="/subscribe"          element={<SubscriptionPlans />} />
          <Route path="/sell-property"      element={<AddProperty />} />
          <Route path="/my-ads"             element={<MyAds />} />
          <Route path="/edit-ad/:id"  element={<EditAdPage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/edit-photos/:id" element={<EditPhotosPage />} />
          <Route path="/account-payments" element={<AccountPayments />} />
          <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
          {/* TODO: edit-ad and 404 routes */}
        </Routes>

        {showButton && (
          <button
            className="btn btn-lg btn-primary btn-lg-square back-to-top"
            onClick={scrollToTop}
          >
            <i className="bi bi-arrow-up"></i>
          </button>
        )}
      </Router>
    </AuthProvider>
  );
};

export default App;
