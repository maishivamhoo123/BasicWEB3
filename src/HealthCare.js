import { Contract, ethers } from "ethers";
import React, { useState, useEffect } from "react";
import "./HealthCare.css";

const HealthCare = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [patientID, setPatientID] = useState('');
  const [parentRecord, setPaitentRecord] = useState([]);
  const [providerAddress, SetProviderAdress] = useState("");
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');

  const connectAddress = "0x674d9726ced1fa602b296321bc59544eb4b2200e";

  const Abi = [
    {
      "inputs": [{ "internalType": "address", "name": "_provider", "type": "address" }],
      "name": "addAuthorizeProvider",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_RecordId", "type": "uint256" },
        { "internalType": "string", "name": "_patientName", "type": "string" },
        { "internalType": "string", "name": "_Dignossis", "type": "string" },
        { "internalType": "string", "name": "_treatment", "type": "string" }
      ],
      "name": "AddRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "getOwner",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "_recordId", "type": "uint256" }],
      "name": "getRecord",
      "outputs": [
        {
          "components": [
            { "internalType": "uint256", "name": "RecordId", "type": "uint256" },
            { "internalType": "string", "name": "patientName", "type": "string" },
            { "internalType": "string", "name": "Dignossis", "type": "string" },
            { "internalType": "string", "name": "treatment", "type": "string" },
            { "internalType": "uint256", "name": "timeStamp", "type": "uint256" }
          ],
          "internalType": "struct HealthCare.Record[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();

        setProvider(provider);
        setSigner(signer);

        const accountAdress = await signer.getAddress();
        setAccount(accountAdress);

        const contract = new Contract(connectAddress, Abi, signer);
        setContract(contract);

        const ownerAddress = await contract.getOwner();
        setIsOwner(accountAdress.toLowerCase() === ownerAddress.toLowerCase());
      } catch (error) {
        console.error(error);
      }
    };
    connectWallet();
  }, []);

  const fetchPatientRecords = async () => {
    try {
      const parentRecord = await contract.getRecord(patientID);
      console.log(parentRecord);
      setPaitentRecord(parentRecord);
    } catch (error) {
      console.error(error);
    }
  };

  const AddRecord = async () => {
    const recordIdNum = Number(patientID);

    if (!patientID || isNaN(recordIdNum) || recordIdNum <= 0) {
      alert("Please enter a valid numeric Patient ID.");
      return;
    }

    if (!diagnosis.trim() || !treatment.trim()) {
      alert("Diagnosis and treatment fields cannot be empty.");
      return;
    }

    try {
      const tx = await contract.AddRecord(
        recordIdNum,
        "Alice",
        diagnosis,
        treatment
      );
      await tx.wait();
      await fetchPatientRecords();
      alert("Record is added");
      setDiagnosis('');
    setTreatment('');
    setPatientID('');
    } catch (error) {
      console.error(error);
    }
  };

  const AuthoriseProvider = async () => {
    if (isOwner) {
      try {
        const tr = await contract.addAuthorizeProvider(providerAddress);
        await tr.wait();
        alert('Provider authorised successfully');
        SetProviderAdress('');
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Only contract owner can call this function");
    }
  };

  return (
    <div className="container">
      <h1 className="titke">HealthCare Application</h1>
      {account && <p className="account-info">Connected Account: {account}</p>}
      {isOwner && <p className='owner-info'>You are the contract owner</p>}

      <div className='form-section'>
        <h2>Fetch Patient Records</h2>
        <input
          className='input-field'
          type='text'
          placeholder='Enter Patient ID'
          value={patientID}
          onChange={(e) => setPatientID(e.target.value)}
        />
        <button className='action-button' onClick={fetchPatientRecords}>Fetch Records</button>
      </div>

      <div className='form-section'>
        <h2>Add Patient Records</h2>
        <input
          className="input-field"
          type="number"
          placeholder="Enter Patient ID"
          value={patientID}
          onChange={(e) => setPatientID(e.target.value)}
        />
        <input
          className='input-field'
          type='text'
          placeholder='Diagnosis'
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
        <input
          className='input-field'
          type='text'
          placeholder='Treatment'
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
        />
        <button className='action-button' onClick={AddRecord}>Add Records</button>
      </div>

      <div className="form-section">
        <h2>Authorize HealthCare Provider</h2>
        <input
          className='input-field'
          type="text"
          placeholder='Provider Address'
          value={providerAddress}
          onChange={(e) => SetProviderAdress(e.target.value)}
        />
        <button className='action-button' onClick={AuthoriseProvider}>Authorize Provider</button>
      </div>

      <div className="record-section">
        <h2>Patient Records</h2>
        {parentRecord.map((record, index) => (
          <div key={index}>
            <p>Record ID: {record.RecordId.toNumber()}</p>
            <p>Diagnosis: {record.Dignossis}</p>
            <p>Treatment: {record.treatment}</p>
            <p>Timestamp: {new Date(record.timeStamp.toNumber() * 1000).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthCare;
