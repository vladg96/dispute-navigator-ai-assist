import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DisputeFormData } from '@/types/dispute';
import { FileText, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { IntegrailService } from '@/services/integrailService';

interface DocumentAnalysisStepProps {
  formData: DisputeFormData;
  onNext: () => void;
  onBack: () => void;
  stepNumber: number;
  totalSteps: number;
}

export const DocumentAnalysisStep: React.FC<DocumentAnalysisStepProps> = ({
  formData,
  onNext,
  onBack,
  stepNumber,
  totalSteps
}) => {
  const consumerFriendlyVersion = IntegrailService.getEligibilityData()?.consumerFriendlyVersion || "Analysis pending...";

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">Document Analysis</h2>
        <p className="text-gray-400">Review the AI analysis of your dispute case</p>
        <div className="flex justify-center mt-4">
          <Badge variant="outline" className="bg-blue-600 text-white border-blue-500">
            Step {stepNumber} of {totalSteps}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-slate-800 border-slate-700" style={{ display: 'none' }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white text-center">Consumer-Friendly Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-white whitespace-pre-wrap">{consumerFriendlyVersion}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white text-center">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-base text-white">
              <li>Your case has been successfully submitted</li>
              <li>You will receive a confirmation email with your case details</li>
              <li>Our team will review your case within 24-48 hours</li>
              <li>We will contact you if any additional information is needed</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 bg-slate-700 text-white hover:bg-slate-600"
        >
          Back to Case Summary
        </Button>
        <Button 
          onClick={onNext}
          className="flex-1 bg-green-700 hover:bg-blue-700 text-white"
        >
          Take Action
        </Button>
      </div>
    </div>
  );
};
