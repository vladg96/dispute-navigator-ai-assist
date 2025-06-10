
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { DisputeFormData, StepValidationResult } from '@/types/dispute';
import { CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

interface ValidationStepProps {
  formData: DisputeFormData;
  onInputChange: (field: keyof DisputeFormData, value: string | boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  validationResult?: StepValidationResult;
  isValidating?: boolean;
  stepNumber: number;
  totalSteps: number;
}

// Step 1: Consumer Identity Validation
export const IdentityValidationStep: React.FC<ValidationStepProps> = ({
  formData,
  onInputChange,
  onNext,
  validationResult,
  stepNumber,
  totalSteps
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-white mb-2">
          Step {stepNumber} of {totalSteps}: Identity Verification
        </h3>
        <p className="text-gray-400">Verify your identity and contact information</p>
      </div>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-6">Consumer Identity & Contact</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="consumerName" className="text-gray-300 font-medium">Full Name *</Label>
            <Input
              id="consumerName"
              value={formData.consumerName}
              onChange={(e) => onInputChange('consumerName', e.target.value)}
              placeholder="Enter your full name"
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="nationalId" className="text-gray-300 font-medium">National ID / Passport Number *</Label>
            <Input
              id="nationalId"
              value={formData.nationalId}
              onChange={(e) => onInputChange('nationalId', e.target.value)}
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
              onChange={(e) => onInputChange('phone', e.target.value)}
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
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="email@example.com"
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
            />
          </div>
        </div>

        {validationResult && (
          <div className="mt-6">
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500 mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <Alert className="bg-yellow-900/20 border-yellow-500">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-yellow-200">
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button 
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Validate Identity & Continue
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Step 2: Flight Data Validation
export const FlightDataValidationStep: React.FC<ValidationStepProps & {
  onVerifyBooking: () => void;
  bookingVerificationResult?: any;
}> = ({
  formData,
  onInputChange,
  onNext,
  onBack,
  onVerifyBooking,
  validationResult,
  bookingVerificationResult,
  isValidating,
  stepNumber,
  totalSteps
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-white mb-2">
          Step {stepNumber} of {totalSteps}: Flight & Booking Verification
        </h3>
        <p className="text-gray-400">Verify your flight details and booking information</p>
      </div>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-6">Flight & Booking Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="bookingReference" className="text-gray-300 font-medium">Booking Reference *</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="bookingReference"
                value={formData.bookingReference}
                onChange={(e) => onInputChange('bookingReference', e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              />
              <Button 
                onClick={onVerifyBooking}
                disabled={!formData.bookingReference || formData.bookingReference.length !== 6 || isValidating}
                variant="outline"
                className="bg-slate-700 text-white hover:bg-slate-600"
              >
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="flightNumber" className="text-gray-300 font-medium">Flight Number *</Label>
            <Input
              id="flightNumber"
              value={formData.flightNumber}
              onChange={(e) => onInputChange('flightNumber', e.target.value.toUpperCase())}
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
              onChange={(e) => onInputChange('flightDate', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="origin" className="text-gray-300 font-medium">Origin Airport *</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => onInputChange('origin', e.target.value.toUpperCase())}
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
              onChange={(e) => onInputChange('destination', e.target.value.toUpperCase())}
              placeholder="JED"
              maxLength={3}
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
            />
          </div>
        </div>

        {bookingVerificationResult && (
          <div className="mt-6">
            {bookingVerificationResult.exists ? (
              <Alert className="bg-green-900/20 border-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-200">
                  <div>
                    <p className="font-medium">Booking Verified Successfully!</p>
                    <p>Flight: {bookingVerificationResult.flightDetails?.flightNumber}</p>
                    <p>Date: {bookingVerificationResult.flightDetails?.date}</p>
                    <p>Route: {bookingVerificationResult.flightDetails?.route}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  {bookingVerificationResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {validationResult && (
          <div className="mt-6">
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500 mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <Alert className="bg-yellow-900/20 border-yellow-500">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-yellow-200">
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex-1 bg-slate-700 text-white hover:bg-slate-600"
          >
            Back to Identity
          </Button>
          <Button 
            onClick={onNext}
            disabled={!bookingVerificationResult?.exists}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue to Complaint
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Step 3: Complaint Details
export const ComplaintDetailsStep: React.FC<ValidationStepProps> = ({
  formData,
  onInputChange,
  onNext,
  onBack,
  validationResult,
  stepNumber,
  totalSteps
}) => {
  const disputeCategories = [
    'Flight Delay (> 3 hours)',
    'Cancellation without 14 days notice',
    'Lost/damaged baggage',
    'Denied boarding/reaccommodation',
    'Refund Request',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-white mb-2">
          Step {stepNumber} of {totalSteps}: Complaint Details
        </h3>
        <p className="text-gray-400">Describe your issue and select the appropriate category</p>
      </div>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-6">Dispute Information</h4>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="disputeCategory" className="text-gray-300 font-medium">Dispute Category *</Label>
            <Select
              value={formData.disputeCategory}
              onValueChange={(value) => onInputChange('disputeCategory', value)}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-2">
                <SelectValue placeholder="Select the type of issue you experienced" />
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
          
          <div>
            <Label htmlFor="description" className="text-gray-300 font-medium">
              Detailed Description *
            </Label>
            <p className="text-xs text-gray-400 mt-1 mb-2">
              Please provide a clear description of what happened, including dates, times, and any communication with the airline.
            </p>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="Example: My flight SV246 on May 25th was delayed by 3 hours and 10 minutes. I was notified via SMS only 10 minutes before original departure time. This caused me to miss my connecting flight and I had to book alternative accommodation..."
              rows={6}
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
              maxLength={2000}
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.description.length}/2000 characters
            </p>
          </div>
        </div>

        {validationResult && (
          <div className="mt-6">
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500 mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <Alert className="bg-yellow-900/20 border-yellow-500">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-yellow-200">
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex-1 bg-slate-700 text-white hover:bg-slate-600"
          >
            Back to Flight Data
          </Button>
          <Button 
            onClick={onNext}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue to Documents
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Step 4: Document Upload
export const DocumentUploadStep: React.FC<ValidationStepProps> = ({
  formData,
  onInputChange,
  onNext,
  onBack,
  validationResult,
  stepNumber,
  totalSteps
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-white mb-2">
          Step {stepNumber} of {totalSteps}: Supporting Documents
        </h3>
        <p className="text-gray-400">Upload supporting documents to strengthen your case</p>
      </div>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-6">Document Upload</h4>
        
        <div className="space-y-6">
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <h5 className="font-medium text-blue-200 mb-2">Recommended Documents:</h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-300">
              <li>Boarding pass or e-ticket</li>
              <li>Original ticket receipt/invoice</li>
              <li>Screenshots of delay/cancellation notifications</li>
              <li>Email correspondence with airline</li>
              <li>Hotel/meal receipts (if applicable)</li>
              <li>Photos of baggage damage (if applicable)</li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Info className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Document Upload Area</p>
              <p className="text-sm">Drag and drop files here or click to browse</p>
              <p className="text-xs mt-2">Supported formats: PDF, JPG, PNG, DOC (Max 10MB each)</p>
            </div>
            <Button 
              variant="outline" 
              className="bg-slate-700 text-white hover:bg-slate-600"
            >
              Choose Files
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasDocuments"
              checked={formData.hasDocuments}
              onCheckedChange={(checked) => onInputChange('hasDocuments', checked as boolean)}
              className="border-slate-600"
            />
            <Label htmlFor="hasDocuments" className="text-gray-300">
              I have uploaded supporting documents for my dispute
            </Label>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> While documents are not mandatory to submit your dispute, 
              they significantly improve processing speed and increase the likelihood of a favorable outcome.
              You can always upload documents later through your case portal.
            </p>
          </div>
        </div>

        {validationResult && validationResult.warnings && validationResult.warnings.length > 0 && (
          <Alert className="bg-yellow-900/20 border-yellow-500 mt-6">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-yellow-200">
              <ul className="list-disc list-inside space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-8 flex gap-4">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex-1 bg-slate-700 text-white hover:bg-slate-600"
          >
            Back to Complaint
          </Button>
          <Button 
            onClick={onNext}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Proceed to Eligibility Check
          </Button>
        </div>
      </Card>
    </div>
  );
};
