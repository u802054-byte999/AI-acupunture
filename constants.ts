
import { BodyPart, Patient, Settings } from './types';

export const BODY_PARTS: BodyPart[] = [
  BodyPart.Head,
  BodyPart.Torso,
  BodyPart.RightUpperLimb,
  BodyPart.RightLowerLimb,
  BodyPart.LeftUpperLimb,
  BodyPart.LeftLowerLimb,
];

export const TEAMS = Array.from({ length: 10 }, (_, i) => i + 1);

export const INITIAL_SETTINGS: Settings = {
  acupointCount: 40,
  acupointNames: Object.fromEntries(Array.from({ length: 40 }, (_, i) => [i + 1, `${i + 1}`])),
  physicians: Object.fromEntries(TEAMS.map(team => [team, [`${team}組醫師A`, `${team}組醫師B`, `${team}組醫師C`]])),
};

// Initial patient data is now managed in Firestore and will be fetched from there.
export const INITIAL_PATIENTS: Patient[] = [];
