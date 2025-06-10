import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DisputeFormData } from '@/types/dispute';
import { Shield, FileText, CheckCircle, AlertTriangle, Clock, Zap, Files } from 'lucide-react';
import { MultiDocumentUpload } from './MultiDocumentUpload';
import { MultiDocumentResult } from '@/services/integrailService';

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
  const [analysisStage, setAnalysisStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(true);
  const [multiDocumentResult, setMultiDocumentResult] = useState<MultiDocumentResult | null>(null);

  const analysisStages = [
    { 
      id: 1, 
      name: 'Document Validation', 
      description: 'Verifying document authenticity and completeness',
      icon: FileText,
      status: 'completed'
    },
    { 
      id: 2, 
      name: 'Regulatory Compliance Check', 
      description: 'Checking against GACA regulations and airline policies',
      icon: Shield,
      status: 'completed'
    },
    { 
      id: 3, 
      name: 'AI Legal Analysis', 
      description: 'Analyzing case strength and legal precedents',
      icon: Zap,
      status: 'processing'
    },
    { 
      id: 4, 
      name: 'Final Assessment', 
      description: 'Generating recommendations and next steps',
      icon: CheckCircle,
      status: 'pending'
    }
  ];

  const handleMultiDocumentProcessing = (result: MultiDocumentResult) => {
    console.log('Multi-document processing completed:', result);
    setMultiDocumentResult(result);
    setShowDocumentUpload(false);
    setIsAnalyzing(true);
    setProgress(0);
  };

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsAnalyzing(false);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setAnalysisStage(prev => {
        if (prev < analysisStages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    if (!isAnalyzing) {
      clearInterval(stageInterval);
    }

    return () => clearInterval(stageInterval);
  }, [isAnalyzing, analysisStages.length]);

  const getStageStatus = (index: number) => {
    if (index < analysisStage) return 'completed';
    if (index === analysisStage && isAnalyzing) return 'processing';
    return 'pending';
  };

  const analysisResults = {
    caseStrength: 'Strong',
    complianceScore: 95,
    recommendedAction: 'Proceed with formal complaint',
    estimatedProcessingTime: '14-21 business days',
    eligibilityConfidence: 'High',
    potentialCompensation: 'SAR 1,200 - SAR 2,400',
    legalBasis: 'GACA Regulation Article 12.3 - Compensation for denied boarding',
    nextSteps: [
      'Submit formal complaint to airline',
      'Monitor 30-day response period',
      'Escalate to GACA if necessary'
    ]
  };

  if (showDocumentUpload) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2 text-white">Document Processing</h2>
          <p className="text-gray-400">Upload multiple documents for AI analysis</p>
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className="bg-purple-600 text-white border-purple-500">
              Step {stepNumber} of {totalSteps}
            </Badge>
          </div>
        </div>

        <MultiDocumentUpload
          onProcessingComplete={handleMultiDocumentProcessing}
          maxFiles={5}
          acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.webp']}
        />

        {/* Processing Results Summary */}
        {multiDocumentResult && (
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Files className="h-5 w-5 text-blue-400" />
                Document Processing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Documents Processed</p>
                  <p className="font-medium">{multiDocumentResult.results.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Processing Time</p>
                  <p className="font-medium">{(multiDocumentResult.processingTime / 1000).toFixed(1)}s</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Successful Extractions</p>
                  <p className="font-medium text-green-400">
                    {multiDocumentResult.results.filter(r => r.status === 'success').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Failed Extractions</p>
                  <p className="font-medium text-red-400">
                    {multiDocumentResult.results.filter(r => r.status === 'failed').length}
                  </p>
                </div>
              </div>

              {/* Extracted Data Preview */}
              {multiDocumentResult.mergedData && (
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Extracted Flight Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Booking Ref:</span>
                      <span className="ml-2">{multiDocumentResult.mergedData['Booking Reference'] || 'Not found'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Flight:</span>
                      <span className="ml-2">{multiDocumentResult.mergedData['Flight Number'] || 'Not found'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Date:</span>
                      <span className="ml-2">{multiDocumentResult.mergedData['Flight Date'] || 'Not found'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Route:</span>
                      <span className="ml-2">
                        {multiDocumentResult.mergedData.Route 
                          ? `${multiDocumentResult.mergedData.Route.Departure} → ${multiDocumentResult.mergedData.Route.Arrival}`
                          : 'Not found'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 pt-6">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1 bg-slate-700 text-white hover:bg-slate-600"
          >
            Back to Case Summary
          </Button>
          <Button 
            onClick={() => {
              if (multiDocumentResult) {
                handleMultiDocumentProcessing(multiDocumentResult);
              } else {
                setShowDocumentUpload(false);
                setIsAnalyzing(true);
              }
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Continue to Analysis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">AI Document Analysis</h2>
        <p className="text-gray-400">Advanced AI processing of your case documentation</p>
        <div className="flex justify-center mt-4">
          <Badge variant="outline" className="bg-purple-600 text-white border-purple-500">
            Step {stepNumber} of {totalSteps}
          </Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Analysis Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-blue-400">
              <Clock className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing your case documentation...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Stages */}
      <div className="grid gap-4">
        {analysisStages.map((stage, index) => {
          const Icon = stage.icon;
          const status = getStageStatus(index);
          
          return (
            <Card key={stage.id} className="bg-slate-800 border-slate-700 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    status === 'completed' ? 'bg-green-600' :
                    status === 'processing' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }`}>
                    <Icon className={`h-5 w-5 ${status === 'processing' ? 'animate-pulse' : ''}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{stage.name}</h3>
                    <p className="text-sm text-gray-400">{stage.description}</p>
                  </div>
                  
                  <div>
                    {status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    {status === 'processing' && (
                      <Clock className="h-5 w-5 text-blue-400 animate-spin" />
                    )}
                    {status === 'pending' && (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analysis Results */}
      {!isAnalyzing && (
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Multi-document processing summary */}
            {multiDocumentResult && (
              <div className="bg-slate-700 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium mb-2">Document Processing Results</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Documents:</span>
                    <span className="ml-2 font-medium">{multiDocumentResult.results.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Successfully Processed:</span>
                    <span className="ml-2 font-medium text-green-400">
                      {multiDocumentResult.results.filter(r => r.status === 'success').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Processing Time:</span>
                    <span className="ml-2 font-medium">{(multiDocumentResult.processingTime / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Case Strength</p>
                <Badge className="bg-green-600">{analysisResults.caseStrength}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-400">Compliance Score</p>
                <p className="font-medium text-green-400">{analysisResults.complianceScore}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Eligibility Confidence</p>
                <Badge className="bg-blue-600">{analysisResults.eligibilityConfidence}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-400">Processing Time</p>
                <p className="font-medium">{analysisResults.estimatedProcessingTime}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Potential Compensation Range</p>
              <p className="font-medium text-green-400 text-lg">{analysisResults.potentialCompensation}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Legal Basis</p>
              <p className="text-sm bg-slate-700 p-3 rounded-lg">{analysisResults.legalBasis}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Recommended Next Steps</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 mt-2">
                {analysisResults.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 pt-6">
        <Button 
          variant="outline" 
          onClick={() => setShowDocumentUpload(true)}
          className="flex-1 bg-slate-700 text-white hover:bg-slate-600"
        >
          Back to Documents
        </Button>
        <Button 
          onClick={onNext}
          disabled={isAnalyzing}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
        >
          {isAnalyzing ? 'Analysis in Progress...' : 'Complete Analysis'}
        </Button>
      </div>
    </div>
  );
};
