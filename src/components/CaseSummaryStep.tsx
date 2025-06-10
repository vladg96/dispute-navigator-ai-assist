
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DisputeFormData } from '@/types/dispute';
import { FileText, Calendar, MapPin, Plane, User, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface CaseSummaryStepProps {
  formData: DisputeFormData;
  onNext: () => void;
  onBack: () => void;
  stepNumber: number;
  totalSteps: number;
}

export const CaseSummaryStep: React.FC<CaseSummaryStepProps> = ({
  formData,
  onNext,
  onBack,
  stepNumber,
  totalSteps
}) => {
  const caseId = `CS-2025-${Date.now().toString().slice(-6)}`;
  const currentDate = new Date().toLocaleDateString();

  const generateCaseSummary = () => {
    const summaryData = {
      caseId,
      dateOpened: currentDate,
      consumerName: formData.consumerName,
      bookingReference: formData.bookingReference,
      flightDetails: `${formData.flightNumber}, ${formData.flightDate}`,
      route: `${formData.origin} → ${formData.destination}`,
      disputeCategory: formData.disputeCategory,
      summaryOfFacts: formData.description,
      requestedResolution: "Compensation as per GACA regulations",
      supportingDocumentation: formData.hasDocuments ? ["Boarding pass", "Ticket receipt", "Communication records"] : ["To be provided"],
      regulatoryReferences: ["GACA Consumer Protection Regulation", "Montreal Convention Article 19"],
      ticketFareBasis: "Economy Class",
      currentStatus: "Under Initial Review",
      assignedHandler: "AI Processing System",
      nextActionDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      finalOutput: "Case summary generated and ready for analysis"
    };

    console.log('Case Summary Generated:', summaryData);
    return summaryData;
  };

  const generateTimeline = () => {
    const baseTime = new Date();
    return [
      {
        id: 1,
        timestamp: new Date(baseTime.getTime() - 6 * 60 * 1000).toLocaleTimeString(),
        date: baseTime.toLocaleDateString(),
        event: "Consumer Identity Verified",
        description: `Identity validation completed for ${formData.consumerName}`,
        status: "completed",
        icon: User
      },
      {
        id: 2,
        timestamp: new Date(baseTime.getTime() - 5 * 60 * 1000).toLocaleTimeString(),
        date: baseTime.toLocaleDateString(),
        event: "Flight Data Validated",
        description: `Booking ${formData.bookingReference} verified for flight ${formData.flightNumber}`,
        status: "completed",
        icon: Plane
      },
      {
        id: 3,
        timestamp: new Date(baseTime.getTime() - 4 * 60 * 1000).toLocaleTimeString(),
        date: baseTime.toLocaleDateString(),
        event: "Complaint Details Recorded",
        description: `${formData.disputeCategory} complaint registered`,
        status: "completed",
        icon: AlertCircle
      },
      {
        id: 4,
        timestamp: new Date(baseTime.getTime() - 3 * 60 * 1000).toLocaleTimeString(),
        date: baseTime.toLocaleDateString(),
        event: "Documents Assessment",
        description: formData.hasDocuments ? "Supporting documents uploaded" : "No additional documents provided",
        status: "completed",
        icon: FileText
      },
      {
        id: 5,
        timestamp: new Date(baseTime.getTime() - 2 * 60 * 1000).toLocaleTimeString(),
        date: baseTime.toLocaleDateString(),
        event: "Eligibility Confirmed",
        description: "Case meets GACA regulatory requirements",
        status: "completed",
        icon: CheckCircle
      },
      {
        id: 6,
        timestamp: new Date(baseTime.getTime() - 1 * 60 * 1000).toLocaleTimeString(),
        date: baseTime.toLocaleDateString(),
        event: "Consumer Consent Obtained",
        description: "Authorization granted for case processing",
        status: "completed",
        icon: FileText
      },
      {
        id: 7,
        timestamp: baseTime.toLocaleTimeString(),
        date: baseTime.toLocaleDateString(),
        event: "Case Summary Generated",
        description: "Legal documentation compiled",
        status: "active",
        icon: Search
      },
      {
        id: 8,
        timestamp: "Pending",
        date: "Next",
        event: "AI Document Analysis",
        description: "Automated processing and validation",
        status: "pending",
        icon: Clock
      }
    ];
  };

  const caseSummary = generateCaseSummary();
  const timeline = generateTimeline();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">Case Summary & Timeline</h2>
        <p className="text-gray-400">Review your case details and legal documentation</p>
        <div className="flex justify-center mt-4">
          <Badge variant="outline" className="bg-blue-600 text-white border-blue-500">
            Step {stepNumber} of {totalSteps}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Case Header */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Case #{caseSummary.caseId}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Date Opened</p>
                <p className="font-medium">{caseSummary.dateOpened}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Current Status</p>
                <Badge className="bg-yellow-600">{caseSummary.currentStatus}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chronological Timeline */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Chronological Case Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${
                        item.status === 'completed' ? 'bg-green-600' :
                        item.status === 'active' ? 'bg-blue-600' :
                        'bg-gray-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-6 bg-slate-600 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{item.event}</h4>
                        <div className="text-xs text-gray-400">
                          {item.date} • {item.timestamp}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Consumer Information */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-400" />
              Consumer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="font-medium">{caseSummary.consumerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Contact</p>
                <p className="font-medium">{formData.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flight Details */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-purple-400" />
              Flight Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Booking Reference</p>
                <p className="font-medium">{caseSummary.bookingReference}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Flight Details</p>
                <p className="font-medium">{caseSummary.flightDetails}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Route</p>
                <p className="font-medium">{caseSummary.route}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Details */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Dispute Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Category</p>
              <Badge className="bg-red-600">{caseSummary.disputeCategory}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Summary of Facts</p>
              <p className="text-sm bg-slate-700 p-3 rounded-lg">{caseSummary.summaryOfFacts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Requested Resolution</p>
              <p className="font-medium">{caseSummary.requestedResolution}</p>
            </div>
          </CardContent>
        </Card>

        {/* Legal References */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-400" />
              Legal Documentation & References
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Assigned Handler</p>
                <p className="font-medium">{caseSummary.assignedHandler}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Next Action Due</p>
                <p className="font-medium">{caseSummary.nextActionDue}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">Supporting Documentation</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {caseSummary.supportingDocumentation.map((doc, index) => (
                  <Badge key={index} variant="outline" className="bg-slate-700 text-gray-300">
                    {doc}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">Regulatory References</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {caseSummary.regulatoryReferences.map((ref, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-900 text-blue-300">
                    {ref}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 bg-slate-700 text-white hover:bg-slate-600"
        >
          Back to Consent
        </Button>
        <Button 
          onClick={onNext}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Proceed to Document Analysis
        </Button>
      </div>
    </div>
  );
};
