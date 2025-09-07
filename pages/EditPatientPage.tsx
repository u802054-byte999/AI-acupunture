import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Patient } from '../types';
import Header from '../components/Header';
import { TEAMS } from '../constants';

const EditPatientPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  const patientToEdit = state.patients.find(p => p.id === Number(id));

  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (patientToEdit) {
      setPatient(patientToEdit);
    } else {
      // Patient not found, redirect to home
      navigate('/');
    }
  }, [patientToEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!patient) return;
    const { name, value } = e.target;
    setPatient({ ...patient, [name]: name === 'team' ? Number(value) : value });
  };

  const isFormValid = () => {
    return patient && patient.medicalRecordNumber && patient.name && patient.bedNumber;
  };

  const handleSubmit = () => {
    if (!isFormValid() || !patient) {
      alert('請填寫所有必填欄位！');
      return;
    }
    dispatch({ type: 'UPDATE_PATIENT', payload: patient });
    navigate('/');
  };

  if (!patient) {
    return null; // or a loading spinner
  }

  return (
    <div>
      <Header title="編輯患者資料" showBackButton />
      <div className="p-4 space-y-4">
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
            {TEAMS.map(team => <option key={team} value={team}>{`第 ${team} 組`}</option>)}
          </select>
        </div>
        <div className="pt-4">
          <button onClick={handleSubmit} disabled={!isFormValid()} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400">
            儲存變更
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPatientPage;
