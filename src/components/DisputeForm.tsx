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
import { Info, AlertTriangle, CheckCircle, X, Shield } from 'lucide-react';
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
      <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-500">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-red-200">
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Submit Dispute Case</h2>
        <p className="text-gray-400">Verify your identity and provide dispute information</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Step 1: Consumer Identity Verification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="consumerName" className="text-gray-300 font-medium">Full Name *</Label>
            <Input
              id="consumerName"
              value={formData.consumerName}
              onChange={(e) => handleInputChange('consumerName', e.target.value)}
              placeholder="Enter full name"
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="nationalId" className="text-gray-300 font-medium">ID/Passport Number *</Label>
            <Input
              id="nationalId"
              value={formData.nationalId}
              onChange={(e) => handleInputChange('nationalId', e.target.value)}
              placeholder="Enter ID or passport number"
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-gray-300 font-medium">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+966xxxxxxxxxx"
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-gray-300 font-medium">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
            />
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <h4 className="text-lg font-medium text-white">Flight & Booking Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="bookingReference" className="text-gray-300 font-medium">Booking Reference *</Label>
              <Input
                id="bookingReference"
                value={formData.bookingReference}
                onChange={(e) => handleInputChange('bookingReference', e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="flightNumber" className="text-gray-300 font-medium">Flight Number *</Label>
              <Input
                id="flightNumber"
                value={formData.flightNumber}
                onChange={(e) => handleInputChange('flightNumber', e.target.value.toUpperCase())}
                placeholder="SV123"
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="flightDate" className="text-gray-300 font-medium">Flight Date *</Label>
              <Input
                id="flightDate"
                type="date"
                value={formData.flightDate}
                onChange={(e) => handleInputChange('flightDate', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="origin" className="text-gray-300 font-medium">Origin Airport *</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value.toUpperCase())}
                placeholder="RUH"
                maxLength={3}
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="destination" className="text-gray-300 font-medium">Destination Airport *</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value.toUpperCase())}
                placeholder="JED"
                maxLength={3}
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="disputeCategory" className="text-gray-300 font-medium">Dispute Category *</Label>
              <Select
                value={formData.disputeCategory}
                onValueChange={(value) => handleInputChange('disputeCategory', value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-2">
                  <SelectValue placeholder="Select dispute category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {disputeCategories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-slate-600">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-300 font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please describe your issue in detail..."
              rows={4}
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasDocuments"
              checked={formData.hasDocuments}
              onCheckedChange={(checked) => handleInputChange('hasDocuments', checked as boolean)}
              className="border-slate-600"
            />
            <Label htmlFor="hasDocuments" className="text-gray-300">
              I have supporting documents (boarding pass, receipts, etc.)
            </Label>
          </div>
        </div>

        {renderValidationErrors()}

        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleValidateStep1} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Verify Identity & Continue
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4 text-white">Checking Eligibility...</h3>
        
        {eligibilityResult && (
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
            
            <h4 className="text-xl font-semibold mb-2">
              {eligibilityResult.status === 'eligible' && 'Eligible for Processing'}
              {eligibilityResult.status === 'invalid' && 'Invalid Submission'}
              {eligibilityResult.status === 'hold' && 'Additional Documents Required'}
            </h4>
            
            <p className="text-gray-400 mb-4">{eligibilityResult.message}</p>
            
            {eligibilityResult.details && eligibilityResult.details.length > 0 && (
              <div className="text-left">
                <h5 className="font-medium mb-2">Details:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
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
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 bg-slate-700 text-white hover:bg-slate-600">
          Back to Form
        </Button>
        
        {!eligibilityResult && (
          <Button onClick={handleCheckEligibility} disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? 'Checking...' : 'Check Eligibility'}
          </Button>
        )}
        
        {eligibilityResult?.status === 'invalid' && (
          <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 bg-slate-700 text-white hover:bg-slate-600">
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
        <h3 className="text-2xl font-semibold mb-2 text-white">Dispute Eligible</h3>
        <p className="text-gray-400 mb-6">
          Your dispute meets all requirements and can be processed.
        </p>
      </div>

      <Card className="p-6 bg-slate-800 border-slate-700 text-white">
        <h4 className="font-semibold mb-4">Consent & Authorization</h4>
        
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-300">
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
            className="border-slate-600"
          />
          <Label htmlFor="consentGiven" className="text-gray-300">
            I agree to the terms and authorize processing of my dispute claim
          </Label>
        </div>
        
        <p className="text-xs text-gray-400 mb-4">
          Date: {new Date().toLocaleDateString()} | Signature: Electronic Consent
        </p>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1 bg-slate-700 text-white hover:bg-slate-600">
          Back
        </Button>
        <Button 
          onClick={handleFinalSubmit} 
          disabled={!formData.consentGiven}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          Submit Dispute
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />
      
      <div className="flex-1 p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default DisputeForm;
