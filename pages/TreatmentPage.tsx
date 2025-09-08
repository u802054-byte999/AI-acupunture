import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BodyPart, TreatmentSession } from '../types';
import { BODY_PARTS } from '../constants';
import Header from '../components/Header';

const NeedleControl: React.FC<{ part: BodyPart; count: number; onChange: (part: BodyPart, newCount: number) => void }> = ({ part, count, onChange }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
      <div className="flex items-center">
        <span className={`w-3 h-3 rounded-full inline-block mr-3 transition-colors ${count > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
        <span className="text-lg font-medium text-black">{part}</span>
      </div>
      <div className="flex items-center space-x-3">
        <button onClick={() => onChange(part, Math.max(0, count - 1))} className="w-12 h-12 bg-red-500 text-white rounded-full text-3xl font-bold flex items-center justify-center shadow-md">-</button>
        <span className="text-2xl font-bold w-10 text-center text-black">{count}</span>
        <button onClick={() => onChange(part, count + 1)} className="w-12 h-12 bg-green-500 text-white rounded-full text-3xl font-bold flex items-center justify-center shadow-md">+</button>
      </div>
    </div>
  );
};

const bodyPartDisplayNameMap = {
    [BodyPart.Head]: '頭部',
    [BodyPart.Torso]: '軀幹',
    [BodyPart.LeftUpperLimb]: '左臂',
    [BodyPart.RightUpperLimb]: '右臂',
    [BodyPart.LeftLowerLimb]: '左腿',
    [BodyPart.RightLowerLimb]: '右腿',
};

const partPairs: [BodyPart, BodyPart][] = [
    [BodyPart.Head, BodyPart.Torso],
    [BodyPart.LeftUpperLimb, BodyPart.RightUpperLimb],
    [BodyPart.LeftLowerLimb, BodyPart.RightLowerLimb],
];

const TreatmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, addTreatment, updateTreatment, completeRemoval } = useAppContext();
  
  const patient = useMemo(() => state.patients.find(p => p.id === id), [state.patients, id]);
  const physiciansForTeam = useMemo(() => patient ? (state.settings.physicians[patient.team] || []) : [], [patient, state.settings]);

  const [needleCounts, setNeedleCounts] = useState<Record<BodyPart, number>>(() => 
    BODY_PARTS.reduce((acc, part) => ({ ...acc, [part]: 0 }), {} as Record<BodyPart, number>)
  );
  const [needleCountsHistory, setNeedleCountsHistory] = useState<Record<BodyPart, number>[]>([]);
  const [attendingPhysician, setAttendingPhysician] = useState<string | undefined>(undefined);
  const [editingSession, setEditingSession] = useState<TreatmentSession | null>(null);
  const [confirmingRemoval, setConfirmingRemoval] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!state.loading && !patient) {
      navigate('/');
    } else if (!editingSession && patient) {
       setAttendingPhysician(physiciansForTeam.length > 0 ? physiciansForTeam[0] : undefined);
    }
  }, [patient, navigate, physiciansForTeam, editingSession, state.loading]);

  const totalNeedles = useMemo(() => Object.values(needleCounts).reduce((sum, count) => sum + count, 0), [needleCounts]);

  const handleNeedleChange = (part: BodyPart, newCount: number) => {
    setNeedleCountsHistory(prev => [...prev, needleCounts]);
    setNeedleCounts(prev => ({ ...prev, [part]: newCount }));
  };

  const handleUndo = () => {
    if (needleCountsHistory.length === 0) return;
    const lastState = needleCountsHistory[needleCountsHistory.length - 1];
    setNeedleCounts(lastState);
    setNeedleCountsHistory(prev => prev.slice(0, -1));
  };

  const clearForm = () => {
    setEditingSession(null);
    setNeedleCounts(BODY_PARTS.reduce((acc, part) => ({ ...acc, [part]: 0 }), {} as Record<BodyPart, number>));
    setAttendingPhysician(physiciansForTeam.length > 0 ? physiciansForTeam[0] : undefined);
    dispatch({ type: 'SET_SELECTED_ACUPOINTS', payload: [] });
    setNeedleCountsHistory([]);
  };

  const handleSaveOrUpdate = async () => {
    if (!id) return;
    if (totalNeedles === 0) {
      alert('總針數不能為0');
      return;
    }
    if (!attendingPhysician) {
      alert('請選擇主治醫師');
      return;
    }

    if (editingSession) {
      const updatedSession: TreatmentSession = {
        ...editingSession,
        needleCounts,
        totalNeedles,
        acupoints: state.selectedAcupoints,
        attendingPhysician,
      };
      await updateTreatment(id, updatedSession);
      alert('治療紀錄已更新！');
      clearForm();
    } else {
      const newSession: Omit<TreatmentSession, 'id'> = {
        startTime: new Date().toLocaleString('zh-TW', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
        needleCounts,
        totalNeedles,
        acupoints: state.selectedAcupoints,
        attendingPhysician,
      };
      await addTreatment(id, newSession);
      dispatch({ type: 'SET_SELECTED_ACUPOINTS', payload: [] });
      navigate('/');
    }
  };

  const handleModifyClick = (session: TreatmentSession) => {
    setEditingSession(session);
    setNeedleCounts(session.needleCounts);
    setAttendingPhysician(session.attendingPhysician);
    dispatch({ type: 'SET_SELECTED_ACUPOINTS', payload: session.acupoints });
    setNeedleCountsHistory([]);
    window.scrollTo(0, 0);
  };

  const handleCompleteRemovalClick = (sessionId: string) => {
    setConfirmingRemoval(sessionId);
  };

  const confirmCompleteRemoval = async () => {
    if (confirmingRemoval && id) {
      await completeRemoval(id, confirmingRemoval);
      setConfirmingRemoval(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };
  
  const exportTreatmentToTxt = (session: TreatmentSession) => {
    const content = `
智慧記針小幫手治療紀錄
-------------------------
病歷號: ${patient?.medicalRecordNumber}
姓名: ${patient?.name}
治療時間: ${session.startTime}
拔針時間: ${session.removalTime || '未紀錄'}
主治醫師: ${session.attendingPhysician || '未紀錄'}
總針數: ${session.totalNeedles}
穴位: ${session.acupoints.join(', ')}

針數分佈:
${BODY_PARTS.map(part => `${part}: ${session.needleCounts[part]} 針`).join('\n')}
    `;
    const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `treatment_${patient?.medicalRecordNumber}_${session.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!patient) return null;

  return (
    <div className="pb-16">
      <Header title="針灸治療" showBackButton />

      <div className="p-4 space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-black">{patient.name}</h2>
             <p className="text-gray-600">病歷號: {patient.medicalRecordNumber}</p>
          </div>
          <div className="mt-4">
            <button onClick={() => navigate(`/patient/${id}/acupoints`)} className="w-full bg-indigo-500 text-white py-3 rounded-lg text-lg font-semibold">選擇穴位</button>
            {state.selectedAcupoints.length > 0 && 
                <div className="mt-2 text-sm text-gray-700 bg-indigo-100 p-2 rounded">
                    已選穴位: {state.selectedAcupoints.join(', ')}
                </div>
            }
          </div>
        </div>
        
        {editingSession && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
            <p className="font-bold">編輯模式</p>
            <p>您正在編輯 {editingSession.startTime} 的治療紀錄。</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2 text-black">針數紀錄</h3>
          {BODY_PARTS.map(part => (
            <NeedleControl key={part} part={part} count={needleCounts[part]} onChange={handleNeedleChange} />
          ))}
          <div className="flex items-center justify-end pt-4 space-x-4">
             <button 
                onClick={handleUndo} 
                disabled={needleCountsHistory.length === 0}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold flex items-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 000-10H6" /></svg>
                復原
            </button>
            <div className="text-2xl font-bold text-black">總針數: {totalNeedles}</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3 text-black">主治醫師</h3>
            <div className="flex space-x-2">
                {physiciansForTeam.map(name => (
                    <button key={name} onClick={() => setAttendingPhysician(name)} className={`flex-1 py-2 px-1 rounded-md text-sm transition-colors ${attendingPhysician === name ? 'bg-blue-600 text-white' : 'bg-white text-black border'}`}>
                        {name}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex space-x-2">
            <button onClick={handleSaveOrUpdate} className="w-full bg-blue-600 text-white py-4 rounded-lg text-xl font-bold shadow-lg">
                {editingSession ? '儲存變更' : '儲存針數紀錄'}
            </button>
            {editingSession && (
                <button onClick={clearForm} className="w-1/3 bg-gray-500 text-white py-4 rounded-lg text-lg font-bold shadow-lg">
                    取消
                </button>
            )}
        </div>


        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2 text-black">治療紀錄</h3>
          {patient.treatments.map(session => (
            <div key={session.id} className="border p-3 rounded-md bg-white text-black">
              <p><strong>治療時間:</strong> {session.startTime}</p>
              <p><strong>拔針時間:</strong> {session.removalTime || '治療中'}</p>
              <p><strong>總針數:</strong> {session.totalNeedles}</p>
              <p><strong>穴位:</strong> {session.acupoints.join(', ') || '無'}</p>
              <p><strong>主治醫師:</strong> {session.attendingPhysician}</p>
              {!session.removalTime && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="font-semibold text-sm text-gray-800 mb-2">當前針灸部位及針數</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700 text-sm">
                          {partPairs.map(([part1, part2]) => (
                              <React.Fragment key={part1}>
                                  <span>{`${bodyPartDisplayNameMap[part1]}: ${session.needleCounts[part1] || 0} 針`}</span>
                                  <span>{`${bodyPartDisplayNameMap[part2]}: ${session.needleCounts[part2] || 0} 針`}</span>
                              </React.Fragment>
                          ))}
                      </div>
                  </div>
              )}
              <div className="mt-3 flex space-x-2">
                {!session.removalTime && (
                  <button onClick={() => handleCompleteRemovalClick(session.id)} className="bg-green-500 text-white py-1 px-3 rounded text-sm">完成拔針</button>
                )}
                <button onClick={() => handleModifyClick(session)} className="bg-yellow-500 text-white py-1 px-3 rounded text-sm">修改</button>
                <button onClick={() => exportTreatmentToTxt(session)} className="bg-gray-500 text-white py-1 px-3 rounded text-sm">匯出 TXT</button>
              </div>
            </div>
          ))}
          {patient.treatments.length === 0 && <p className="text-gray-500">尚無治療紀錄</p>}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingRemoval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-black">確認完成拔針？</h3>
            <p className="text-gray-600 mb-6">確定要記錄此治療的拔針時間嗎？此動作無法復原。</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setConfirmingRemoval(null)} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">取消</button>
              <button onClick={confirmCompleteRemoval} className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">確定</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-20 right-4 bg-green-600 text-white py-3 px-5 rounded-lg shadow-lg z-50" role="alert">
          <p>拔針時間已成功紀錄！</p>
        </div>
      )}
    </div>
  );
};

export default TreatmentPage;