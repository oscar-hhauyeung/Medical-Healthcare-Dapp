import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./RegisterPage.css";
import { useNavigate } from "react-router-dom";
import MetaMask from "../../assets/images/metamask.svg";

const RegistrationForm = () => {
  const apiUrl = process.env.API_URL || "http://localhost:8080";
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
    const response = await fetch(`${apiUrl}/register`, {
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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} autoComplete="on" className="w-[60vw]">
          <h2 className="text-2xl font-bold text-center">Register</h2>
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block">
                Name:
              </label>
              <input
                type="text"
                placeholder="Type your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
            <div>
              <label htmlFor="email" className="block">
                Email:
              </label>
              <input
                type="email"
                placeholder="Type your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="block">
                Password:
              </label>
              <input
                type="password"
                placeholder="Type your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block">
                Confirm Password:
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
            {userType === "doctor" && (
              <>
                <div>
                  <label htmlFor="phone" className="block">
                    Phone:
                  </label>
                  <input
                    type="tel"
                    placeholder="Type your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="registrationNumber" className="block">
                    Registration Number:
                  </label>
                  <input
                    type="text"
                    placeholder="Type your registration number"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="hospital" className="block">
                    Hospital:
                  </label>
                  <input
                    type="text"
                    placeholder="Type your hospital"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block">
                    Department:
                  </label>
                  <input
                    type="text"
                    placeholder="Type your department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
              </>
            )}
            {userType === "patient" && (
              <>
                <div>
                  <label htmlFor="phone" className="block">
                    Phone:
                  </label>
                  <input
                    type="tel"
                    placeholder="Type your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="hkid" className="block">
                    HKID:
                  </label>
                  <input
                    type="text"
                    placeholder="Type your HKID"
                    value={hkid}
                    onChange={(e) => setHkid(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block">
                    Address:
                  </label>
                  <input
                    type="text"
                    placeholder="Type your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="birthday" className="block">
                    Birthday:
                  </label>
                  <input
                    type="text"
                    placeholder="Type your birthday"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="walletAddress" className="block">
                Wallet Address:
              </label>
              <div className="flex justify-between items-end gap-2">
                <input
                  className="border border-gray-300 rounded-md p-2 w-full"
                  type="text"
                  placeholder="Click the fox to connect MetaMask"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                  readOnly
                />
                <button
                  className="border border-gray-300 rounded-md p-2 text-white font-bold bg-gray-200 hover:bg-gray-300"
                  type="button"
                  onClick={handleConnectMetaMask}
                >
                  <img src={MetaMask} alt="MetaMask" className="w-8 h-6" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button
              className="border border-gray-300 rounded-md p-2 bg-gray-400 text-white font-bold hover:bg-gray-500"
              type="button"
              onClick={() => window.history.back()}
            >
              Back
            </button>
            <button className="border border-gray-300 rounded-md p-2 bg-blue-500 text-white font-bold hover:bg-blue-600">
              Submit
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
