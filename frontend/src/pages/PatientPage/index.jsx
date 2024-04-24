import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import "./PatientPage.css";
import Navbar from "../../components/Navbar";
// import info from "./info_icon.jpg";
// import del from "./del_icon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { MedicalAppContractAddress } from "../../config";
import MedicalAppAbi from "../../MedicalApp.json";
import { ethers } from "ethers";

function PatientPage() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [doctorWalletAddress, setDoctorWalletAddress] = useState("");
  const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const cookies = new Cookies();
  const navigate = useNavigate();

  // get authorized doctors
  useEffect(() => {
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
            return;
          }
          // filter out the empty addresses
          // const doctorsFiltered = doctors.filter(
          //   (doctor) => doctor !== "0x0000000000000000000000000000000000000000"
          // );
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

    fetchAuthorizedDoctors();
  }, [currentAccount]);

  useEffect(() => {
    let isMounted = true;

    // Function to insert words into spans one by one
    const insertWords = async () => {
      const words = [
        "To give permission to a doctor, enter the doctor's MetaMask wallet address and click on the confirm button.",
        "To view a doctor's details, click on the info button.",
        "To delete a doctor's permission, click on the delete button.",
        "Note: For give permission and delete permission, make sure you have enough SepoliaETH in your MetaMask wallet.",
      ];

      for (let i = 0; i < words.length; i++) {
        const instructionChar =
          document.querySelectorAll(".instruction-char")[i];
        if (instructionChar && isMounted) {
          instructionChar.textContent = "";
          for (let j = 0; j < words[i].length; j++) {
            instructionChar.textContent += words[i][j];
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    };

    insertWords();

    return () => {
      isMounted = false;
    };
  }, []);

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
    <div className="flex h-screen">
      <div className="w-2/12 bg-gray-200">
        <Navbar />
      </div>
      <div className="w-10/12 bg-white p-8">
        <div className="bg-gray-100 rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="text-lg font-bold text-gray-800">
              Patient Dashboard
            </div>
            <div className="mt-2 text-gray-600">
              Your wallet address is: {currentAccount}
            </div>
          </div>
          <div className="p-6">
            {/* instrcution */}
            <div className="text-lg font-bold text-gray-800 mb-2">
              Instructions:
            </div>
            <div className="h-[150px] overflow-y-hidden border-b border-gray-200 mb-4">
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char"></span>
              </p>
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char"></span>
              </p>
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char"></span>
              </p>
              <p className="text-sm mb-4 text-gray-600">
                <span className="instruction-char"></span>
              </p>
            </div>
            <div className="flex mb-8 space-x-4">
              {/* Left-hand side - Doctor List and Doctor Details */}
              <div className="w-1/2">
                {/* Give Permission to Doctor */}
                <div className="mb-8">
                  <div className="text-lg font-bold text-gray-800 mb-2">
                    Give Permission to Doctor
                  </div>
                  <div className="flex">
                    <input
                      className="w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      type="text"
                      placeholder="Type the wallet address of the doctor"
                      value={doctorWalletAddress}
                      onChange={(e) => setDoctorWalletAddress(e.target.value)}
                    />
                    <button
                      className="ml-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 text-sm"
                      onClick={givePermission}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
                {/* Authorized Doctor List */}
                <div>
                  <div className="text-lg font-bold text-gray-800 mb-2">
                    <p className="text-lg font-bold text-gray-800">
                      Authorized Doctors
                    </p>
                  </div>
                  <div className="mt-4">
                    {authorizedDoctors.length === 0 ? (
                      <p className="text-gray-600">No authorized doctors</p>
                    ) : (
                      authorizedDoctors.map((doctor, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border border-gray-200 p-4 rounded-lg mb-4"
                        >
                          <div>
                            <div className="text-gray-600">{doctor}</div>
                          </div>
                          <div>
                            <button
                              className="px-4 py-2 bg-sky-500/75 text-white font-semibold rounded-md hover:bg-blue-600 text-sm"
                              onClick={getdoctorInfo(doctor)}
                            >
                              <FontAwesomeIcon icon={faInfoCircle} />
                            </button>
                            <button
                              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 text-sm ml-2"
                              onClick={deleteDoctorPermit(doctor)}
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/* Right-hand side - Doctor Details */}
              <div className="w-1/2">
                <div className="text-lg font-bold text-gray-800 mb-2">
                  Doctor Details:
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        {doctorInfo.name}
                      </div>
                      <div className="text-gray-600">
                        {doctorInfo.department}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                      <div className="text-gray-800">Wallet Address:</div>
                      <div className="ml-2 text-gray-600">
                        {doctorInfo.walletAddress}
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                      <div className="text-gray-800">Email:</div>
                      <div className="ml-2 text-gray-600">
                        {doctorInfo.email}
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                      <div className="text-gray-800">Registration Number:</div>
                      <div className="ml-2 text-gray-600">
                        {doctorInfo.registrationNumber}
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                      <div className="text-gray-800">Hospital:</div>
                      <div className="ml-2 text-gray-600">
                        {doctorInfo.hospital}
                      </div>
                    </div>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 text-sm">
                    Make Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientPage;
