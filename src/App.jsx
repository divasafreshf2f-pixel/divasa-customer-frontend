import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import SavedAddresses from "./pages/SavedAddresses";
import Favourites from "./pages/Favourites";
import LoyaltyCards from "./pages/LoyaltyCards"; // 1. Added this import
import OrderSuccess from "./pages/OrderSuccess";
import FAQs from "./pages/FAQs";
import AccountPrivacy from "./pages/AccountPrivacy";
import About from "./pages/AboutUs";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import MissionPage from "./pages/MissionPage";
import Vision2030 from "./pages/Vision2030";
import ContactPage from "./pages/Contact";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DeliveryAreas from "./pages/DeliveryAreas";
import { useState, useEffect } from "react";
import MySubscriptions from "./pages/MySubscriptions";

import SubscriptionPage from "./pages/SubscriptionPage";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import BulkOrder from "./pages/BulkOrder";
import BulkOrders from "./pages/BulkOrders";




export default function App() {
  

  



  return (
    <BrowserRouter>

   

     











    
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/saved-addresses" element={<SavedAddresses />} />
        <Route path="/my-favourites" element={<Favourites />} />
        <Route path="/loyalty-cards" element={<LoyaltyCards />} /> {/* 2. Added this route */}
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/account-privacy" element={<AccountPrivacy />} />
        <Route path="/about" element={<About />} />
                <Route path="/mission" element={<MissionPage />} />
                <Route path="/vision" element={<Vision2030 />} />
               <Route path="/contact" element={<ContactPage />} />
               <Route path="/terms" element={<Terms />} />
               <Route path="/privacy" element={<PrivacyPolicy />} />
               <Route path="/delivery-areas" element={<DeliveryAreas />} />
                <Route path="/subscribe" element={<SubscriptionPage />} />
                <Route path="/bulk-order" element={<BulkOrder />} />
                <Route path="/my-bulk-orders" element={<BulkOrders />} />
               <Route path="/my-subscriptions" element={<MySubscriptions />} />
               <Route path="/refund-policy" element={<RefundPolicy />} />
<Route path="/shipping-policy" element={<ShippingPolicy />} />
               <Route path="*" element={<Home />} />
               
             




   

      </Routes>

        <Footer />


    </BrowserRouter>
  );
}
