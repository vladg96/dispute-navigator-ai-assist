import React, { useState } from 'react';
import { IntegrailService } from '../services/integrailService';

interface ComplaintDetailsProps {
  onNext: (data: { description: string; flightNumber: string }) => void;
}

const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({ onNext }) => {
  const [formData, setFormData] = useState({
    description: '',
    flightNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    setSubmitting(true);
    try {
      // Start background eligibility check
      await IntegrailService.startEligibilityCheck(formData.description, formData.flightNumber);
      
      // Navigate to next step
      onNext(formData);
    } catch (error) {
      console.error('Error starting eligibility check:', error);
      setError('Failed to start eligibility check. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default ComplaintDetails; 