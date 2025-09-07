
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

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    medicalRecordNumber: '12345678',
    name: '王小明',
    gender: '男性',
    bedNumber: '101-1',
    team: 1,
    treatments: [
      {
        id: 1,
        startTime: '2023-10-26 10:00',
        removalTime: '2023-10-26 10:30',
        needleCounts: { [BodyPart.Head]: 2, [BodyPart.Torso]: 0, [BodyPart.RightUpperLimb]: 4, [BodyPart.RightLowerLimb]: 0, [BodyPart.LeftUpperLimb]: 0, [BodyPart.LeftLowerLimb]: 0 },
        totalNeedles: 6,
        acupoints: ['1', '5', '12'],
        attendingPhysician: '1組醫師A'
      },
       {
        id: 2,
        startTime: '2023-10-27 14:00',
        needleCounts: { [BodyPart.Head]: 0, [BodyPart.Torso]: 8, [BodyPart.RightUpperLimb]: 0, [BodyPart.RightLowerLimb]: 0, [BodyPart.LeftUpperLimb]: 0, [BodyPart.LeftLowerLimb]: 0 },
        totalNeedles: 8,
        acupoints: ['20', '21', '22', '23'],
        attendingPhysician: '1組醫師B'
      }
    ]
  },
  {
    id: 2,
    medicalRecordNumber: '87654321',
    name: '陳美麗',
    gender: '女性',
    bedNumber: '102-3',
    team: 2,
    treatments: []
  },
    {
    id: 3,
    medicalRecordNumber: '99988877',
    name: '林建國',
    gender: '男性',
    bedNumber: '101-2',
    team: 1,
    treatments: []
  }
];
