
import type { Dispatch } from 'react';

export enum BodyPart {
  Head = '頭部',
  Torso = '軀幹',
  RightUpperLimb = '右上肢',
  RightLowerLimb = '右下肢',
  LeftUpperLimb = '左上肢',
  LeftLowerLimb = '左下肢',
}

export interface TreatmentSession {
  id: string; // Changed from number to string for Firestore compatibility
  startTime: string;
  removalTime?: string;
  needleCounts: Record<BodyPart, number>;
  totalNeedles: number;
  acupoints: string[];
  attendingPhysician?: string;
}

export interface Patient {
  id: string; // Changed from number to string for Firestore compatibility
  medicalRecordNumber: string;
  name: string;
  gender: '男性' | '女性' | '其他';
  bedNumber: string;
  team: number;
  treatments: TreatmentSession[];
}

export interface Settings {
  acupointCount: number;
  acupointNames: Record<number, string>;
  physicians: Record<number, string[]>; // team number -> [physician1, physician2, physician3]
}

export interface AppState {
  patients: Patient[];
  settings: Settings;
  selectedAcupoints: string[];
  loading: boolean;
}

// Actions are replaced by direct Firestore calls, but we can keep selectedAcupoints in local state.
export type AppAction =
  | { type: 'SET_SELECTED_ACUPOINTS'; payload: string[] }
  | { type: 'SET_PATIENTS'; payload: Patient[] }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_LOADING'; payload: boolean };


export interface AppContextType {
  state: AppState;
  // FIX: Use Dispatch type from react to resolve namespace error.
  dispatch: Dispatch<AppAction>;
  addPatient: (patient: Omit<Patient, 'id' | 'treatments'>) => Promise<void>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  addTreatment: (patientId: string, session: Omit<TreatmentSession, 'id'>) => Promise<void>;
  completeRemoval: (patientId: string, sessionId: string) => Promise<void>;
  updateTreatment: (patientId: string, session: TreatmentSession) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
}