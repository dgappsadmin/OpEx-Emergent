import React from 'react';
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

const WorkflowProgress = ({ currentStep, totalSteps = 5, status = 'pending' }) => {
  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return status;
    return 'waiting';
  };

  const getStepIcon = (stepNumber) => {
    const stepStatus = getStepStatus(stepNumber);
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (stepNumber) => {
    const stepStatus = getStepStatus(stepNumber);
    switch (stepStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const stepNames = [
    'Register',
    'Approval',
    'Define Responsibilities',
    'MOC Assessment',
    'CAPEX Assessment'
  ];

  return (
    <div className="flex items-center space-x-2 overflow-x-auto">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center min-w-0">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getStepColor(stepNumber)}`}>
                {getStepIcon(stepNumber)}
              </div>
              <div className="text-xs text-center mt-1 max-w-16">
                <div className="font-medium">{stepNumber}</div>
                <div className="text-gray-500 truncate">{stepNames[index]}</div>
              </div>
            </div>
            {stepNumber < totalSteps && (
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WorkflowProgress;