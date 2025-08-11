import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  DollarSign,
  User,
  MessageSquare
} from 'lucide-react';

const WorkflowStepApproval = ({ 
  initiative, 
  currentStep, 
  onApprove, 
  onReject, 
  userRole, 
  userSite,
  loading = false 
}) => {
  const [comments, setComments] = useState('');
  const [mocRequired, setMocRequired] = useState(null);
  const [mocNumber, setMocNumber] = useState('');
  const [capexRequired, setCapexRequired] = useState(null);
  const [capexDetails, setCapexDetails] = useState('');
  const [initiativeLead, setInitiativeLead] = useState('');

  const WORKFLOW_STAGES = [
    { step: 1, name: "Register initiative", role: "STLD", responsibility: "Site TSD Lead", description: "Initial registration of the initiative" },
    { step: 2, name: "Approval", role: "SH", responsibility: "Site Head", description: "Site head approval of the initiative" },
    { step: 3, name: "Define Responsibilities", role: "EH", responsibility: "Engg Head", annexure: "Annexure 2", description: "Select initiative lead to manage the process" },
    { step: 4, name: "MOC Assessment & Process", role: "IL", responsibility: "Initiative Lead", description: "Assess MOC requirement and complete MOC process if required" },
    { step: 5, name: "CAPEX Assessment & Process", role: "IL", responsibility: "Initiative Lead", description: "Assess CAPEX requirement and complete CAPEX process if required" }
  ];

  const currentStageInfo = WORKFLOW_STAGES.find(stage => stage.step === currentStep);
  
  if (!currentStageInfo) {
    return <div className="text-red-600">Invalid workflow step</div>;
  }

  const canUserApprove = () => {
    if (!userRole || !currentStageInfo) return false;
    
    // Check role match
    if (currentStageInfo.role !== userRole) return false;
    
    // For corporate roles, allow all sites
    if (userRole === 'CTSD') return true;
    
    // For site-specific roles, check site match
    return userSite === initiative.site?.code;
  };

  const validateStepData = () => {
    switch (currentStep) {
      case 3:
        return initiativeLead.trim() !== '';
      case 4:
        return mocRequired !== null && (mocRequired === false || (mocRequired === true && mocNumber.trim() !== ''));
      case 5:
        return capexRequired !== null && (capexRequired === false || (capexRequired === true && capexDetails.trim() !== ''));
      default:
        return true;
    }
  };

  const handleApprove = () => {
    if (!validateStepData()) {
      return;
    }

    const stepData = {
      step: currentStep,
      comments,
      ...(currentStep === 3 && { initiativeLead }),
      ...(currentStep === 4 && { mocRequired, mocNumber: mocRequired ? mocNumber : null }),
      ...(currentStep === 5 && { capexRequired, capexDetails: capexRequired ? capexDetails : null })
    };

    onApprove(stepData);
  };

  const handleReject = () => {
    onReject({ step: currentStep, comments });
  };

  const renderStepSpecificFields = () => {
    switch (currentStep) {
      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Define Initiative Leadership</h4>
              <p className="text-sm text-blue-600">
                Select an Initiative Lead who will be responsible for managing this initiative through the remaining workflow steps.
              </p>
            </div>
            <div>
              <Label className="font-medium">Select Initiative Lead *</Label>
              <Select value={initiativeLead} onValueChange={setInitiativeLead}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose Initiative Lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={`${userSite?.toLowerCase()}_il1@godeepak.com`}>
                    {userSite} Initiative Lead 1
                  </SelectItem>
                  <SelectItem value={`${userSite?.toLowerCase()}_il2@godeepak.com`}>
                    {userSite} Initiative Lead 2
                  </SelectItem>
                  <SelectItem value={`${userSite?.toLowerCase()}_il3@godeepak.com`}>
                    {userSite} Initiative Lead 3
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Management of Change (MOC) Assessment & Process
              </h4>
              <p className="text-sm text-orange-600">
                Determine if this initiative requires MOC and complete the process if needed.
              </p>
            </div>
            <div>
              <Label className="font-medium">Is MOC required for this initiative? *</Label>
              <Select value={mocRequired === null ? "" : mocRequired.toString()} onValueChange={(value) => setMocRequired(value === 'true')}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select Yes or No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes - MOC Required</SelectItem>
                  <SelectItem value="false">No - MOC Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mocRequired === true && (
              <div>
                <Label className="font-medium">MOC Number *</Label>
                <Input
                  value={mocNumber}
                  onChange={(e) => setMocNumber(e.target.value)}
                  placeholder="Enter MOC reference number"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Example: MOC-{initiative.site?.code || 'SITE'}-2025-001
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Capital Expenditure (CAPEX) Assessment & Process
              </h4>
              <p className="text-sm text-green-600">
                Determine if this initiative requires CAPEX and complete the process if needed.
              </p>
            </div>
            <div>
              <Label className="font-medium">Is CAPEX required for this initiative? *</Label>
              <Select value={capexRequired === null ? "" : capexRequired.toString()} onValueChange={(value) => setCapexRequired(value === 'true')}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select Yes or No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes - CAPEX Required</SelectItem>
                  <SelectItem value="false">No - CAPEX Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {capexRequired === true && (
              <div>
                <Label className="font-medium">CAPEX Details *</Label>
                <Textarea
                  value={capexDetails}
                  onChange={(e) => setCapexDetails(e.target.value)}
                  placeholder="Provide CAPEX amount, justification, and approval details..."
                  className="mt-2"
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include: Estimated amount, equipment/infrastructure details, ROI justification
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!canUserApprove()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">
            You don't have permission to approve this step. This step requires {currentStageInfo.responsibility} approval.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                {currentStep}
              </div>
              <div>
                <h3 className="text-xl font-bold">{currentStageInfo.name}</h3>
                <p className="text-sm text-gray-600 font-normal">
                  {currentStageInfo.responsibility} • {currentStageInfo.description}
                </p>
              </div>
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending Approval
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Initiative Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Initiative: {initiative.title}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Site:</span>
              <span className="ml-2 font-medium">{initiative.site?.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Expected Savings:</span>
              <span className="ml-2 font-medium">₹{initiative.estimatedSavings?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Step-specific fields */}
        {renderStepSpecificFields()}

        {/* Comments */}
        <div>
          <Label className="font-medium">Comments</Label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your review comments..."
            className="mt-2"
            rows={3}
          />
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={loading}
            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading || !validateStepData()}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {loading ? 'Processing...' : 'Approve & Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowStepApproval;