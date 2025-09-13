
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

  const handleRefresh = () => {
    window.location.reload();
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
      <Header 
        title={
          <div className="flex items-center gap-2">
            <span>控制台</span>
            <button onClick={handleRefresh} className="p-1 rounded-full hover:bg-blue-700" aria-label="重新整理">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.695v-2.142A2.25 2.25 0 0018.397 5.92a2.25 2.25 0 00-2.247-2.175 2.25 2.25 0 00-2.248 2.175c0 .622.258 1.18.67 1.568m-4.992-2.695v-2.142A2.25 2.25 0 006.397 5.92a2.25 2.25 0 00-2.247 2.175 2.25 2.25 0 002.248 2.175c0 .622.258 1.18.67 1.568m5.023-4.876c.003.003.006.006.009.009l.01.01.01.01.01.01.009.009a.75.75 0 01-.027 1.049l-2.25 2.25a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.04-1.079l.56.561a3.75 3.75 0 015.304 0l.56-.561a.75.75 0 011.069.027z" />
              </svg>
            </button>
          </div>
        } 
        showBackButton 
      />
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
