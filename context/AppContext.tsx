
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { AppState, AppAction, AppContextType, Patient, TreatmentSession, Settings } from '../types';
import { INITIAL_SETTINGS } from '../constants';
import { db } from '../firebase';
// FIX: Removed v9 modular imports as we are switching to v8 namespaced API syntax
// to resolve initialization errors.
import { v4 as uuidv4 } from 'uuid'; // Simple way to generate unique IDs for treatments


const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PATIENTS':
      return { ...state, patients: action.payload, loading: false };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_SELECTED_ACUPOINTS':
      return { ...state, selectedAcupoints: action.payload };
    default:
      return state;
  }
};

const initialState: AppState = {
  patients: [],
  settings: INITIAL_SETTINGS,
  selectedAcupoints: [],
  loading: true,
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });

    // Listen for patient data
    // FIX: Switched to v8 syntax for queries and snapshots.
    const q = db.collection('patients').orderBy('bedNumber');
    const unsubscribePatients = q.onSnapshot((querySnapshot) => {
      const patientsData = querySnapshot.docs.map(doc => {
        // Create a plain JavaScript object from the Firestore data to prevent circular reference issues.
        // This is a robust way to ensure the data is serializable and clean before storing in state.
        const plainData = JSON.parse(JSON.stringify(doc.data()));
        return { id: doc.id, ...plainData } as Patient;
      });
      dispatch({ type: 'SET_PATIENTS', payload: patientsData });
    }, (error) => {
      console.error("Error fetching patients: ", error);
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    // Fetch settings data
    // FIX: Switched to v8 syntax for document references and snapshots.
    const settingsDocRef = db.collection('settings').doc('main');
    const unsubscribeSettings = settingsDocRef.onSnapshot((docSnap) => {
        // FIX: Switched to v8's `exists` property instead of `exists()` method.
        if (docSnap.exists) {
            // Also clean settings data to be safe.
            const plainSettings = JSON.parse(JSON.stringify(docSnap.data()));
            dispatch({ type: 'SET_SETTINGS', payload: plainSettings as Settings });
        } else {
            // If settings don't exist, create them with initial values
            // FIX: Switched to v8's `set()` method.
            settingsDocRef.set(INITIAL_SETTINGS);
            dispatch({ type: 'SET_SETTINGS', payload: INITIAL_SETTINGS });
        }
    });

    return () => {
      unsubscribePatients();
      unsubscribeSettings();
    };
  }, []);
  
  const addPatient = async (patient: Omit<Patient, 'id' | 'treatments'>) => {
    // FIX: Switched to v8's `add()` method on a collection.
    await db.collection('patients').add({ ...patient, treatments: [] });
  };

  const updatePatient = async (patient: Patient) => {
    // FIX: Switched to v8 syntax for doc reference and update.
    const patientDoc = db.collection('patients').doc(patient.id);
    const { id, ...patientData } = patient;
    await patientDoc.update(patientData);
  };
  
  const deletePatient = async (patientId: string) => {
    // FIX: Switched to v8's `delete()` method on a document reference.
    await db.collection('patients').doc(patientId).delete();
  };
  
  const addTreatment = async (patientId: string, session: Omit<TreatmentSession, 'id'>) => {
    const patient = state.patients.find(p => p.id === patientId);
    if (!patient) {
        console.error("Patient not found in state, cannot add treatment.");
        return;
    }
    // FIX: Switched to v8 syntax for doc reference and update.
    const patientDocRef = db.collection('patients').doc(patientId);
    const newSession = { ...session, id: uuidv4() };
    const updatedTreatments = [newSession, ...(patient.treatments || [])];
    await patientDocRef.update({ treatments: updatedTreatments });
  };

  const completeRemoval = async (patientId: string, sessionId: string) => {
      const patient = state.patients.find(p => p.id === patientId);
      if (!patient) {
        console.error("Patient not found in state, cannot complete removal.");
        return;
      }
      // FIX: Switched to v8 syntax for doc reference and update.
      const patientDocRef = db.collection('patients').doc(patientId);
      const updatedTreatments = patient.treatments.map(t =>
          t.id === sessionId ? { ...t, removalTime: new Date().toLocaleString('zh-TW', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-') } : t
      );
      await patientDocRef.update({ treatments: updatedTreatments });
  };

  const updateTreatment = async (patientId: string, session: TreatmentSession) => {
      const patient = state.patients.find(p => p.id === patientId);
      if (!patient) {
        console.error("Patient not found in state, cannot update treatment.");
        return;
      }
      // FIX: Switched to v8 syntax for doc reference and update.
      const patientDocRef = db.collection('patients').doc(patientId);
      const updatedTreatments = patient.treatments.map(t => t.id === session.id ? session : t);
      await patientDocRef.update({ treatments: updatedTreatments });
  };
  
  const updateSettings = async (settings: Settings) => {
      // FIX: Switched to v8 syntax for doc reference and set.
      const settingsDocRef = db.collection('settings').doc('main');
      await settingsDocRef.set(settings);
  };


  return (
    <AppContext.Provider value={{ 
        state, 
        dispatch, 
        addPatient,
        updatePatient,
        deletePatient,
        addTreatment,
        completeRemoval,
        updateTreatment,
        updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
