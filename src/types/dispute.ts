export interface DisputeFormData {
  consumerName: string;
  nationalId: string;
  phone: string;
  email: string;
  idPhoto: File | null;
  bookingReference: string;
  flightNumber: string;
  flightDate: string;
  origin: string;
  destination: string;
  disputeCategory: string;
  description: string;
  hasDocuments: boolean;
  consentGiven: boolean;
  uploadedFiles: File[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  everworkerResult?: EverworkerValidationResult;
}

export interface EverworkerValidationResult {
  isValid: boolean;
  confidence: number;
  validatedFields: {
    name: boolean;
    nationalId: boolean;
    phone: boolean;
    email: boolean;
  };
  warnings: string[];
  errors: string[];
  riskScore: number;
  recommendations: string[];
}

export interface EligibilityResult {
  status: 'eligible' | 'invalid' | 'hold';
  message: string;
  details: {
    applicableRegulations: string;
    claimValuation: string;
    eligibilityAssessment: string;
    consumerFriendlyVersion: string;
  };
}

export interface CaseSummary {
  caseId: string;
  dateOpened: string;
  consumerName: string;
  bookingReference: string;
  flightDetails: string;
  route: string;
  disputeCategory: string;
  summaryOfFacts: string;
  requestedResolution: string;
  supportingDocumentation: string[];
  regulatoryReferences: string[];
  ticketFareBasis: string;
  currentStatus: string;
  assignedHandler: string;
  nextActionDue: string;
  finalOutput: string;
}
