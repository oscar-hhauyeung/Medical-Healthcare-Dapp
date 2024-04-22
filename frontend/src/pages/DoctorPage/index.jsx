import React, { useState, useEffect } from "react";
import "./DoctorPage.css";
import Navbar from "../../components/Navbar";
import * as FaIcons from "react-icons/fa";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { MedicalAppContractAddress } from "../../config";
import MedicalAppAbi from "../../MedicalApp.json";
const ethers = require("ethers");

function DoctorPage() {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const cookies = new Cookies();
  const navigate = useNavigate();
  const data = [
    // { date: "2023-11-27 10:30 AM", info: "Patient had a routine checkup." },
  ];
  const [MedicalRecords, setMedicalRecords] = useState(data);

  const [patientWalletAddress, setPatientWalletAddress] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newInfo, setNewInfo] = useState("");

  const [currentAccount, setCurrentAccount] = useState("");

  // get medical records from blockchain
  const handleSearch = async (event) => {
    event.preventDefault();
    if (patientWalletAddress === "") {
      alert("Please enter a patient's wallet address");
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
        MedicalContract.getMedical(patientWalletAddress)
          .then((res) => {
            console.log(res);
            if (res[1] === false) {
              alert(
                "You are not authorized to view this patient's medical records"
              );
              return;
            }
            // Convert the Proxy object to a regular JavaScript object
            const medicalRecordsArray = JSON.parse(JSON.stringify(res[0]));
            console.log(medicalRecordsArray);

            // Map the array of arrays into an array of objects
            const mappedMedicalRecords = medicalRecordsArray.map((record) => ({
              date: record[0], // assuming the date is at index 0
              info: record[1], // assuming the info is at index 1
            }));
            console.log(mappedMedicalRecords);

            if (mappedMedicalRecords.length === 0) {
              alert("No medical records found");
            }

            setMedicalRecords(mappedMedicalRecords);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        alert("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // add medical record from frontend to blockchain
  const handleCreate = async (event) => {
    event.preventDefault();
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

        // create medical record on blockchain
        const tx = await MedicalContract.createMedicalRecord(
          patientWalletAddress,
          newDate,
          newInfo
        );
        // Wait for transaction to be mined
        const receipt = await tx.wait();

        // Listen for the emitted event
        const filter = MedicalContract.filters.MedicalRecordCreated();
        const events = await MedicalContract.queryFilter(
          filter,
          receipt.blockNumber
        );

        // Check the latest emitted event
        const latestEvent = events[events.length - 1];
        console.log(latestEvent);

        if (latestEvent.args.success) {
          alert("Medical record created successfully!");
          setMedicalRecords([
            ...MedicalRecords,
            { date: newDate, info: newInfo },
          ]);
        } else {
          alert("Medical record creation failed!");
        }
        setNewDate("");
        setNewInfo("");
        setShowModal(false);
      } else {
        alert("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenModal = () => {
    if (patientWalletAddress === "") {
      alert("Please enter a patient's wallet address");
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

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
        if (data.userType !== "doctor") {
          console.log("You are not a doctor");
          navigate("/");
        }
        console.log(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  return (
    <div className="doctorPage">
      <div className="container">
        <div className="header">
          <div className="header-1">csci2730-project</div>
          <div className="header-2">
            {/* {currentAccount ? (
              `Your wallet address is: ${currentAccount}`
            ) : (
              <button onClick={connectWallet}>Connect Wallet</button>
            )} */}
            Your wallet address is: {currentAccount}
          </div>
        </div>
        <div className="body">
          <Navbar userType="doctor" />
          <div className="body-1">
            <p>Patient Medical Records</p>
            <form onSubmit={handleSearch}>
              <input
                className="searchPatient"
                type="text"
                placeholder="Enter Patient's Wallet Address"
                value={patientWalletAddress}
                onChange={(e) => setPatientWalletAddress(e.target.value)}
              />
              <button className="searchBtn" type="submit">
                <FaIcons.FaSearch />
                <span>Search</span>
              </button>
            </form>
            <br></br>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Information</th>
                  <th>
                    <button className="newRecordBtn" onClick={handleOpenModal}>
                      <FaIcons.FaCloudUploadAlt />
                      <span>New Record</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {MedicalRecords?.map((item, index) => (
                  <tr key={index} className="tr-row">
                    <td>{item.date}</td>
                    <td colSpan="2" className="info">
                      {item.info}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showModal && (
              <div className="modal">
                <form onSubmit={handleCreate}>
                  <h2>New Records</h2>
                  <input
                    type="text"
                    placeholder="Type the date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Type the information"
                    value={newInfo}
                    onChange={(e) => setNewInfo(e.target.value)}
                  />
                  <br></br>
                  <button className="modalBtn" type="submit">
                    Create
                  </button>
                  <button className="modalBtn" onClick={handleCloseModal}>
                    Close
                  </button>
                </form>
              </div>
            )}
          </div>
          <div className="body-2">
            <p>Appointment Management</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorPage;
