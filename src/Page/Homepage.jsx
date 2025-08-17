import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header"
import Footer from "../components/Footer/Footer";
import Breadcrumb from "../components/BreadCrumb/BreadCrumb";
import home1 from "../assets/Home_page/home1.jpg"
import home2 from "../assets/Home_page/home2.jpg"
import home3 from "../assets/Home_page/home3.jpg"
import home4 from "../assets/Home_page/home4.jpg"

// Replace these placeholder URLs with your actual image URLs
const images = [home1,home2,home3,home4];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const productContainerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  // Intersection Observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (productContainerRef.current) {
      observer.observe(productContainerRef.current);
    }
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleRedirect = (path) => {
    navigate(path);
  };

  const handleClick = async (event) => {
    event.preventDefault();

    if (isAuthenticated) {
      const username = localStorage.getItem("username");

      try {
        const response = await fetch(
          `https://glonix-service-backend.vercel.app/logout/${username}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          setIsAuthenticated(false);
          alert("You have been logged out!");
          navigate("/login", { replace: true });
        } else {
          const errorData = await response.json();
          console.error("Logout failed:", errorData);
          alert("Logout failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during logout:", error);
        alert("An error occurred during logout.");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <Header />
      <Breadcrumb />

      {/* Hero Carousel */}
      <div className="relative w-full overflow-hidden bg-gray-100">
        <div className="relative h-96 w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <img
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-96 object-cover object-center"
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition"
            onClick={prevSlide}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition"
            onClick={nextSlide}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Fabrication", desc: "High-quality PCB fabrication services", path: "/fabrication" },
            { name: "Assembly", desc: "Professional PCB assembly solutions", path: "/assembly" },
            { name: "Product", desc: "Complete electronic product development", path: "/product" }
          ].map((service) => (
            <div
              key={service.name}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl cursor-pointer"
              onClick={() => handleRedirect(service.path)}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                <p className="text-gray-600">{service.desc}</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Gallery */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Glonix Service Solutions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard
              image={images[0]}
              title="PCB Fabrication"
              description="Custom PCB manufacturing with quick turnaround"
              path="/fabrication"
            />
            <ServiceCard
              image={images[1]}
              title="PCB Assembly"
              description="Professional assembly services for your boards"
              path="/assembly"
            />
            <ServiceCard
              image={images[2]}
              title="Product Development"
              description="End-to-end electronic product solutions"
              path="/product"
            />
            <ServiceCard
              image={images[3]}
              title="Design Services"
              description="Expert PCB design and engineering support"
              path="/designenquiry"
            />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Get in touch with our team for a free consultation and quote.</p>
          <button 
            onClick={() => navigate('/contact')}
            className="px-8 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

const ServiceCard = ({ image, title, description, path }) => {
  const navigate = useNavigate();
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } hover:shadow-xl cursor-pointer`}
      onClick={() => navigate(path)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          <h3 className="text-white text-xl font-bold">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">{description}</p>
        <button
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(path);
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;
