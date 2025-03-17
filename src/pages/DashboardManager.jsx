import React, { useEffect, useState } from "react";
import { useAuth } from "../configs/AuthContext.jsx";
import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";
// import fetchProducts from '@/configs/InventoryContext';

const DashboardManager = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
    };
    getProducts();
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/login", label: "Login" },
  ].filter(Boolean);

  return (
    <>
      <Header navLinks={navLinks} />
      <h1>
        Welcome Manager,{" "}
        {userData?.firstName + " " + userData?.lastName ||
          user?.displayName ||
          "Loading..."}
      </h1>
      <p>Email: {user?.email}</p>
      <button onClick={handleLogout}>Log Out</button>

      <div className="grid grid-cols-3 gap-4 p-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-2">{product.Name}</h2>
            <div className="flex space-x-2 mb-2">
              {product.Photos.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={product.Name}
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>
            <p className="text-gray-600 mb-2">{product.Description}</p>
            <p className="text-green-600 font-bold">£{product.Price}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardManager;
