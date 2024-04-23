import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { MedicalAppContractAddress } from "../../config";
import MedicalAppAbi from "../../MedicalApp.json";
import Navbar from "../../components/Navbar";
import "./DoctorPage.css";
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
  const [showInstruction, setShowInstruction] = useState(false);

  useEffect(() => {
    // Function to insert words into spans one by one
    const insertWords = async () => {
      const words = [
        "To view a patient's medical records, enter the patient's MetaMask wallet address and click on the search button. To add a new medical record, click on the green button on the right.",
        "Note: You can only view medical records of patients who have authorized you to do so.",
        "Upload medical records to the blockchain requires a gas fee. Please make sure you have enough SepoliaETH in your MetaMask wallet.",
      ];

      for (let i = 0; i < words.length; i++) {
        const instructionChar =
          document.querySelectorAll(".instruction-char")[i];
        instructionChar.textContent = "";
        for (let j = 0; j < words[i].length; j++) {
          instructionChar.textContent += words[i][j];
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    insertWords();
  }, []);

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
          navigate("/");
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
    <div className="bg-gray-100 min-h-screen grid grid-cols-10">
      {/* Navbar */}
      <div className="col-span-2">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="col-span-8">
        <div className="mx-auto p-6 h-full">
          <div className="bg-white shadow-md rounded-md">
            <div className="px-6 py-4 border-b border-gray-200 h-full">
              <h1 className="text-2xl font-bold mb-2">Doctor Dashboard</h1>
              <p className="text-sm">Your wallet address: {currentAccount}</p>
            </div>
            {/* Instruction */}
            <div className="p-6 h-[200px] overflow-y-hidden">
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char">
                  {/* To view a patient's medical records, enter the patient's
                  MetaMask wallet address and click on the search button. To add
                  a new medical record, click on the green button on the right. */}
                </span>
              </p>
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char">
                  {/* Note: You can only view medical records of patients who have
                  authorized you to do so. */}
                </span>
              </p>
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char">
                  {/* Upload medical records to the blockchain requires a gas fee.
                  Please make sure you have enough SepoliaETH in your MetaMask
                  wallet. */}
                </span>
              </p>
            </div>
            <div className="p-6 h-[500px]">
              <div className="mb-6">
                <p className="text-lg font-bold mb-2">
                  Patient Medical Records
                </p>
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    className="border border-gray-300 rounded-md px-4 py-2 w-full mr-2"
                    type="text"
                    placeholder="Enter Patient's MetaMask Wallet Address"
                    value={patientWalletAddress}
                    onChange={(e) => setPatientWalletAddress(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    type="submit"
                  >
                    <FaIcons.FaSearch />
                  </button>
                </form>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="border-b border-gray-300 px-4 py-2">Date</th>
                    <th className="border-b border-gray-300 px-4 py-2">
                      Information
                    </th>
                    <th className="border-b border-gray-300 px-4 py-2 text-right">
                      <button
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                        onClick={handleOpenModal}
                      >
                        <FaIcons.FaCloudUploadAlt />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MedicalRecords?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="px-4 py-2">{item.date}</td>
                      <td className="px-4 py-2" colSpan="2">
                        {item.info}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                  <div className="bg-white p-6 rounded-md shadow-md">
                    <form onSubmit={handleCreate}>
                      <h2 className="text-lg font-bold mb-4">New Records</h2>
                      <input
                        className="border border-gray-300 rounded-md px-4 py-2 mb-2 w-full"
                        type="text"
                        placeholder="Enter the date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                      <input
                        className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
                        type="text"
                        placeholder="Enter the information"
                        value={newInfo}
                        onChange={(e) => setNewInfo(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <button
                          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mr-2"
                          type="submit"
                        >
                          Create
                        </button>
                        <button
                          className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500"
                          onClick={handleCloseModal}
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorPage;
