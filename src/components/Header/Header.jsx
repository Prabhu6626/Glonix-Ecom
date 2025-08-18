// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Logo from "../../assets/logo.png";

// const Header = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [username, setUsername] = useState("");
//   const [cartItemCount, setCartItemCount] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [enquiryOpen, setEnquiryOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const navigate = useNavigate();

//   const handleNavigation = (item) => {
//     if (item === "Enquiry") {
//       setEnquiryOpen((prev) => !prev);
//       return;
//     }
//     if (item === "Home") {
//       navigate("/");
//     } else {
//       navigate(`/${item.toLowerCase()}`);
//     }
//     setMobileMenuOpen(false);
//   };

//   useEffect(() => {
//     const storedCart = localStorage.getItem("cart");
//     if (storedCart) {
//       try {
//         const parsedCart = JSON.parse(storedCart);
//         setCartItemCount(parsedCart.length);
//       } catch (err) {
//         console.error("Failed to parse cart data:", err);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const storedUsername = localStorage.getItem("username");
//     setIsAuthenticated(!!token);
//     setUsername(storedUsername || "");
//   }, []);

//   const handleLogout = useCallback(async () => {
//     try {
//       const response = await fetch(
//         `https://glonix-service-backend.vercel.app/logout/${username}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (response.ok) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("username");
//         setIsAuthenticated(false);
//         setUsername("");
//         alert("You have been logged out!");
//         navigate("/login", { replace: true });
//       } else {
//         const errorData = await response.json();
//         console.error("Logout failed:", errorData);
//         alert("Logout failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error during logout:", error);
//       alert("An error occurred during logout.");
//     }
//   }, [username, navigate]);

//   const handleClick = useCallback(
//     (event) => {
//       event.preventDefault();
//       if (isAuthenticated) {
//         handleLogout();
//       } else {
//         navigate("/login");
//       }
//     },
//     [isAuthenticated, handleLogout, navigate]
//   );

//   const handleRedirect = () => {
//     navigate("/addtocart");
//   };

//   useEffect(() => {
//     axios
//       .get("https://glonixecombackend.vercel.app/products")
//       .then((res) => setProducts(res.data))
//       .catch((err) => console.error("Error fetching products:", err));
//   }, []);

//   const handleSearchChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);

//     const filtered = products.filter(
//       (item) =>
//         item.product_name.toLowerCase().includes(query) ||
//         item.sku_number.toLowerCase().includes(query)
//     );
//     setSearchResults(filtered);
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (searchResults.length > 0) {
//       navigate(`/product/${searchResults[0].sku_number}`);
//     }
//   };

//   const navItems = [
//     "Home",
//     "Fabrication",
//     "Assembly",
//     "Product",
//     "Enquiry",
//     "About",
//   ];

//   return (
//     <header className="bg-white shadow-md">
//       {/* Top bar */}
//       <div className="bg-gray-800 text-white py-2 px-4">
//         <div className="container mx-auto flex justify-between items-center">
//           <div className="flex items-center space-x-2">
//             <span>📞</span>
//             <span className="text-sm">78068 32035 | Customer Support</span>
//           </div>
//           <div className="flex items-center space-x-4 text-sm">
//             <a href="/Myorder" className="hover:text-gray-300 transition">
//               My Order
//             </a>
//             <span>|</span>
//             <button 
//               onClick={handleClick}
//               className="hover:text-gray-300 transition"
//             >
//               {isAuthenticated ? `Logout (${username})` : "Login"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Middle bar */}
//       <div className="container mx-auto py-4 px-4 flex items-center justify-between">
//         <div className="flex items-center">
//           <img src={Logo} alt="Logo" className="h-12" />
//         </div>

//         <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-4">
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <svg
//                 className="h-5 w-5 text-gray-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </div>
//             <input
//               type="text"
//               placeholder="Search..."
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               value={searchQuery}
//               onChange={handleSearchChange}
//             />
//           </div>
//         </form>

//         <div className="flex items-center space-x-6">
//           <button className="text-gray-700 hover:text-blue-600">
//             <svg
//               className="h-6 w-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
//               />
//             </svg>
//           </button>
//           <button 
//             onClick={handleRedirect}
//             className="relative text-gray-700 hover:text-blue-600"
//           >
//             <svg
//               className="h-6 w-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
//               />
//             </svg>
//             {cartItemCount > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                 {cartItemCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="border-t border-gray-200">
//         <div className="container mx-auto px-4">
//           {/* Mobile menu button */}
//           <div className="md:hidden flex justify-between items-center py-2">
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="text-gray-700 hover:text-blue-600"
//             >
//               <svg
//                 className="h-6 w-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M4 6h16M4 12h16M4 18h16"
//                 />
//               </svg>
//             </button>
//           </div>

//           {/* Desktop navigation */}
//           <nav className="hidden md:flex justify-center space-x-8 py-2">
//             {navItems.map((item, index) => (
//               <div key={index} className="relative group">
//                 <button
//                   onClick={() => handleNavigation(item)}
//                   className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center"
//                 >
//                   {item}
//                   {item === "Enquiry" && (
//                     <svg
//                       className="ml-1 h-4 w-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M19 9l-7 7-7-7"
//                       />
//                     </svg>
//                   )}
//                 </button>

//                 {item === "Enquiry" && (
//                   <div className="absolute z-10 left-0 mt-0 w-48 bg-white shadow-lg rounded-md py-1 hidden group-hover:block">
//                     <button
//                       onClick={() => navigate("/productenquiry")}
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                     >
//                       Product Enquiry
//                     </button>
//                     <button
//                       onClick={() => navigate("/designenquiry")}
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                     >
//                       Design Enquiry
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </nav>
//         </div>

//         {/* Mobile menu */}
//         {mobileMenuOpen && (
//           <div className="md:hidden bg-white shadow-lg rounded-lg mx-4 my-2">
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               {navItems.map((item, index) => (
//                 <div key={index}>
//                   <button
//                     onClick={() => handleNavigation(item)}
//                     className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex justify-between items-center"
//                   >
//                     {item}
//                     {item === "Enquiry" && (
//                       <svg
//                         className="h-5 w-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M19 9l-7 7-7-7"
//                         />
//                       </svg>
//                     )}
//                   </button>

//                   {item === "Enquiry" && enquiryOpen && (
//                     <div className="pl-4">
//                       <button
//                         onClick={() => {
//                           setMobileMenuOpen(false);
//                           navigate("/productenquiry");
//                         }}
//                         className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50 w-full text-left"
//                       >
//                         Product Enquiry
//                       </button>
//                       <button
//                         onClick={() => {
//                           setMobileMenuOpen(false);
//                           navigate("/designenquiry");
//                         }}
//                         className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50 w-full text-left"
//                       >
//                         Design Enquiry
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Under development banner */}
//       <div className="bg-yellow-400 text-black text-center py-1 text-sm font-bold">
//         UNDER DEVELOPMENT
//       </div>
//     </header>
//   );
// };

// export default Header;
