import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  MessageSquare,
  Send,
  Eye,
  ChevronRight,
  FileText,
  DollarSign,
  CheckSquare
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { initiativeAPI, workflowAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Workflow stages as per requirement (Simplified 5-step process)
const WORKFLOW_STAGES = [
  { step: 1, name: "Register initiative", role: "STLD", responsibility: "Site TSD Lead" },
  { step: 2, name: "Approval", role: "SH", responsibility: "Site Head" },
  { step: 3, name: "Define Responsibilities", role: "EH", responsibility: "Engg Head", annexure: "Annexure 2" },
  { step: 4, name: "MOC Assessment & Process", role: "IL", responsibility: "Initiative Lead" },
  { step: 5, name: "CAPEX Assessment & Process", role: "IL", responsibility: "Initiative Lead" }
];

const WorkflowManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [comment, setComment] = useState('');
  
  // MOC and CAPEX specific states
  const [mocRequired, setMocRequired] = useState(false);
  const [mocNumber, setMocNumber] = useState('');
  const [capexRequired, setCapexRequired] = useState(false);
  const [capexDetails, setCapexDetails] = useState('');
  const [selectedInitiativeLead, setSelectedInitiativeLead] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await initiativeAPI.getAll();
        setInitiatives(response.data || []);
      } catch (error) {
        console.error('Error fetching initiatives:', error);
        setError('Failed to load initiatives');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'waiting':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'waiting':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getNextStepForInitiative = (initiative) => {
    // Logic to determine the next step based on current initiative status
    // For now, return step 1 if status is PROPOSED, otherwise determine based on workflow steps
    if (initiative.status === 'PROPOSED') {
      return 1;
    }
    // You would get this from workflow steps API
    return 2; // Default for demo
  };

  const canUserApprove = (step, userRole, userSite) => {
    const stageInfo = WORKFLOW_STAGES.find(s => s.step === step);
    if (!stageInfo) return false;
    
    // Check if user's role matches the required role for this step
    if (stageInfo.role === userRole) {
      // For corporate roles like CTSD, they can approve for all sites
      if (userRole === 'CTSD') return true;
      // For site-specific roles, check site match
      return userSite === (selectedInitiative?.site?.code || selectedInitiative?.siteCode);
    }
    
    return false;
  };

  const handleApproval = async (initiative, action) => {
    try {
      const nextStep = getNextStepForInitiative(initiative);
      const stageInfo = WORKFLOW_STAGES.find(s => s.step === nextStep);
      
      const payload = {
        action: action,
        comments: comment,
        stepNumber: nextStep,
        stageName: stageInfo.name
      };

      // Add MOC specific data for step 4
      if (nextStep === 4) {
        payload.mocRequired = mocRequired;
        if (mocRequired && mocNumber) {
          payload.mocNumber = mocNumber;
        }
      }

      // Add CAPEX specific data for step 5
      if (nextStep === 5) {
        payload.capexRequired = capexRequired;
        if (capexRequired && capexDetails) {
          payload.capexDetails = capexDetails;
        }
      }

      // Add initiative lead selection for step 3
      if (nextStep === 3 && selectedInitiativeLead) {
        payload.initiativeLead = selectedInitiativeLead;
      }

      // This would call your actual workflow API
      // await workflowAPI.processStep(initiative.id, payload);
      
      toast({
        title: action === 'approve' ? 'Step Approved!' : 'Step Rejected',
        description: `${stageInfo.name} has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
      });

      // Reset form
      setComment('');
      setMocRequired(false);
      setMocNumber('');
      setCapexRequired(false);
      setCapexDetails('');
      setSelectedInitiativeLead('');
      setSelectedInitiative(null);
      setSelectedStep(null);

      // Refresh data
      const response = await initiativeAPI.getAll();
      setInitiatives(response.data || []);
      
    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: 'Error',
        description: 'Failed to process the approval. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const renderApprovalDialog = (initiative) => {
    const nextStep = getNextStepForInitiative(initiative);
    const stageInfo = WORKFLOW_STAGES.find(s => s.step === nextStep);
    
    if (!stageInfo) return null;

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Step {nextStep}: {stageInfo.name}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Responsibility: {stageInfo.responsibility}
            {stageInfo.annexure && ` (${stageInfo.annexure})`}
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Initiative Details */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">Initiative: {initiative.title}</h4>
            <p className="text-sm text-slate-600">{initiative.description}</p>
            <div className="mt-2 text-sm">
              <span className="text-slate-500">Site:</span> {initiative.site?.name || initiative.site?.code || 'N/A'} | 
              <span className="text-slate-500 ml-2">Expected Savings:</span> ₹{initiative.estimatedSavings?.toLocaleString() || 'N/A'}
            </div>
          </div>

          {/* Step 3: Initiative Lead Selection */}
          {nextStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Select Initiative Lead *</Label>
                <p className="text-sm text-slate-600 mb-2">
                  Choose who will lead this initiative through the process
                </p>
                <Select onValueChange={setSelectedInitiativeLead}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Initiative Lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john.doe@godeepak.com">John Doe - IL</SelectItem>
                    <SelectItem value="jane.smith@godeepak.com">Jane Smith - IL</SelectItem>
                    <SelectItem value="mike.johnson@godeepak.com">Mike Johnson - IL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: MOC Assessment & Process */}
          {nextStep === 4 && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Management of Change (MOC) Assessment & Process</h4>
                <p className="text-sm text-orange-600">
                  Determine if MOC is required and complete the process if needed.
                </p>
              </div>
              <div>
                <Label className="font-medium">Is MOC required for this initiative? *</Label>
                <Select onValueChange={(value) => setMocRequired(value === 'yes')}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Yes or No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - MOC Required</SelectItem>
                    <SelectItem value="no">No - MOC Not Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {mocRequired && (
                <div>
                  <Label className="font-medium">MOC Number *</Label>
                  <Input
                    value={mocNumber}
                    onChange={(e) => setMocNumber(e.target.value)}
                    placeholder="Enter MOC number"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Example: MOC-{selectedInitiative?.site?.code || 'SITE'}-2025-001
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: CAPEX Assessment & Process */}
          {nextStep === 5 && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Capital Expenditure (CAPEX) Assessment & Process</h4>
                <p className="text-sm text-green-600">
                  Determine if CAPEX is required and complete the process if needed.
                </p>
              </div>
              <div>
                <Label className="font-medium">Is CAPEX required for this initiative? *</Label>
                <Select onValueChange={(value) => setCapexRequired(value === 'yes')}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Yes or No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - CAPEX Required</SelectItem>
                    <SelectItem value="no">No - CAPEX Not Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {capexRequired && (
                <div>
                  <Label className="font-medium">CAPEX Details *</Label>
                  <Textarea
                    value={capexDetails}
                    onChange={(e) => setCapexDetails(e.target.value)}
                    placeholder="Enter CAPEX amount and details"
                    className="mt-2"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Include: Estimated amount, equipment details, ROI justification
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div>
            <Label className="font-medium">Comments:</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your review comments..."
              className="mt-2"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleApproval(initiative, 'reject')}
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleApproval(initiative, 'approve')}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={
                (nextStep === 3 && !selectedInitiativeLead) ||
                (nextStep === 4 && mocRequired === null) ||
                (nextStep === 4 && mocRequired && !mocNumber) ||
                (nextStep === 5 && capexRequired === null) ||
                (nextStep === 5 && capexRequired && !capexDetails)
              }
            >
              <Send className="mr-2 h-4 w-4" />
              Approve & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <Layout title="Workflow Management">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Workflow Management">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Workflow Management - Steps 1-7">
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-blue-600 text-sm font-medium">Pending Approvals</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {initiatives.filter(i => i.status === 'PROPOSED' || i.status === 'IN_PROGRESS').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-green-600 text-sm font-medium">Approved Today</p>
                  <p className="text-2xl font-bold text-green-900">
                    {initiatives.filter(i => i.status === 'APPROVED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-orange-600 text-sm font-medium">MOC In Progress</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {initiatives.filter(i => i.currentStep === 4).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-purple-600 text-sm font-medium">CAPEX In Progress</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {initiatives.filter(i => i.currentStep === 5).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Process Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">OpEx Initiative Workflow Process (Simplified 5-Step Process)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between space-x-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              {WORKFLOW_STAGES.map((stage, index) => (
                <React.Fragment key={stage.step}>
                  <div className="flex flex-col items-center text-center min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index < 3 ? 'bg-blue-500' : index === 3 ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {stage.step}
                    </div>
                    <p className="text-xs font-medium text-slate-700 mt-1 leading-tight">{stage.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{stage.role}</p>
                  </div>
                  {index < WORKFLOW_STAGES.length - 1 && (
                    <ChevronRight className="text-slate-400 flex-shrink-0" size={16} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Initiatives List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {initiatives.map((initiative) => {
            const nextStep = getNextStepForInitiative(initiative);
            const canApprove = canUserApprove(nextStep, user?.role, user?.site);
            const stageInfo = WORKFLOW_STAGES.find(s => s.step === nextStep);
            
            return (
              <Card key={initiative.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">{initiative.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {initiative.initiativeId || initiative.id} • {initiative.proposer} • {initiative.site?.name || initiative.site?.code || 'N/A'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(initiative.status)}>
                      {initiative.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-700 line-clamp-2">{initiative.description}</p>
                    
                    {/* Current Step Info */}
                    {stageInfo && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {nextStep}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{stageInfo.name}</p>
                            <p className="text-xs text-slate-600">Assigned to: {stageInfo.responsibility}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Initiative Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Expected Savings:</span>
                        <p className="font-medium">₹{initiative.estimatedSavings?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Priority:</span>
                        <p className="font-medium">{initiative.priority || 'Medium'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-4 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedInitiative(initiative)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl">{initiative.title}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="font-medium">Initiative ID:</Label>
                                <p>{initiative.initiativeId || initiative.id}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Current Step:</Label>
                                <p>Step {nextStep}: {stageInfo?.name}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Site:</Label>
                                <p>{initiative.site?.name || initiative.site?.code || 'N/A'}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Expected Savings:</Label>
                                <p>₹{initiative.estimatedSavings?.toLocaleString() || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="font-medium">Description:</Label>
                              <p className="text-sm text-slate-700 mt-1">{initiative.description}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {canApprove && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                              <CheckSquare className="mr-2 h-4 w-4" />
                              Process Step {nextStep}
                            </Button>
                          </DialogTrigger>
                          {renderApprovalDialog(initiative)}
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default WorkflowManagement;