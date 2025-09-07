
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { AppState, AppAction, AppContextType, Patient, TreatmentSession } from '../types';
import { INITIAL_PATIENTS, INITIAL_SETTINGS } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] };
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PATIENT':
      return {
        ...state,
        patients: state.patients.filter(p => p.id !== action.payload),
      };
    case 'ADD_TREATMENT': {
      const { patientId, session } = action.payload;
      const newSession: TreatmentSession = { ...session, id: Date.now() };
      return {
        ...state,
        patients: state.patients.map(p =>
          p.id === patientId ? { ...p, treatments: [newSession, ...p.treatments] } : p
        ),
      };
    }
    case 'COMPLETE_REMOVAL': {
      const { patientId, sessionId } = action.payload;
      return {
        ...state,
        patients: state.patients.map(p => {
          if (p.id === patientId) {
            return {
              ...p,
              treatments: p.treatments.map(t =>
                t.id === sessionId ? { ...t, removalTime: new Date().toLocaleString('zh-TW', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-') } : t
              ),
            };
          }
          return p;
        }),
      };
    }
    case 'UPDATE_TREATMENT': {
        const { patientId, session } = action.payload;
        return {
            ...state,
            patients: state.patients.map(p => {
                if (p.id === patientId) {
                    return {
                        ...p,
                        treatments: p.treatments.map(t => t.id === session.id ? session : t)
                    }
                }
                return p;
            })
        }
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_SELECTED_ACUPOINTS':
      return { ...state, selectedAcupoints: action.payload };
    default:
      return state;
  }
};

const initialState: AppState = {
  patients: INITIAL_PATIENTS,
  settings: INITIAL_SETTINGS,
  selectedAcupoints: [],
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
