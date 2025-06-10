import React from 'react';
import { CheckCircle, FileText, Search, Shield, Clock, User, Plane, AlertCircle, Upload } from 'lucide-react';

interface SidebarProps {
  currentStep?: number;
  onStepClick?: (stepNumber: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentStep = 1, onStepClick }) => {
  const workflowSteps = [
    {
      id: 1,
      title: 'Consumer Identity',
      subtitle: 'Personal Information',
      icon: User,
      stepRange: [1]
    },
    {
      id: 2,
      title: 'Flight Data',
      subtitle: 'Booking & Flight Details',
      icon: Plane,
      stepRange: [2]
    },
    {
      id: 3,
      title: 'Complaint Details',
      subtitle: 'Issue Description',
      icon: AlertCircle,
      stepRange: [3]
    },
    {
      id: 4,
      title: 'Document Upload',
      subtitle: 'Supporting Evidence',
      icon: Upload,
      stepRange: [4]
    },
    {
      id: 5,
      title: 'Eligibility Assessment',
      subtitle: 'GACA Decision Tree',
      icon: CheckCircle,
      stepRange: [5]
    },
    {
      id: 6,
      title: 'Consent & Authorization',
      subtitle: 'Final Submission',
      icon: FileText,
      stepRange: [6]
    },
    {
      id: 7,
      title: 'Case Summary & Timeline',
      subtitle: 'Legal Documentation',
      icon: Search,
      stepRange: [7]
    },
    {
      id: 8,
      title: 'Document Analysis',
      subtitle: 'AI Processing',
      icon: Shield,
      stepRange: [8]
    }
  ];

  const getStepStatus = (step: typeof workflowSteps[0]) => {
    if (step.stepRange.includes(currentStep)) {
      return 'active';
    } else if (step.stepRange.some(range => range < currentStep)) {
      return 'completed';
    } else {
      return 'pending';
    }
  };

  const handleStepClick = (stepId: number) => {
    if (onStepClick && stepId <= currentStep) {
      onStepClick(stepId);
    }
  };

  return (
    <div className="w-80 bg-slate-900 text-white min-h-screen p-6">
      
      <div className="mb-8">
        {/* Header with logo, title, and badges in horizontal layout */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo section */}
          <div className="bg-blue-600 rounded-lg p-2">
            <span className="text-white font-bold text-sm">تكامل</span>
          </div>
          
          {/* Title section */}
          <div className="flex-1 mx-4">
            <h1 className="text-lg font-semibold text-center">AI Aviation Dispute Platform</h1>
          </div>
          
          {/* Badges section */}
          <div className="flex flex-col gap-1">
            <span className="bg-blue-600 text-xs px-3 py-1 rounded-full">AI POWERED</span>
            <span className="text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-600">Reset</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-gray-400 text-sm font-medium mb-4 tracking-wider uppercase">WORKFLOW STEPS</h2>
        
        <div className="space-y-3">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(step);
            const isClickable = step.id <= currentStep;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isClickable 
                    ? 'hover:bg-slate-800 cursor-pointer' 
                    : 'cursor-not-allowed opacity-60'
                }`}
                onClick={() => handleStepClick(step.id)}
              >
                <div className={`p-2 rounded-lg ${
                  status === 'active' ? 'bg-blue-600' : 
                  status === 'completed' ? 'bg-green-600' : 
                  'bg-gray-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{step.title}</h3>
                  <p className="text-xs text-gray-400">{step.subtitle}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {step.stepRange.join('-')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      
      <div className="mt-8 p-4 bg-slate-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium">Current Progress</span>
        </div>
        <div className="text-xs text-gray-400">
          Step {currentStep} of 8 completed
        </div>
        <div className="mt-2 bg-slate-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
