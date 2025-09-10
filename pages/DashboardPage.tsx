
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Settings } from '../types';
import Header from '../components/Header';

const DashboardPage: React.FC = () => {
  const { state, updateSettings } = useAppContext();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(state.settings);

  useEffect(() => {
    // Deep copy to prevent direct mutation of context state
    setSettings(JSON.parse(JSON.stringify(state.settings)));
  }, [state.settings]);

  const handleTeamCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = Math.max(1, Number(e.target.value) || 1); // Ensure it's at least 1
    setSettings(prev => {
        const currentCount = prev.teamCount || 0;
        const newPhysicians = {...prev.physicians};

        if (newCount > currentCount) {
            for (let i = currentCount + 1; i <= newCount; i++) {
                if (!newPhysicians[i]) {
                    newPhysicians[i] = [`${i}組醫師A`, `${i}組醫師B`, `${i}組醫師C`];
                }
            }
        }
        
        return {
            ...prev,
            teamCount: newCount,
            physicians: newPhysicians,
        };
    });
  };

  const handleAcupointCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newCount = Math.max(1, Number(e.target.value) || 1);
      setSettings(prev => {
          const currentCount = prev.acupointCount || 0;
          const newAcupointNames = {...prev.acupointNames};

          if (newCount > currentCount) {
              for (let i = currentCount + 1; i <= newCount; i++) {
                  if (!newAcupointNames[i]) {
                      newAcupointNames[i] = `${i}`;
                  }
              }
          }

          return {
              ...prev,
              acupointCount: newCount,
              acupointNames: newAcupointNames
          };
      });
  };

  const handlePhysicianChange = (team: number, index: number, name: string) => {
    const newPhysicians = { ...settings.physicians };
    if (!newPhysicians[team]) newPhysicians[team] = []; // Should not happen with current logic, but safe
    newPhysicians[team][index] = name;
    setSettings(prev => ({ ...prev, physicians: newPhysicians }));
  };
  
  const handleAcupointNameChange = (pointNumber: number, name: string) => {
      const newAcupointNames = {...settings.acupointNames};
      newAcupointNames[pointNumber] = name;
      setSettings(prev => ({...prev, acupointNames: newAcupointNames}));
  };

  const handleSave = async () => {
    // Trim down objects to match counts before saving
    const finalSettings = JSON.parse(JSON.stringify(settings));
    
    // Trim physicians
    Object.keys(finalSettings.physicians).forEach(teamNum => {
      if (Number(teamNum) > finalSettings.teamCount) {
        delete finalSettings.physicians[teamNum];
      }
    });

    // Trim acupoint names
    Object.keys(finalSettings.acupointNames).forEach(pointNum => {
      if (Number(pointNum) > finalSettings.acupointCount) {
        delete finalSettings.acupointNames[pointNum];
      }
    });

    await updateSettings(finalSettings);
    alert('設定已儲存！');
    navigate('/');
  };

  if (!settings.teamCount) {
      return (
          <div className="flex justify-center items-center min-h-screen">
              <div className="text-xl font-semibold">載入中...</div>
          </div>
      )
  }

  const teams = Array.from({ length: settings.teamCount }, (_, i) => i + 1);

  return (
    <div>
      <Header title="控制台" showBackButton />
      <div className="p-4 space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-black">一般設定</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-gray-700 font-medium mb-1">組別數量</label>
                  <input 
                      type="number"
                      value={settings.teamCount}
                      onChange={handleTeamCountChange}
                      className="w-full p-2 border rounded mt-1 bg-white text-black"
                      min="1"
                  />
              </div>
              <div>
                  <label className="block text-gray-700 font-medium mb-1">穴位數量</label>
                  <input
                      type="number"
                      value={settings.acupointCount}
                      onChange={handleAcupointCountChange}
                      className="w-full p-2 border rounded mt-1 bg-white text-black"
                      min="1"
                  />
              </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-black">主治醫師設定</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {teams.map(team => (
              <div key={team}>
                <h4 className="font-bold text-black">{`第 ${team} 組`}</h4>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(settings.physicians[team] || ['', '', '']).map((name, index) => (
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