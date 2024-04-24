// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract MedicalApp {
    //structs
    struct Patients {
        MedicalRecord[] medicalRecords;
        address[] DoctorPermit;
    }

    struct MedicalRecord{
        string datetime;
        string info;
    }

    // mapping
    mapping (address => Patients) patients;

    // modifier
    address manager;
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    // Doctor functions
    function getMedical(address patient_address) public view returns (MedicalRecord[] memory, bool){
        bool isCheck = false;
        for(uint i = 0; i< patients[patient_address].DoctorPermit.length; i++){
            if(patients[patient_address].DoctorPermit[i] == msg.sender){
                isCheck = true;
            }
        }
        if(isCheck == true){
            return (patients[patient_address].medicalRecords ,true);
        }else{
            MedicalRecord[] memory empty;
            return (empty, false);
        }
    }

    function createMedicalRecord(address patient_address, string memory datetime, string memory info) public returns (bool){
        bool isCheck = false;
        for(uint i = 0; i< patients[patient_address].DoctorPermit.length; i++){
            if(patients[patient_address].DoctorPermit[i] == msg.sender){
                isCheck = true;
            }
        }
        if(isCheck == true){
            MedicalRecord memory newMedicalRecord = MedicalRecord(datetime, info);
            patients[patient_address].medicalRecords.push(newMedicalRecord);
            return true;
        }else{
            return false;
        }
    }

    // function createPatient(address patientAddress) public returns (bool){
    //     // if the patient is already registered
    //     if (patients[patientAddress].DoctorPermit.length != 0){
    //         return false;
    //     }
        
    //     // register patient and add the sender to the list of permitted doctors
    //     patients[patientAddress].DoctorPermit.push(msg.sender);
    //     return true;
    // }

    // Nurse functions
    function regDoctorPermit(address doctor_address) public payable returns (bool){
        bool isCheck = false;
        for(uint i = 0; i< patients[msg.sender].DoctorPermit.length; i++){
            if(patients[msg.sender].DoctorPermit[i] == doctor_address){
                isCheck = true;
            }
        }
        if (isCheck == true){
            return false;
        }else{
            patients[msg.sender].DoctorPermit.push(doctor_address);
            return true;
        }
    }

    function showDoctorPermit() public view returns (address[] memory){
        return patients[msg.sender].DoctorPermit;
    }

    function deleteDoctorPermit(address doctor_address) public payable returns (bool, string memory){
        // if there are only one doctor in the list
        // if (patients[msg.sender].DoctorPermit.length == 1){
        //     return (false, "You can't delete the last doctor in the list");
        // }
        // else{
            for(uint i = 0; i< patients[msg.sender].DoctorPermit.length; i++){
                // if the doctor is in the list
                if(patients[msg.sender].DoctorPermit[i] == doctor_address){
                    delete patients[msg.sender].DoctorPermit[i];
                    return (true, "The doctor is deleted");
                }
            }
            return (false, "The doctor is not in the list");
        // }
    }

}
