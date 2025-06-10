
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { validateDisputeForm, checkEligibility } from '@/utils/disputeValidation';
import { DisputeFormData, ValidationResult, EligibilityResult } from '@/types/dispute';
import { Info, AlertTriangle, CheckCircle, X } from 'lucide-react';

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

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disputeCategories = [
    'Flight Delay (> 3 hours)',
    'Cancellation without 14 days notice',
    'Lost/damaged baggage',
    'Denied boarding/reaccommodation',
    'Refund Request',
    'Other'
  ];

  const handleInputChange = (field: keyof DisputeFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleValidateStep1 = () => {
    const validation = validateDisputeForm(formData);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        title: "Validation Error",
        description: "Please correct the errors below",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep(2);
    setValidationErrors([]);
  };

  const handleCheckEligibility = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const eligibility = checkEligibility(formData);
      setEligibilityResult(eligibility);
      
      if (eligibility.status === 'eligible') {
        setCurrentStep(3);
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
      
      setIsSubmitting(false);
    }, 1500);
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

    toast({
      title: "Dispute Submitted Successfully",
      description: `Case ID: CS-2025-${Date.now().toString().slice(-6)}`,
    });

    // Generate case summary
    console.log('Case Summary Generated:', {
      caseId: `CS-2025-${Date.now().toString().slice(-6)}`,
      consumerName: formData.consumerName,
      bookingReference: formData.bookingReference,
      flightDetails: `${formData.flightNumber}, ${formData.flightDate}`,
      route: `${formData.origin} → ${formData.destination}`,
      disputeCategory: formData.disputeCategory,
      status: 'Under Review',
      timestamp: new Date().toISOString()
    });
  };

  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null;

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Consumer Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="consumerName">Full Name *</Label>
            <Input
              id="consumerName"
              value={formData.consumerName}
              onChange={(e) => handleInputChange('consumerName', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <Label htmlFor="nationalId">National ID / Passport Number *</Label>
            <Input
              id="nationalId"
              value={formData.nationalId}
              onChange={(e) => handleInputChange('nationalId', e.target.value)}
              placeholder="ID or passport number"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+966 XX XXX XXXX"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Flight & Booking Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bookingReference">Booking Reference *</Label>
            <Input
              id="bookingReference"
              value={formData.bookingReference}
              onChange={(e) => handleInputChange('bookingReference', e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
            />
            <p className="text-sm text-muted-foreground mt-1">6-character alphanumeric code</p>
          </div>
          
          <div>
            <Label htmlFor="flightNumber">Flight Number *</Label>
            <Input
              id="flightNumber"
              value={formData.flightNumber}
              onChange={(e) => handleInputChange('flightNumber', e.target.value.toUpperCase())}
              placeholder="SV123"
            />
          </div>
          
          <div>
            <Label htmlFor="flightDate">Flight Date *</Label>
            <Input
              id="flightDate"
              type="date"
              value={formData.flightDate}
              onChange={(e) => handleInputChange('flightDate', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="origin">Origin Airport *</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => handleInputChange('origin', e.target.value.toUpperCase())}
              placeholder="RUH"
              maxLength={3}
            />
          </div>
          
          <div>
            <Label htmlFor="destination">Destination Airport *</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value.toUpperCase())}
              placeholder="JED"
              maxLength={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dispute Information</h3>
        
        <div>
          <Label htmlFor="disputeCategory">Dispute Category *</Label>
          <Select
            value={formData.disputeCategory}
            onValueChange={(value) => handleInputChange('disputeCategory', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dispute category" />
            </SelectTrigger>
            <SelectContent>
              {disputeCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Please describe your issue in detail..."
            rows={4}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasDocuments"
            checked={formData.hasDocuments}
            onCheckedChange={(checked) => handleInputChange('hasDocuments', checked as boolean)}
          />
          <Label htmlFor="hasDocuments">
            I have supporting documents (boarding pass, receipts, etc.)
          </Label>
        </div>
      </div>

      {renderValidationErrors()}

      <Button onClick={handleValidateStep1} className="w-full">
        Validate & Continue
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Checking Eligibility...</h3>
        
        {eligibilityResult && (
          <Card className="p-6">
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
            
            <h4 className="text-xl font-semibold mb-2">
              {eligibilityResult.status === 'eligible' && 'Eligible for Processing'}
              {eligibilityResult.status === 'invalid' && 'Invalid Submission'}
              {eligibilityResult.status === 'hold' && 'Additional Documents Required'}
            </h4>
            
            <p className="text-muted-foreground mb-4">{eligibilityResult.message}</p>
            
            {eligibilityResult.details && eligibilityResult.details.length > 0 && (
              <div className="text-left">
                <h5 className="font-medium mb-2">Details:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {eligibilityResult.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
          Back to Form
        </Button>
        
        {!eligibilityResult && (
          <Button onClick={handleCheckEligibility} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Checking...' : 'Check Eligibility'}
          </Button>
        )}
        
        {eligibilityResult?.status === 'invalid' && (
          <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
            Correct Issues
          </Button>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Dispute Eligible</h3>
        <p className="text-muted-foreground mb-6">
          Your dispute meets all requirements and can be processed.
        </p>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold mb-4">Consent & Authorization</h4>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm">
            "I, <strong>{formData.consumerName}</strong>, have reviewed all the facts, timeline, and regulatory 
            references related to my dispute. I understand the proposed resolution (refund/compensation) 
            and agree to accept it under GACA regulations. I hereby authorize processing of my claim."
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="consentGiven"
            checked={formData.consentGiven}
            onCheckedChange={(checked) => handleInputChange('consentGiven', checked as boolean)}
          />
          <Label htmlFor="consentGiven" className="text-sm">
            I agree to the terms and authorize processing of my dispute claim
          </Label>
        </div>
        
        <p className="text-xs text-muted-foreground mb-4">
          Date: {new Date().toLocaleDateString()} | Signature: Electronic Consent
        </p>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleFinalSubmit} 
          disabled={!formData.consentGiven}
          className="flex-1"
        >
          Submit Dispute
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dispute Eligibility Form</h1>
        <p className="text-muted-foreground">
          Submit your flight dispute and check eligibility for compensation
        </p>
        
        <div className="flex items-center mt-4 space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {step}
              </div>
              <span className="ml-2 text-sm">
                {step === 1 && 'Information'}
                {step === 2 && 'Eligibility Check'}
                {step === 3 && 'Consent & Submit'}
              </span>
              {step < 3 && <div className="w-8 h-px bg-muted mx-4" />}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </Card>
    </div>
  );
};

export default DisputeForm;
