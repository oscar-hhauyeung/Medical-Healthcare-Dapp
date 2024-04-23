import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import "./PatientPage.css";
import Navbar from "../../components/Navbar";
import info from "./info_icon.jpg";
import del from "./del_icon.png";
import { MedicalAppContractAddress } from "../../config";
import MedicalAppAbi from "../../MedicalApp.json";
import { ethers } from "ethers";

function PatientPage() {
  const apiUrl = process.env.API_URL || "http://localhost:8080";
  const cookies = new Cookies();
  const navigate = useNavigate();

  //get address
  // const [address, setAddress] = useState("");
  //state to store doc-info
  const [currentAccount, setCurrentAccount] = useState("");
  const [doctorWalletAddress, setDoctorWalletAddress] = useState("");
  const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState("");

  // Checks if user is connected to MetaMask wallet
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their MetaMask account
        setCurrentAccount("");
        alert("You disconnected your MetaMask wallet");
        navigate("/");
      } else {
        // User switched or connected a new account
        setCurrentAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      if (chainId !== "0xaa36a7") {
        // User switched to a different network
        alert("Please connect to the Sepolia testnet");
        navigate("/");
        return;
      }
    };

    const connectAndCheckNetwork = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          alert("MetaMask not detected. Please install MetaMask.");
          return;
        }

        // event listener when user switches account
        ethereum.on("accountsChanged", handleAccountsChanged);
        // event listener when user switches network
        ethereum.on("chainChanged", handleChainChanged);

        let chainId = await ethereum.request({ method: "eth_chainId" });
        console.log("Connected to chain " + chainId);

        // make sure user connects to Sepolia testnet
        const sepoliaId = "0xaa36a7";
        if (chainId !== sepoliaId) {
          alert("Please connect to the Sepolia testnet");
          navigate("/");
          return;
        }

        // connect to MetaMask wallet
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Connected to MetaMask wallet: " + accounts[0]);
        setCurrentAccount(accounts[0]);
        console.log(currentAccount);
      } catch (error) {
        console.log(error);
        alert("Error connecting to MetaMask wallet");
        navigate("/");
      }
    };

    connectAndCheckNetwork();

    return () => {
      const { ethereum } = window;
      if (ethereum) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []); // Empty dependency array to run the effect only once on mount

  // authenticate user
  console.log(info);
  console.log(del);
  useEffect(() => {
    fetch(`${apiUrl}/auth-endpoint`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cookies.get("auth")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
          navigate("/");
        }
        if (data.userType !== "patient") {
          console.log("You are not a patient");
          navigate("/");
        }
        console.log(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  const givePermission = async (e) => {
    e.preventDefault();
    if (doctorWalletAddress === "") {
      alert("Please enter the wallet address of the doctor");
      return;
    }
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const MedicalContract = new ethers.Contract(
          MedicalAppContractAddress,
          MedicalAppAbi.abi,
          signer
        );
        MedicalContract.regDoctorPermit(doctorWalletAddress)
          .then((res) => {
            console.log(res);
            alert("Permission given");
          })
          .catch((error) => {
            console.log(error);
            alert("Error giving permission");
          });
      } else {
        alert("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      alert("Error giving permission");
    }
  };

  const fetchAuthorizedDoctors = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const MedicalContract = new ethers.Contract(
          MedicalAppContractAddress,
          MedicalAppAbi.abi,
          signer
        );

        // Fetch the list of authorized doctors
        const doctors = await MedicalContract.showDoctorPermit();
        if (doctors.length === 0) {
          alert("No authorized doctors");
          return;
        }
        // filter out the empty addresses
        // const doctorsFiltered = doctors.filter((doctor) => doctor !== "0x");
        // console.log(doctorsFiltered);
        // setAuthorizedDoctors(doctorsFiltered);
        setAuthorizedDoctors(doctors);
      } else {
        alert("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching authorized doctors");
    }
  };

  // get doctor info from the backend server
  const getdoctorInfo = (doctor) => async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/doctor-info/${doctor}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookies.get("auth")}`,
        },
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      console.log(data);
      setDoctorInfo(data);
    } catch (error) {
      console.log(error);
      alert("Error fetching doctor info");
    }
  };

  const deleteDoctorPermit = (doctor) => async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const MedicalContract = new ethers.Contract(
          MedicalAppContractAddress,
          MedicalAppAbi.abi,
          signer
        );
        MedicalContract.deleteDoctorPermit(doctor)
          .then((res) => {
            console.log(res);
            alert("Permission deleted");
          })
          .catch((error) => {
            console.log(error);
            alert("Error deleting permission");
          });
      } else {
        alert("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      alert("Error deleting permission");
    }
  };

  return (
    <div className="patientPage">
      <div className="container">
        <div className="header">
          <div className="header-1">csci2730-project</div>
          <div className="header-2">
            Your wallet address is: {currentAccount}
          </div>
        </div>
        <div className="body">
          <Navbar userType="patient" />
          <div className="body-1">
            <div className="block">
              <div className="title">Access Control</div>
              <input
                className="input-field"
                type="text"
                placeholeder="Type the wallet address of the foctor"
                value={doctorWalletAddress}
                onChange={(e) => setDoctorWalletAddress(e.target.value)}
              />
              <button className="button" onClick={givePermission}>
                Give Permission
              </button>
            </div>
            <div className="block">
              <div className="title">Authorized Doctor</div>
              {/* <div className="doctor-info">
                <div className="name">Dr. John Doe{doctor.name}</div>
                <div className="icons">
                  <img className="icon" src={info} alt="Info" />
                  <img className="icon" src={del} alt="Delete" />
                </div>
              </div>
              <div className="doc-add">Address: {doctor.address}</div> */}
              <button className="button" onClick={fetchAuthorizedDoctors}>
                Fetch Authorized Doctors
              </button>
              <div className="doctor-list">
                {authorizedDoctors.map((doctor) => (
                  <div className="doctor-info">
                    <div className="name">{doctor}</div>
                    <div className="icons">
                      <img
                        className="icon"
                        src={info}
                        alt="Info"
                        onClick={getdoctorInfo(doctor)}
                      />
                      <img
                        className="icon"
                        src={del}
                        alt="Delete"
                        onClick={deleteDoctorPermit(doctor)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="body-2">
            <div className="block">
              <div className="title">Doctor Details:</div>
              <div className="details">
                <div
                  className="pic"
                  style={{ backgroundImage: `url(${doctorInfo.profilePic})` }}
                ></div>
                <div className="info">
                  <div className="name">{doctorInfo.name}</div>
                  <div className="position">{doctorInfo.department}</div>
                </div>
              </div>
              <div className="doc-address">
                <div className="label">Walletaddress: </div>
                <div className="wallet">{doctorInfo.walletAddress}</div>
              </div>
              <div className="doc-email">
                <div className="label">Email: </div>
                <div className="email">{doctorInfo.email}</div>
              </div>
              <div className="doc-rn">
                <div className="label">Registration number: </div>
                <div className="rn">{doctorInfo.registrationNumber}</div>
              </div>
              <div className="doc-hospital">
                <div className="label">Hospital: </div>
                <div className="hospital">{doctorInfo.hospital}</div>
              </div>
            </div>

            <button className="button">Make Appointment</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientPage;
