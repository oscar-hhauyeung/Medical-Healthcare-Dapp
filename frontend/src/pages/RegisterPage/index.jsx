import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./RegisterPage.css";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const navigate = useNavigate();
  // get the userType from the URL path
  const { userType } = useParams();
  const [error, setError] = useState("");

  const [walletAddress, setWalletAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Additional state variables for doctor-specific fields
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [hospital, setHospital] = useState("");
  const [department, setDepartment] = useState("");

  // Additional state variables for patient-specific fields
  const [hkid, setHkid] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState("");

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Perform validation
    // check if wallet address is connected
    if (!walletAddress) {
      setError("Please connect your wallet address");
      return;
    }

    // check if the email is valid
    let emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check if the phone number is valid
    // let phoneRegex = /^\d{8}$/;
    // if (!phoneRegex.test(phone)) {
    //   setError("Please enter a valid phone number");
    //   return;
    // }

    // Check if the HKID is valid
    // let hkidRegex = /^[A-Z]\d{6}\([A0-9]\)$/;
    // if (!hkidRegex.test(hkid)) {
    //   setError("Please enter a valid HKID");
    //   return;
    // }

    // Construct the user object based on the selected userType
    const user = {
      userType,
      walletAddress,
      name,
      email,
      password,
      phone,
      ...(userType === "doctor" && {
        registrationNumber,
        hospital,
        department,
      }),
      ...(userType === "patient" && {
        hkid,
        address,
        birthday,
      }),
    };

    // Perform API call to register the user
    const response = await fetch("http://localhost:8080/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    }).then((res) => res.json());

    if (response.success) {
      alert("User registered successfully");
      navigate("/");
    } else {
      setError(response.error);
    }
  };

  return (
    <div className="registerPage">
      <div className="container">
        <div className="img-container"></div>
        <form onSubmit={handleSubmit} autoComplete="on" className="form">
          <div className="header">Register</div>
          <div className="form-grid">
            <label htmlFor="name">Name:</label>
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              placeholder="Type your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Type your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password">Password:</label>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              placeholder="Type your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {userType === "doctor" && (
              <>
                <label htmlFor="phone">Phone:</label>
                <label htmlFor="registrationNumber">Registration Number:</label>
                <input
                  type="tel"
                  placeholder="Type your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Type your registration number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
                <label htmlFor="hospital">Hospital:</label>
                <label htmlFor="department">Department:</label>
                <input
                  type="text"
                  placeholder="Type your hospital"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Type your department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </>
            )}

            {userType === "patient" && (
              <>
                <label htmlFor="phone">Phone:</label>
                <label htmlFor="hkid">HKID:</label>
                <input
                  type="tel"
                  placeholder="Type your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Type your HKID"
                  value={hkid}
                  onChange={(e) => setHkid(e.target.value)}
                />
                <label htmlFor="address">Address:</label>
                <label htmlFor="birthday">Birthday:</label>
                <input
                  type="text"
                  placeholder="Type your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Type your birthday"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </>
            )}
            <label htmlFor="walletAddress">Wallet Address:</label>
            <button
              className="walletBtn"
              type="button"
              onClick={handleConnectMetaMask}
            >
              Connect MetaMask
            </button>
            <input
              className="wallet"
              type="text"
              placeholder="Connect your MetaMask wallet"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
              readOnly
            />
            <button
              className="formBtn"
              type="button"
              onClick={() => window.history.back()}
            >
              Back
            </button>
            <button className="formBtn">Submit</button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
    </div>
    
  );
};

export default RegistrationForm;
