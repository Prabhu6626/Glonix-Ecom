import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import LoginPage from "./Page/LoginPage";    //./component/LoginPage/LoginPage
import HomePage from "./Page/Homepage";      //./component/Homepage/HomePage
import AboutPage from "./Page/AboutPage";    //./component/AboutPage/AboutPage
import Navbar from "./components/Navbar";
import Assembly from "./components/Assembly/Assembly";
import Myorder from "./components/Myorder";
import Fabrication from "./components/Fabrication/Fabrication";
import Product_Enquiry from "./components/Product_Enquiry/Product_Enquiry";
import Design_Enquiry from "./components/Design_Enquiry/Design_Enquiry";
import Payment from "./components/Payment/Payment";
import PaymentCallback from "./components/Payment/PaymentCallback";
import OrderSuccess from "./components/Payment/OrderSuccess";
import Status from "./components/Status/Status";
import Terms from "./components/Terms/Terms";
import Policy from "./components/Privacypolicy/Privacypolicy";
import EProduct from "./components/ECommerce/ECommerce";
import CategoryList from "./components/CategoryList/CategoryList";
import ProductDetail from "./components/Productdetails/Productdetails";
import Addtocart from "./components/Addtocart/Addtocart";
import Epayment from "./components/Epayment/Epayment";
import EPaymentCallback from "./components/Epayment/EPaymentCallback";
import EOrderSuccess from "./components/Epayment/EOrderSuccess";
import Addtocartpayment from "./components/Epayment/Addtocartpayment";
import AddtocartCallback from "./components/Epayment/AddtocartCallback";
import AddtocartOrderSuccess from "./components/Epayment/AddtocartOrderSuccess";

// import "./App.css";

// Wrapper for routes that need authentication
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  if (!isLoggedIn) {
    localStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );

  const handleLoginSuccess = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  return (
    <Router>
      <div>
        {isLoggedIn && <Navbar />}
        <Routes>
          <Route
            path="/"
            element={<HomePage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />

          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/epayment/ecallback" element={<EPaymentCallback />} />
          <Route path="/addtocartpayment/addtocartcallback" element={<AddtocartCallback />} />
          <Route path="/epayment/esuccess" element={<EOrderSuccess />} />
          <Route path="/payment/success" element={<OrderSuccess />} />
          <Route path="/addtocartpayment/addtocartsuccess" element={<AddtocartCallback />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/Myorder"
            element={
              <PrivateRoute>
                <Myorder />
              </PrivateRoute>
            }
          />
          <Route
            path="/productenquiry"
            element={
              <PrivateRoute>
                <Product_Enquiry />
              </PrivateRoute>
            }
          />
          <Route
            path="/designenquiry"
            element={
              <PrivateRoute>
                <Design_Enquiry />
              </PrivateRoute>
            }
          />
          <Route path="/policy" element={<Policy />} />
          <Route path="/terms" element={<Terms />} />
          <Route
            path="/fabrication"
            element={
              <PrivateRoute>
                <Fabrication />
              </PrivateRoute>
            }
          />
          <Route
            path="/assembly"
            element={
              <PrivateRoute>
                <Assembly />
              </PrivateRoute>
            }
          />
          <Route
            path="/product"
            element={
              <PrivateRoute>
                <EProduct />
              </PrivateRoute>
            }
          />
          <Route path="/payment"  element={<PrivateRoute> <Payment /> </PrivateRoute>}
          />
          <Route path="/epayment"  element={<PrivateRoute> <Epayment /> </PrivateRoute>}
          />
          <Route path="/addtocart"  element={<PrivateRoute> <Addtocart /> </PrivateRoute>}
          />
          <Route path="/addtocartpayment"  element={<PrivateRoute> <Addtocartpayment /> </PrivateRoute>}
          />
          <Route path="/order/:order_id" element={<Status />} />
          <Route path="/category/:categoryName" element={<CategoryList />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
