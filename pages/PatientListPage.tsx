
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Patient, TreatmentSession, BodyPart } from '../types';
import Header from '../components/Header';
import QrScannerComponent from '../components/QrScannerComponent';

interface PatientCardProps {
  patient: Patient;
  onCompleteRemoval: (patientId: string, sessionId: string) => void;
  onDeletePatient: (patientId: string, patientName: string) => void;
}

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

const PatientCard: React.FC<PatientCardProps> = ({ patient, onCompleteRemoval, onDeletePatient }) => {
  const navigate = useNavigate();

  const latestTreatment = patient.treatments.length > 0 ? patient.treatments[0] : null;
  const isOngoing = latestTreatment && !latestTreatment.removalTime;

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (latestTreatment) {
      onCompleteRemoval(patient.id, latestTreatment.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/patient/edit/${patient.id}`);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePatient(patient.id, patient.name);
  };

  return (
    <div 
      onClick={() => navigate(`/patient/${patient.id}`)}
      className={`bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer transition-transform transform hover:scale-105 ${isOngoing ? 'bg-orange-100 border-l-4 border-orange-500' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-full">{`第 ${patient.team} 組`}</span>
          <h2 className="text-xl font-bold mt-1 text-black">{patient.name} <span className="text-base font-normal text-gray-600">{patient.gender}</span></h2>
        </div>
        <div className="text-right">
          <p className="text-gray-700">{`病歷號: ${patient.medicalRecordNumber}`}</p>
          <p className="text-gray-700">{`床號: ${patient.bedNumber}`}</p>
        </div>
      </div>
      <div className="mt-4 border-t pt-2 text-sm text-gray-600">
        <p>最後治療: {latestTreatment?.startTime || '無紀錄'}</p>
        <p>拔針時間: {latestTreatment?.removalTime || 'N/A'}</p>
      </div>
      {isOngoing && latestTreatment && (
         <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-bold mb-2 text-amber-800 text-lg">當前針灸部位及針數</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-amber-900 text-base">
                {partPairs.map(([part1, part2]) => (
                    <React.Fragment key={part1}>
                        <span>{`${bodyPartDisplayNameMap[part1]}: ${latestTreatment.needleCounts[part1] || 0} 針`}</span>
                        <span>{`${bodyPartDisplayNameMap[part2]}: ${latestTreatment.needleCounts[part2] || 0} 針`}</span>
                    </React.Fragment>
                ))}
            </div>
            <hr className="my-3 border-amber-200" />
            <div className="text-right font-bold text-amber-800 text-lg">
                總針數: {latestTreatment.totalNeedles} 針
            </div>
        </div>
      )}
      <div className="mt-4 flex justify-end items-center space-x-2">
        {isOngoing && latestTreatment && (
          <button
            onClick={handleCompleteClick}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm"
          >
            完成拔針
          </button>
        )}
         <button
            onClick={handleEditClick}
            className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors text-sm"
          >
            編輯
          </button>
         <button
            onClick={handleDeleteClick}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            刪除
          </button>
      </div>
    </div>
  );
};


const PatientListPage: React.FC = () => {
  const { state, completeRemoval, deletePatient } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'bedNumber' | 'treatmentTime' | 'removalTime'>('bedNumber');
  const [isScanning, setIsScanning] = useState(false);
  const [confirmingRemovalInfo, setConfirmingRemovalInfo] = useState<{ patientId: string, sessionId: string } | null>(null);
  const [deletingPatientInfo, setDeletingPatientInfo] = useState<{ id: string; name: string } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teams = Array.from({ length: state.settings.teamCount || 10 }, (_, i) => i + 1);

  const handleScan = (data: string) => {
    setSearchTerm(data);
    setIsScanning(false);
  };
  
  const handleCompleteRemovalClick = (patientId: string, sessionId: string) => {
    setConfirmingRemovalInfo({ patientId, sessionId });
  };

  const confirmCompleteRemoval = async () => {
    if (confirmingRemovalInfo) {
      await completeRemoval(confirmingRemovalInfo.patientId, confirmingRemovalInfo.sessionId);
      setConfirmingRemovalInfo(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handleDeletePatient = (patientId: string, patientName: string) => {
    setDeletingPatientInfo({ id: patientId, name: patientName });
  };

  const confirmDeletePatient = async () => {
    if (deletingPatientInfo) {
      await deletePatient(deletingPatientInfo.id);
      setDeletingPatientInfo(null);
    }
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };

  const filteredAndSortedPatients = useMemo(() => {
    let patients = [...state.patients];
    
    if (filterTeam !== 'all') {
      patients = patients.filter(p => p.team === filterTeam);
    }
    if (searchTerm) {
      patients = patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.medicalRecordNumber.includes(searchTerm)
      );
    }
    
    patients.sort((a, b) => {
        switch (sortBy) {
            case 'treatmentTime':
                const aTreatTime = a.treatments[0]?.startTime || '';
                const bTreatTime = b.treatments[0]?.startTime || '';
                return bTreatTime.localeCompare(aTreatTime);
            case 'removalTime':
                const aOngoing = !a.treatments[0]?.removalTime;
                const bOngoing = !b.treatments[0]?.removalTime;
                if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;
                const aRemoveTime = a.treatments[0]?.removalTime || '';
                const bRemoveTime = b.treatments[0]?.removalTime || '';
                return bRemoveTime.localeCompare(aRemoveTime);
            case 'bedNumber':
            default:
                return a.bedNumber.localeCompare(b.bedNumber, undefined, { numeric: true });
        }
    });

    return patients;
  }, [state.patients, searchTerm, filterTeam, sortBy]);

  if (state.loading) {
      return (
          <div className="flex justify-center items-center min-h-screen">
              <div className="text-xl font-semibold">載入中...</div>
          </div>
      )
  }

  return (
    <div className="pb-16">
      <Header 
        title={
          <button onClick={handleRefresh} className="text-xl font-bold hover:opacity-80 transition-opacity">
            患者管理
          </button>
        } 
        actions={
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/dashboard')} className="py-1 px-3 rounded-md hover:bg-blue-700 text-sm font-semibold">
               控制台
            </button>
            <button onClick={() => navigate('/add')} className="py-1 px-3 rounded-md hover:bg-blue-700 text-sm font-semibold">
               新增患者
            </button>
          </div>
        } 
      />
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋患者姓名或病歷號"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-16"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => setIsScanning(true)} 
            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 hover:text-blue-600 mb-4"
            aria-label="Scan QR Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m-4 12h2a2 2 0 002-2v-2M9 9h6v6H9V9z" /></svg>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          <select onChange={e => setFilterTeam(e.target.value === 'all' ? 'all' : Number(e.target.value))} value={filterTeam} className="p-2 border rounded-lg bg-white text-black">
            <option value="all">所有組別</option>
            {teams.map(team => <option key={team} value={team}>{`第 ${team} 組`}</option>)}
          </select>
          <select onChange={e => setSortBy(e.target.value as any)} value={sortBy} className="p-2 border rounded-lg bg-white text-black">
            <option value="bedNumber">依床號排序</option>
            <option value="treatmentTime">依治療時間排序</option>
            <option value="removalTime">依拔針時間排序</option>
          </select>
          <span className="text-gray-700 font-medium">
            人數：{filteredAndSortedPatients.length}
          </span>
        </div>
        <div>
          {filteredAndSortedPatients.map(p => 
            <PatientCard 
                key={p.id} 
                patient={p} 
                onCompleteRemoval={handleCompleteRemovalClick}
                onDeletePatient={handleDeletePatient}
            />
          )}
        </div>
      </div>
      {isScanning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-2 w-11/12 max-w-md">
            <QrScannerComponent onScan={handleScan} autoStart showCloseButton={false} />
            <button onClick={() => setIsScanning(false)} className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors mt-2">
              關閉
            </button>
          </div>
        </div>
      )}
      
      {/* Removal Confirmation Modal */}
      {confirmingRemovalInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-black">確認完成拔針？</h3>
            <p className="text-gray-600 mb-6">確定要記錄此治療的拔針時間嗎？此動作無法復原。</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setConfirmingRemovalInfo(null)} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">取消</button>
              <button onClick={confirmCompleteRemoval} className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">確定</button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {deletingPatientInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-black">確認刪除患者？</h3>
            <p className="text-gray-600 mb-6">
              確定要刪除患者 <span className="font-bold">{deletingPatientInfo.name}</span> 的資料嗎？此動作無法復原。
            </p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setDeletingPatientInfo(null)} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">取消</button>
              <button onClick={confirmDeletePatient} className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">確定刪除</button>
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

export default PatientListPage;
