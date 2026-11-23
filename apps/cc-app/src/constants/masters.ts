/** The master lists the complaint forms use (CcMasterTypes in the API, plus the platform's Location). */
export const masterTypes = {
  customer: 'Customer',
  modeOfCommunication: 'ModeOfCommunication',
  source: 'ComplaintSource',
  processCategory: 'ProcessCategory',
  detectionStage: 'DetectionStage',
  location: 'Location',
} as const;
