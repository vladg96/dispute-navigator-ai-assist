
export interface DisputeFormData {
  consumerName: string;
  nationalId: string;
  phone: string;
  email: string;
  bookingReference: string;
  flightNumber: string;
  flightDate: string;
  origin: string;
  destination: string;
  disputeCategory: string;
  description: string;
  hasDocuments: boolean;
  consentGiven: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EligibilityResult {
  status: 'eligible' | 'invalid' | 'hold';
  message: string;
  details?: string[];
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
