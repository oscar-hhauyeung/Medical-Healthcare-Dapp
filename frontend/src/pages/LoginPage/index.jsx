import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NETS from "vanta/src/vanta.net";
import * as THREE from "three";
import Cookies from "universal-cookie";
import "./LoginPage.css";

function LoginPage() {
  const apiUrl = process.env.API_URL || "http://localhost:8080";
  useEffect(() => {
    console.log("API URL:", apiUrl);
    NETS({
      el: "#background",
      THREE: THREE,
      backgroundColor: 0x0,
    });
  }, [apiUrl]);

  const navigate = useNavigate();
  const cookies = new Cookies();
  const [walletAddress, setWalletAddress] = useState("");
  const handleConnectMetaMask = async () => {
    if (walletAddress) {
      setError("You have already connected your wallet address");
      return;
    }
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error) {
        setError("MetaMask connection failed");
      }
    } else {
      setError("MetaMask not detected");
    }
  };

  const [userType, setUserType] = useState("patient");
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    let emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }

    fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userType, email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          cookies.set("auth", data.accessToken, { path: "/" });
          navigate(`${userType}`);
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div
      className="bg-gray-200 min-h-screen flex justify-center items-center background-container"
      id="background"
    >
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
        <div className="text-center">
          {/* <img src={logo} alt="Logo" className="mx-auto w-20 mb-4" /> */}
          <h1 className="text-2xl font-bold mb-4">Login</h1>
        </div>
        <form onSubmit={handleLogin} autoComplete="on">
          <div className="mb-4">
            <label
              htmlFor="userType"
              className="block text-sm font-medium text-gray-700"
            >
              User Type:
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              placeholder="Type your email"
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              placeholder="Type your password"
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4 flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate(`/register/${userType}`)}
              className="text-blue-500 hover:underline"
            >
              Register
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleConnectMetaMask}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Connect With MetaMask
          </button>
          <p className="text-sm text-gray-600 mt-2">
            <a
              href="your-password-reset-url"
              className="text-blue-500 hover:underline"
            >
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
