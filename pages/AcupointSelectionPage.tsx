
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';

const AcupointSelectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { settings } = state;
  const [selected, setSelected] = useState<string[]>(state.selectedAcupoints);

  const toggleSelection = (acupointName: string) => {
    setSelected(prev =>
      prev.includes(acupointName) ? prev.filter(a => a !== acupointName) : [...prev, acupointName]
    );
  };
  
  const handleComplete = () => {
    dispatch({ type: 'SET_SELECTED_ACUPOINTS', payload: selected });
    navigate(`/patient/${id}`);
  };

  const acupoints = Array.from({ length: settings.acupointCount }, (_, i) => settings.acupointNames[i + 1] || `${i + 1}`);

  return (
    <div>
      <Header title="選擇穴位" showBackButton />
      <div className="p-4">
        <div className="grid grid-cols-6 gap-2">
          {acupoints.map((name) => (
            <button
              key={name}
              onClick={() => toggleSelection(name)}
              className={`aspect-square flex items-center justify-center text-lg font-bold rounded-lg transition-colors
                ${selected.includes(name) ? 'bg-blue-600 text-white' : 'bg-white text-black border border-gray-300'}`}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          onClick={handleComplete}
          className="w-full bg-green-600 text-white py-4 mt-6 rounded-lg text-xl font-bold shadow-lg"
        >
          完成
        </button>
      </div>
    </div>
  );
};

export default AcupointSelectionPage;
