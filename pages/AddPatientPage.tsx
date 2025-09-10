
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Patient } from '../types';
import Header from '../components/Header';
import QrScannerComponent from '../components/QrScannerComponent';

const AddPatientPage: React.FC = () => {
  const { addPatient, state } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const teams = Array.from({ length: state.settings.teamCount || 10 }, (_, i) => i + 1);

  const getInitialState = () => ({
    medicalRecordNumber: '',
    name: '',
    gender: '男性' as '男性' | '女性' | '其他',
    bedNumber: '',
    team: location.state?.team || 1,
  });

  const [patient, setPatient] = useState(getInitialState());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatient(prev => ({ ...prev, [name]: name === 'team' ? Number(value) : value }));
  };
  
  const handleQrScan = (data: string) => {
    setPatient(prev => ({ ...prev, medicalRecordNumber: data }));
  };

  const isFormValid = () => {
    return patient.medicalRecordNumber.trim() && patient.name.trim() && patient.bedNumber.trim();
  };

  const handleSubmit = async (addNext: boolean) => {
    if (!isFormValid()) {
      alert('請填寫所有必填欄位！');
      return;
    }
    
    const patientDataToSave = {
      medicalRecordNumber: patient.medicalRecordNumber.trim(),
      name: patient.name.trim(),
      gender: patient.gender,
      bedNumber: patient.bedNumber.trim(),
      team: patient.team,
    };

    const existingPatient = state.patients.find(p => p.medicalRecordNumber === patientDataToSave.medicalRecordNumber);
    if (existingPatient) {
      alert(`病歷號 ${patientDataToSave.medicalRecordNumber} 已存在。\n\n患者姓名: ${existingPatient.name}\n床號: ${existingPatient.bedNumber}`);
      return;
    }

    await addPatient(patientDataToSave);
    
    if (addNext) {
      const currentTeam = patient.team;
      setPatient(getInitialState());
      // Keep the same team for the next entry
      setPatient(prev => ({ ...prev, team: currentTeam }));
    } else {
      navigate('/');
    }
  };

  return (
    <div>
      <Header title="新增患者" showBackButton />
      <div className="p-4 space-y-4">
        <QrScannerComponent onScan={handleQrScan} />
        
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-gray-700">病歷號</label>
          <input type="text" name="medicalRecordNumber" value={patient.medicalRecordNumber} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-gray-700">姓名</label>
          <input type="text" name="name" value={patient.name} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-gray-700">性別</label>
          <select name="gender" value={patient.gender} onChange={handleChange} className="w-full p-2 border rounded mt-1 bg-white text-black">
            <option>男性</option>
            <option>女性</option>
            <option>其他</option>
          </select>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-gray-700">床號</label>
          <input type="text" name="bedNumber" value={patient.bedNumber} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-gray-700">組別</label>
          <select name="team" value={patient.team} onChange={handleChange} className="w-full p-2 border rounded mt-1 bg-white text-black">
            {teams.map(team => <option key={team} value={team}>{`第 ${team} 組`}</option>)}
          </select>
        </div>
        <div className="flex space-x-4 pt-4">
          <button onClick={() => handleSubmit(false)} disabled={!isFormValid()} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400">
            儲存患者
          </button>
          <button onClick={() => handleSubmit(true)} disabled={!isFormValid()} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400">
            新增下一位
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPatientPage;