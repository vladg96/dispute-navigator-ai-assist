import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { checkEligibility } from '@/utils/disputeValidation';
import { 
  validateConsumerIdentity, 
  validateFlightData, 
  validateComplaintDetails, 
  validateDocuments,
  verifyBookingReference 
} from '@/utils/validationSteps';
import { DisputeFormData, StepValidationResult, EligibilityResult } from '@/types/dispute';
import { 
  IdentityValidationStep,
  FlightDataValidationStep,
  ComplaintDetailsStep,
  DocumentUploadStep
} from './ValidationSteps';
import { CaseSummaryStep } from './CaseSummaryStep';
import { DocumentAnalysisStep } from './DocumentAnalysisStep';
import { Info, AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Sidebar from './Sidebar';

const DisputeForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<DisputeFormData>({
    consumerName: '',
    nationalId: '',
    phone: '',
    email: '',
    bookingReference: '',
    flightNumber: '',
    flightDate: '',
    origin: '',
    destination: '',
    disputeCategory: '',
    description: '',
    hasDocuments: false,
    consentGiven: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [validationResults, setValidationResults] = useState<Record<number, StepValidationResult>>({});
  const [bookingVerificationResult, setBookingVerificationResult] = useState<any>(null);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  const totalSteps = 4; // Keep original validation steps count

  const handleInputChange = (field: keyof DisputeFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation results when user starts editing
    if (validationResults[currentStep]) {
      setValidationResults(prev => {
        const newResults = { ...prev };
        delete newResults[currentStep];
        return newResults;
      });
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Only allow navigation to steps that have been reached or are current
    if (stepNumber <= Math.max(currentStep, 8)) {
      setCurrentStep(stepNumber);
      toast({
        title: "Navigation",
        description: `Switched to step ${stepNumber}`,
      });
    }
  };

  const handleStepValidation = async (stepNumber: number, onSuccess?: () => void) => {
    setIsValidating(true);
    
    try {
      let validationResult: StepValidationResult;

      switch (stepNumber) {
        case 1:
          validationResult = await validateConsumerIdentity(formData);
          break;
        case 2:
          validationResult = validateFlightData(formData);
          break;
        case 3:
          validationResult = validateComplaintDetails(formData);
          break;
        case 4:
          validationResult = validateDocuments(formData);
          break;
        default:
          return;
      }

      setValidationResults(prev => ({
        ...prev,
        [stepNumber]: validationResult
      }));

      if (validationResult.isValid) {
        onSuccess?.();
        toast({
          title: "Validation Successful",
          description: `Step ${stepNumber} validation completed successfully.`,
        });
      } else {
        toast({
          title: "Validation Error",
          description: "Please correct the errors below",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: "An error occurred during validation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleVerifyBooking = async () => {
    if (!formData.bookingReference || formData.bookingReference.length !== 6) {
      toast({
        title: "Invalid Booking Reference",
        description: "Please enter a valid 6-character booking reference",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await verifyBookingReference(formData.bookingReference);
      setBookingVerificationResult(result);
      
      if (result.exists) {
        toast({
          title: "Booking Verified",
          description: "Your booking reference has been successfully verified.",
        });
      } else {
        toast({
          title: "Booking Not Found",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to verify booking reference. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      handleStepValidation(currentStep, () => {
        if (currentStep === 2 && !bookingVerificationResult?.exists) {
          toast({
            title: "Booking Verification Required",
            description: "Please verify your booking reference before proceeding.",
            variant: "destructive"
          });
          return;
        }
        setCurrentStep(prev => prev + 1);
      });
    } else {
      // Final validation step - proceed to eligibility check
      handleStepValidation(currentStep, () => {
        handleCheckEligibility();
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCheckEligibility = () => {
    setIsCheckingEligibility(true);
    setCurrentStep(5); // Move to eligibility check step
    
    setTimeout(() => {
      const eligibility = checkEligibility(formData);
      setEligibilityResult(eligibility);
      
      if (eligibility.status === 'eligible') {
        setCurrentStep(6); // Move to final consent step
        toast({
          title: "Eligible for Processing",
          description: "Your dispute meets all requirements and will be processed.",
        });
      } else {
        toast({
          title: eligibility.status === 'invalid' ? "Invalid Submission" : "Additional Documents Required",
          description: eligibility.message,
          variant: eligibility.status === 'invalid' ? "destructive" : "default"
        });
      }
      
      setIsCheckingEligibility(false);
    }, 2000);
  };

  const handleFinalSubmit = () => {
    if (!formData.consentGiven) {
      toast({
        title: "Consent Required",
        description: "You must provide consent to proceed with the dispute.",
        variant: "destructive"
      });
      return;
    }

    const caseId = `CS-2025-${Date.now().toString().slice(-6)}`;
    
    toast({
      title: "Dispute Submitted Successfully",
      description: `Case ID: ${caseId}`,
    });

    console.log('Case Summary Generated:', {
      caseId,
      consumerName: formData.consumerName,
      bookingReference: formData.bookingReference,
      flightDetails: `${formData.flightNumber}, ${formData.flightDate}`,
      route: `${formData.origin} → ${formData.destination}`,
      disputeCategory: formData.disputeCategory,
      status: 'Under Review',
      timestamp: new Date().toISOString()
    });

    // Navigate to case summary after consent
    setCurrentStep(7);
  };

  const renderValidationSteps = () => {
    const commonProps = {
      formData,
      onInputChange: handleInputChange,
      onNext: handleNext,
      onBack: currentStep > 1 ? handleBack : undefined,
      validationResult: validationResults[currentStep],
      stepNumber: currentStep,
      totalSteps
    };

    switch (currentStep) {
      case 1:
        return <IdentityValidationStep {...commonProps} isValidating={isValidating} />;
      case 2:
        return (
          <FlightDataValidationStep 
            {...commonProps}
            onVerifyBooking={handleVerifyBooking}
            bookingVerificationResult={bookingVerificationResult}
            isValidating={isValidating}
          />
        );
      case 3:
        return <ComplaintDetailsStep {...commonProps} />;
      case 4:
        return <DocumentUploadStep {...commonProps} />;
      default:
        return null;
    }
  };

  const renderEligibilityCheck = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
        <h3 className="text-2xl font-semibold mb-2 text-white">
          {isCheckingEligibility ? 'Checking Eligibility...' : 'Eligibility Assessment Complete'}
        </h3>
        <p className="text-gray-400 mb-6">
          {isCheckingEligibility 
            ? 'Running validation against GACA regulations and airline policies...'
            : 'Your dispute has been assessed for eligibility'
          }
        </p>
      </div>

      {eligibilityResult && !isCheckingEligibility && (
        <Card className="p-6 bg-slate-800 border-slate-700 text-white">
          <div className="flex items-center justify-center mb-4">
            {eligibilityResult.status === 'eligible' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {eligibilityResult.status === 'invalid' && (
              <X className="h-12 w-12 text-red-500" />
            )}
            {eligibilityResult.status === 'hold' && (
              <Info className="h-12 w-12 text-yellow-500" />
            )}
          </div>
          
          <h4 className="text-xl font-semibold mb-2 text-center">
            {eligibilityResult.status === 'eligible' && 'Eligible for Processing'}
            {eligibilityResult.status === 'invalid' && 'Invalid Submission'}
            {eligibilityResult.status === 'hold' && 'On Hold - Additional Documents Required'}
          </h4>
          
          <p className="text-gray-400 mb-4 text-center">{eligibilityResult.message}</p>
          
          {eligibilityResult.details && eligibilityResult.details.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h5 className="font-medium mb-2">Details:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                {eligibilityResult.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(1)} 
              className="flex-1 bg-slate-700 text-white hover:bg-slate-600"
            >
              Back to Form
            </Button>
            
            {eligibilityResult.status === 'eligible' && (
              <Button 
                onClick={() => setCurrentStep(6)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Proceed to Consent
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  const renderFinalConsent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2 text-white">Final Consent & Submission</h3>
        <p className="text-gray-400 mb-6">
          Your dispute has been validated and is ready for submission.
        </p>
      </div>

      <Card className="p-6 bg-slate-800 border-slate-700 text-white">
        <h4 className="font-semibold mb-4">Consumer Consent & Authorization</h4>
        
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-300">
            "I, <strong>{formData.consumerName}</strong>, have reviewed all the facts, timeline, and regulatory 
            references related to my dispute. I understand that my case will be processed under GACA regulations 
            and airline consumer protection policies. I hereby authorize the processing of my dispute claim and 
            agree to the terms and conditions of the dispute resolution process."
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="consentGiven"
            checked={formData.consentGiven}
            onCheckedChange={(checked) => handleInputChange('consentGiven', checked as boolean)}
            className="border-slate-600"
          />
          <Label htmlFor="consentGiven" className="text-gray-300">
            I agree to the terms and authorize processing of my dispute claim
          </Label>
        </div>
        
        <p className="text-xs text-gray-400 mb-6">
          Date: {new Date().toLocaleDateString()} | Electronic Consent Timestamp: {new Date().toISOString()}
        </p>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(5)} 
            className="flex-1 bg-slate-700 text-white hover:bg-slate-600"
          >
            Back to Eligibility
          </Button>
          <Button 
            onClick={handleFinalSubmit} 
            disabled={!formData.consentGiven}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Submit Dispute Case
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar currentStep={currentStep} onStepClick={handleStepClick} />
      
      <div className="flex-1 p-8">
        {currentStep <= totalSteps && renderValidationSteps()}
        {currentStep === 5 && renderEligibilityCheck()}
        {currentStep === 6 && renderFinalConsent()}
        {currentStep === 7 && (
          <CaseSummaryStep
            formData={formData}
            onNext={() => setCurrentStep(8)}
            onBack={() => setCurrentStep(6)}
            stepNumber={7}
            totalSteps={8}
          />
        )}
        {currentStep === 8 && (
          <DocumentAnalysisStep
            formData={formData}
            onNext={() => {
              toast({
                title: "Analysis Complete",
                description: "Your dispute case has been fully processed and submitted.",
              });
            }}
            onBack={() => setCurrentStep(7)}
            stepNumber={8}
            totalSteps={8}
          />
        )}
      </div>
    </div>
  );
};

export default DisputeForm;
