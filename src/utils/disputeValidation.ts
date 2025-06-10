
import { DisputeFormData, ValidationResult, EligibilityResult } from '@/types/dispute';

export const validateDisputeForm = (formData: DisputeFormData): ValidationResult => {
  const errors: string[] = [];

  // Consumer Identity & Contact validation
  if (!formData.consumerName.trim()) {
    errors.push("Full name is required");
  }

  if (!formData.nationalId.trim()) {
    errors.push("National ID or Passport number is required");
  } else if (formData.nationalId.length < 8) {
    errors.push("National ID or Passport number must be at least 8 characters");
  }

  if (!formData.phone.trim()) {
    errors.push("Phone number is required");
  } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
    errors.push("Please enter a valid phone number");
  }

  if (!formData.email.trim()) {
    errors.push("Email address is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("Please enter a valid email address");
  }

  // Booking Reference validation
  if (!formData.bookingReference.trim()) {
    errors.push("Booking reference is required");
  } else if (!/^[A-Z0-9]{6}$/.test(formData.bookingReference)) {
    errors.push("Booking reference must be exactly 6 alphanumeric characters");
  }

  // Flight Details validation
  if (!formData.flightNumber.trim()) {
    errors.push("Flight number is required");
  } else if (!/^SV\d+$/i.test(formData.flightNumber)) {
    errors.push("Flight number must start with 'SV' followed by numbers");
  }

  if (!formData.flightDate) {
    errors.push("Flight date is required");
  } else {
    const flightDate = new Date(formData.flightDate);
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

    if (flightDate < twelveMonthsAgo) {
      errors.push("Flight date must be within the last 12 months");
    }

    if (flightDate > today) {
      errors.push("Flight date cannot be in the future");
    }
  }

  if (!formData.origin.trim()) {
    errors.push("Origin airport is required");
  } else if (!/^[A-Z]{3}$/.test(formData.origin)) {
    errors.push("Origin airport must be a 3-letter airport code");
  }

  if (!formData.destination.trim()) {
    errors.push("Destination airport is required");
  } else if (!/^[A-Z]{3}$/.test(formData.destination)) {
    errors.push("Destination airport must be a 3-letter airport code");
  }

  if (formData.origin === formData.destination) {
    errors.push("Origin and destination airports cannot be the same");
  }

  // Dispute Category validation
  if (!formData.disputeCategory) {
    errors.push("Dispute category is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const checkEligibility = (formData: DisputeFormData): EligibilityResult => {
  const details: string[] = [];

  // Check if all mandatory fields are present
  if (!formData.consumerName || !formData.nationalId || !formData.phone || 
      !formData.email || !formData.bookingReference || !formData.flightNumber) {
    return {
      status: 'invalid',
      message: 'Missing required consumer information or booking details',
      details: ['Please ensure all mandatory fields are completed']
    };
  }

  // Simulate booking verification
  const bookingExists = simulateBookingCheck(formData.bookingReference);
  if (!bookingExists) {
    return {
      status: 'invalid',
      message: 'Booking reference not found in system',
      details: [
        'The provided booking reference does not match any reservation in our system',
        'Please verify the booking reference and try again'
      ]
    };
  }

  // Check if flight date is within allowable window
  const flightDate = new Date(formData.flightDate);
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

  if (flightDate < twelveMonthsAgo) {
    return {
      status: 'invalid',
      message: 'Flight date is outside the allowable complaint period',
      details: [
        'Under aviation regulations, complaints must be filed within 12 months of the incident',
        `Your flight was on ${flightDate.toLocaleDateString()}, which exceeds this timeframe`
      ]
    };
  }

  // Check if category is covered under policy
  const coveredCategories = [
    'Flight Delay (> 3 hours)',
    'Cancellation without 14 days notice',
    'Lost/damaged baggage',
    'Denied boarding/reaccommodation'
  ];

  if (!coveredCategories.includes(formData.disputeCategory)) {
    if (formData.disputeCategory === 'Other') {
      return {
        status: 'invalid',
        message: 'Dispute category not covered under current policy',
        details: [
          'The selected category may not be eligible for compensation',
          'Please review covered categories or contact customer service for clarification'
        ]
      };
    }
  }

  // Check for supporting documents
  if (!formData.hasDocuments) {
    return {
      status: 'hold',
      message: 'Supporting documentation required to proceed',
      details: [
        'Please upload boarding pass, ticket receipt, or other relevant documents',
        'Your case will be placed on hold until documentation is received',
        'You can upload documents through our customer portal'
      ]
    };
  }

  // Check consumer protection regulation applicability
  const isEligibleRoute = checkConsumerProtection(formData.origin, formData.destination);
  if (!isEligibleRoute) {
    return {
      status: 'hold',
      message: 'Case flagged for manual review due to regulatory jurisdiction',
      details: [
        'Flight route may fall outside standard consumer protection regulations',
        'Case will be reviewed by our regulatory compliance team',
        'Expected review time: 3-5 business days'
      ]
    };
  }

  // If all checks pass
  details.push('All eligibility requirements met');
  details.push('Case will proceed to compensation calculation');
  details.push('Expected processing time: 5-10 business days');

  return {
    status: 'eligible',
    message: 'Your dispute is eligible for processing under GACA regulations',
    details
  };
};

const simulateBookingCheck = (bookingRef: string): boolean => {
  // Simulate database lookup - in real implementation, this would call an API
  const validBookings = ['ABC123', 'DEF456', 'GHI789', 'SVX7YQ'];
  return validBookings.includes(bookingRef);
};

const checkConsumerProtection = (origin: string, destination: string): boolean => {
  // Check if flight falls under Saudi consumer protection regulations
  const saudiAirports = ['RUH', 'JED', 'DMM', 'AHB', 'TIF', 'MED', 'GIZ', 'AQI'];
  
  // If either origin or destination is in Saudi Arabia, it's covered
  return saudiAirports.includes(origin) || saudiAirports.includes(destination);
};
