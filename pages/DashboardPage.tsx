import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Settings } from '../types';
import Header from '../components/Header';
import { TEAMS } from '../constants';

const DashboardPage: React.FC = () => {
  const { state, updateSettings } = useAppContext();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(state.settings);

  useEffect(() => {
    setSettings(state.settings);
  }, [state.settings]);

  const handlePhysicianChange = (team: number, index: number, name: string) => {
    const newPhysicians = { ...settings.physicians };
    newPhysicians[team][index] = name;
    setSettings(prev => ({ ...prev, physicians: newPhysicians }));
  };
  
  const handleAcupointNameChange = (pointNumber: number, name: string) => {
      const newAcupointNames = {...settings.acupointNames};
      newAcupointNames[pointNumber] = name;
      setSettings(prev => ({...prev, acupointNames: newAcupointNames}));
  }

  const handleSave = async () => {
    await updateSettings(settings);
    alert('設定已儲存！');
    navigate('/');
  };

  return (
    <div>
      <Header title="控制台" showBackButton />
      <div className="p-4 space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-black">主治醫師設定</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {TEAMS.map(team => (
              <div key={team}>
                <h4 className="font-bold text-black">{`第 ${team} 組`}</h4>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {settings.physicians[team].map((name, index) => (
                    <input
                      key={index}
                      type="text"
                      value={name}
                      onChange={e => handlePhysicianChange(team, index, e.target.value)}
                      className="w-full p-2 border rounded text-sm bg-white text-black"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-black">穴位名稱編輯</h3>
          <div className="grid grid-cols-4 gap-4 max-h-64 overflow-y-auto">
            {Array.from({length: settings.acupointCount}, (_, i) => i + 1).map(pointNumber => (
                <div key={pointNumber} className="flex items-center space-x-2">
                    <label className="font-semibold text-black">{pointNumber}.</label>
                    <input
                      type="text"
                      value={settings.acupointNames[pointNumber] || ''}
                      onChange={e => handleAcupointNameChange(pointNumber, e.target.value)}
                      className="w-full p-2 border rounded text-sm bg-white text-black"
                    />
                </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold">
          儲存設定
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;