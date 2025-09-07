
export enum BodyPart {
  Head = '頭部',
  Torso = '軀幹',
  RightUpperLimb = '右上肢',
  RightLowerLimb = '右下肢',
  LeftUpperLimb = '左上肢',
  LeftLowerLimb = '左下肢',
}

export interface TreatmentSession {
  id: number;
  startTime: string;
  removalTime?: string;
  needleCounts: Record<BodyPart, number>;
  totalNeedles: number;
  acupoints: string[];
  attendingPhysician?: string;
}

export interface Patient {
  id: number;
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
}

export type AppAction =
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'DELETE_PATIENT'; payload: number }
  | { type: 'ADD_TREATMENT'; payload: { patientId: number; session: Omit<TreatmentSession, 'id'> } }
  | { type: 'COMPLETE_REMOVAL'; payload: { patientId: number; sessionId: number } }
  | { type: 'UPDATE_TREATMENT'; payload: { patientId: number; session: TreatmentSession } }
  | { type: 'UPDATE_SETTINGS'; payload: Settings }
  | { type: 'SET_SELECTED_ACUPOINTS'; payload: string[] };

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}
