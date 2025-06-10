
import { DisputeFormData } from '@/types/dispute';

export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Step 1: Consumer Identity & Contact Validation
export const validateConsumerIdentity = (formData: Partial<DisputeFormData>): StepValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Full name validation
  if (!formData.consumerName?.trim()) {
    errors.push("Full name is required");
  } else if (formData.consumerName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long");
  }

  // National ID/Passport validation
  if (!formData.nationalId?.trim()) {
    errors.push("National ID or Passport number is required");
  } else if (formData.nationalId.length < 8) {
    errors.push("National ID or Passport number must be at least 8 characters");
  } else if (!/^[A-Za-z0-9]+$/.test(formData.nationalId)) {
    errors.push("National ID or Passport number must contain only letters and numbers");
  }

  // Phone validation
  if (!formData.phone?.trim()) {
    errors.push("Phone number is required");
  } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
    errors.push("Please enter a valid phone number (minimum 10 digits)");
  }

  // Email validation
  if (!formData.email?.trim()) {
    errors.push("Email address is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("Please enter a valid email address");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Step 2: Flight & Booking Data Validation
export const validateFlightData = (formData: Partial<DisputeFormData>): StepValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Booking reference validation
  if (!formData.bookingReference?.trim()) {
    errors.push("Booking reference is required");
  } else if (!/^[A-Z0-9]{6}$/.test(formData.bookingReference)) {
    errors.push("Booking reference must be exactly 6 alphanumeric characters");
  }

  // Flight number validation
  if (!formData.flightNumber?.trim()) {
    errors.push("Flight number is required");
  } else if (!/^SV\d+$/i.test(formData.flightNumber)) {
    errors.push("Flight number must start with 'SV' followed by numbers (e.g., SV123)");
  }

  // Flight date validation
  if (!formData.flightDate) {
    errors.push("Flight date is required");
  } else {
    const flightDate = new Date(formData.flightDate);
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

    if (flightDate < twelveMonthsAgo) {
      errors.push("Flight date must be within the last 12 months for complaint eligibility");
    }

    if (flightDate > today) {
      errors.push("Flight date cannot be in the future");
    }

    // Warning for flights more than 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    if (flightDate < sixMonthsAgo && flightDate >= twelveMonthsAgo) {
      warnings.push("Flight is older than 6 months - processing may take longer");
    }
  }

  // Origin airport validation
  if (!formData.origin?.trim()) {
    errors.push("Origin airport is required");
  } else if (!/^[A-Z]{3}$/.test(formData.origin)) {
    errors.push("Origin airport must be a 3-letter airport code (e.g., RUH)");
  }

  // Destination airport validation
  if (!formData.destination?.trim()) {
    errors.push("Destination airport is required");
  } else if (!/^[A-Z]{3}$/.test(formData.destination)) {
    errors.push("Destination airport must be a 3-letter airport code (e.g., JED)");
  }

  // Route validation
  if (formData.origin && formData.destination && formData.origin === formData.destination) {
    errors.push("Origin and destination airports cannot be the same");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Step 3: Complaint Details Validation
export const validateComplaintDetails = (formData: Partial<DisputeFormData>): StepValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Dispute category validation
  if (!formData.disputeCategory) {
    errors.push("Dispute category is required");
  }

  // Description validation
  if (!formData.description?.trim()) {
    errors.push("Description of the issue is required");
  } else if (formData.description.trim().length < 20) {
    errors.push("Please provide a more detailed description (minimum 20 characters)");
  } else if (formData.description.trim().length > 2000) {
    errors.push("Description is too long (maximum 2000 characters)");
  }

  // Category-specific validation
  if (formData.disputeCategory === 'Other') {
    warnings.push("'Other' category may require manual review and longer processing time");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Step 4: Document Upload Validation
export const validateDocuments = (formData: Partial<DisputeFormData>): StepValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Documents requirement check
  if (!formData.hasDocuments) {
    warnings.push("Supporting documents are highly recommended for faster processing");
    warnings.push("Required documents: boarding pass, ticket receipt, communication with airline");
  }

  return {
    isValid: true, // Documents are not mandatory at intake but recommended
    errors,
    warnings
  };
};

// Simulate booking verification (would be API call in real implementation)
export const verifyBookingReference = async (bookingRef: string): Promise<{
  exists: boolean;
  flightDetails?: {
    flightNumber: string;
    date: string;
    route: string;
  };
  message: string;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock database lookup
  const validBookings = [
    { ref: 'ABC123', flight: 'SV246', date: '2025-05-25', route: 'JED → RUH' },
    { ref: 'DEF456', flight: 'SV102', date: '2025-05-20', route: 'RUH → JED' },
    { ref: 'GHI789', flight: 'SV445', date: '2025-05-15', route: 'RUH → DXB' },
    { ref: 'SVX7YQ', flight: 'SV246', date: '2025-05-25', route: 'JED → RUH' }
  ];

  const booking = validBookings.find(b => b.ref === bookingRef);

  if (booking) {
    return {
      exists: true,
      flightDetails: {
        flightNumber: booking.flight,
        date: booking.date,
        route: booking.route
      },
      message: 'Booking reference verified successfully'
    };
  }

  return {
    exists: false,
    message: 'Booking reference not found in system. Please verify the reference number and try again.'
  };
};
