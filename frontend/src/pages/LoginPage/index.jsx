import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './LoginPage.css'
import logo from './photo.png'
import Cookies from "universal-cookie";

function LoginPage() {
  console.log(logo);
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
  
  // State to manage login form inputs
  const [userType, setUserType] = useState("patient"); // ["patient", "doctor"]
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Function to handle form submission
  const handleLogin = (e) => {
    e.preventDefault();
    // check if the email is valid
    let emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    // check if password is empty
    if (!password) {
      setError("Please enter a password");
      return;
    }

    // Perform API call to login the user
    fetch("http://localhost:8080/login", {
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
          // Store the JWT token in the browser's cookies
          cookies.set("auth", data.accessToken, { path: "/" });

          // Redirect the user to the home page
          navigate(`${userType}`);
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className="login-page">
      <div className="container">
      <div className="login-page-image">
        <img src = {logo} alt = "Logo"/>
        </div>
      <form onSubmit={handleLogin} autoComplete="on" className="form">
        <div className="header">Login</div>
        <div className = "form_setup">
          <label>Usertype:
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
          </label>
          <br />
          <label>
          Email:
          <input
            type="email"
            value={email}
            placeholder="Type your email" 
            onChange={(e) => setUsername(e.target.value)}
          />
          </label>
          <br />
          <label>
          Password:
          <input
            type="password"
            value={password}
            placeholder="Type your password" 
            onChange={(e) => setPassword(e.target.value)}
          />
          </label>
          <br />
          <button onClick={handleLogin}>Login</button>
          <button type="button" onClick={() => navigate(`/register/${userType}`)}>
          Register
          </button>
          <br />
          {error && <p style={{ color: "red" }}>{error}</p>}
          
          <br/>
          <button type="button" onClick={handleConnectMetaMask}>
              Connect With MetaMask</button>
          <br/>
          <a className="login-page-link" href="your-password-reset-url">Forgot your password?</a>
        </div></form></div></div>
  );
}

export default LoginPage;
