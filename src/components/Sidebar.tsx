
import React from 'react';
import { CheckCircle, FileText, Search, Shield, Clock } from 'lucide-react';

const Sidebar = () => {
  const workflowSteps = [
    {
      id: 'submit',
      title: 'Submit Case',
      subtitle: 'Identity & Details',
      icon: FileText,
      status: 'active'
    },
    {
      id: 'eligibility',
      title: 'Eligibility Assessment',
      subtitle: 'GDRC Decision Tree',
      icon: CheckCircle,
      status: 'completed'
    },
    {
      id: 'summary',
      title: 'Case Summary & Timeline',
      subtitle: 'Legal Documentation',
      icon: Search,
      status: 'pending'
    },
    {
      id: 'analysis',
      title: 'Document Analysis',
      subtitle: 'AI Processing',
      icon: Shield,
      status: 'pending'
    },
    {
      id: 'consent',
      title: 'Consent & Completion',
      subtitle: 'Final Submission',
      icon: CheckCircle,
      status: 'completed'
    }
  ];

  return (
    <div className="w-80 bg-slate-900 text-white min-h-screen p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 rounded-lg p-2">
            <span className="text-white font-bold text-sm">تكامل</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Aviation Dispute Platform</h1>
          </div>
        </div>
        
        <div className="flex gap-2 mb-2">
          <span className="bg-blue-600 text-xs px-3 py-1 rounded-full">AI POWERED</span>
          <span className="text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-600">Reset</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-gray-400 text-sm font-medium mb-4 tracking-wider uppercase">WORKFLOW STEPS</h2>
        
        <div className="space-y-3">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                <div className={`p-2 rounded-lg ${
                  step.status === 'active' ? 'bg-blue-600' : 
                  step.status === 'completed' ? 'bg-green-600' : 
                  'bg-gray-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{step.title}</h3>
                  <p className="text-xs text-gray-400">{step.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
