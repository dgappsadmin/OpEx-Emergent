import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import WorkflowHistory from '../components/WorkflowHistory';
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
  Eye,
  CheckSquare,
  XCircle,
  FileText,
  Building
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { initiativeAPI, workflowAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const WorkflowManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [comment, setComment] = useState('');
  
  // Action-specific states
  const [mocRequired, setMocRequired] = useState(null);
  const [mocNumber, setMocNumber] = useState('');
  const [capexRequired, setCapexRequired] = useState(null);
  const [capexDetails, setCapexDetails] = useState('');
  const [selectedInitiativeLead, setSelectedInitiativeLead] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [initiativesResponse] = await Promise.all([
        initiativeAPI.getAll()
      ]);
      
      const allInitiatives = initiativesResponse.data || [];
      setInitiatives(allInitiatives);
      
      // Filter initiatives that need user action
      const userPendingActions = await filterUserPendingActions(allInitiatives);
      setPendingActions(userPendingActions);
      
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      setError('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const filterUserPendingActions = async (initiatives) => {
    if (!user || !user.roleCode || !user.siteCode) return [];
    
    const pendingActions = [];
    
    for (const initiative of initiatives) {
      if (initiative.status === 'PROPOSED' || initiative.status === 'IN_PROGRESS') {
        try {
          // Get workflow steps for this initiative
          const workflowResponse = await workflowAPI.getByInitiativeId(initiative.id);
          const workflowSteps = workflowResponse.data || [];
          
          // Find the current pending step
          const currentStep = workflowSteps.find(step => step.status === 'pending');
          
          if (currentStep && canUserApproveStep(currentStep, user.roleCode, user.siteCode)) {
            pendingActions.push({
              initiative,
              workflowStep: currentStep
            });
          }
        } catch (error) {
          console.error(`Error fetching workflow for initiative ${initiative.id}:`, error);
        }
      }
    }
    
    return pendingActions;
  };

  const canUserApproveStep = (workflowStep, userRoleCode, userSiteCode) => {
    if (!workflowStep?.stage) return false;
    
    const stageRoleCode = workflowStep.stage.roleCode;
    
    // Check if user's role matches the required role for this step
    if (stageRoleCode === userRoleCode) {
      // For corporate roles like CTSD, they can approve for all sites
      if (userRoleCode === 'CTSD') return true;
      
      // For site-specific roles, check site match
      const initiativeSiteCode = workflowStep.initiative?.site?.code;
      return userSiteCode === initiativeSiteCode;
    }
    
    return false;
  };

  const handleApproval = async (pendingAction, actionType) => {
    const { initiative, workflowStep } = pendingAction;
    
    try {
      // Validation
      if (!comment.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Comment is required for all workflow actions.',
          variant: 'destructive'
        });
        return;
      }

      // Step-specific validation
      const stepNumber = workflowStep.stepNumber;
      
      if (stepNumber === 3 && actionType === 'approve' && !selectedInitiativeLead) {
        toast({
          title: 'Validation Error', 
          description: 'Please select an Initiative Lead.',
          variant: 'destructive'
        });
        return;
      }

      if (stepNumber === 4 && actionType === 'approve' && mocRequired === null) {
        toast({
          title: 'Validation Error',
          description: 'Please specify if MOC is required.',
          variant: 'destructive'
        });
        return;
      }

      if (stepNumber === 4 && actionType === 'approve' && mocRequired && !mocNumber.trim()) {
        toast({
          title: 'Validation Error',
          description: 'MOC Number is required when MOC is needed.',
          variant: 'destructive'
        });
        return;
      }

      if (stepNumber === 5 && actionType === 'approve' && capexRequired === null) {
        toast({
          title: 'Validation Error',
          description: 'Please specify if CAPEX is required.',
          variant: 'destructive'
        });
        return;
      }

      if (stepNumber === 5 && actionType === 'approve' && capexRequired && !capexDetails.trim()) {
        toast({
          title: 'Validation Error',
          description: 'CAPEX Details are required when CAPEX is needed.',
          variant: 'destructive'
        });
        return;
      }
      
      const payload = { comments: comment };

      // Add step-specific data
      if (actionType === 'approve') {
        if (stepNumber === 3 && selectedInitiativeLead) {
          payload.initiativeLead = selectedInitiativeLead;
        }
        if (stepNumber === 4) {
          payload.mocRequired = mocRequired;
          if (mocRequired && mocNumber) {
            payload.mocNumber = mocNumber;
          }
        }
        if (stepNumber === 5) {
          payload.capexRequired = capexRequired;
          if (capexRequired && capexDetails) {
            payload.capexDetails = capexDetails;
          }
        }
      }

      // Call API
      let response;
      if (actionType === 'approve') {
        response = await workflowAPI.approve(workflowStep.id, payload);
      } else {
        response = await workflowAPI.reject(workflowStep.id, payload);
      }
      
      toast({
        title: actionType === 'approve' ? 'Step Approved!' : 'Step Rejected',
        description: `${workflowStep.stage.activity} has been ${actionType === 'approve' ? 'approved' : 'rejected'}.`,
      });

      // Reset form
      resetForm();
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process the action. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setComment('');
    setMocRequired(null);
    setMocNumber('');
    setCapexRequired(null);
    setCapexDetails('');
    setSelectedInitiativeLead('');
    setSelectedInitiative(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'PROPOSED':
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'waiting':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      case 'rejected':
      case 'REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'PROPOSED':
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'waiting':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'rejected':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const renderActionDialog = (pendingAction) => {
    const { initiative, workflowStep } = pendingAction;
    const stepNumber = workflowStep.stepNumber;
    const stage = workflowStep.stage;
    
    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Step {stepNumber}: {stage.activity}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Responsibility: {stage.responsibility}
            {stage.annexure && ` (${stage.annexure})`}
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

          {/* Step-specific forms */}
          {stepNumber === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Select Initiative Lead *</Label>
                <Select onValueChange={setSelectedInitiativeLead}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Initiative Lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={`${initiative.site?.code?.toLowerCase()}_il@godeepak.com`}>
                      Initiative Lead - {initiative.site?.code}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {stepNumber === 4 && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Management of Change (MOC) Assessment</h4>
                <p className="text-sm text-orange-600">
                  Determine if MOC is required for this initiative.
                </p>
              </div>
              <div>
                <Label className="font-medium">Is MOC required? *</Label>
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
                </div>
              )}
            </div>
          )}

          {stepNumber === 5 && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Capital Expenditure (CAPEX) Assessment</h4>
                <p className="text-sm text-green-600">
                  Determine if CAPEX is required for this initiative.
                </p>
              </div>
              <div>
                <Label className="font-medium">Is CAPEX required? *</Label>
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
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <Label className="font-medium text-yellow-800">Comments *</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your detailed review comments here..."
              className="mt-2 border-yellow-300 focus:border-yellow-500"
              rows={3}
              required
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleApproval(pendingAction, 'reject')}
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              disabled={!comment.trim()}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => handleApproval(pendingAction, 'approve')}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={
                !comment.trim() ||
                (stepNumber === 3 && !selectedInitiativeLead) ||
                (stepNumber === 4 && mocRequired === null) ||
                (stepNumber === 4 && mocRequired && !mocNumber.trim()) ||
                (stepNumber === 5 && capexRequired === null) ||
                (stepNumber === 5 && capexRequired && !capexDetails.trim())
              }
            >
              <CheckCircle className="mr-2 h-4 w-4" />
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
              onClick={fetchData} 
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
    <Layout title="Workflow Management">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Workflow Management</h2>
          <p className="text-slate-600">
            Role: <span className="font-medium">{user?.roleName || 'N/A'}</span> | 
            Site: <span className="font-medium">{user?.siteName || 'N/A'}</span>
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-orange-600 text-sm font-medium">Pending Actions</p>
                  <p className="text-2xl font-bold text-orange-900">{pendingActions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Initiatives</p>
                  <p className="text-2xl font-bold text-blue-900">{initiatives.length}</p>
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
                  <p className="text-green-600 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900">
                    {initiatives.filter(i => i.status === 'COMPLETED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-500 rounded-lg flex items-center justify-center">
                  <Building className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">My Site</p>
                  <p className="text-lg font-bold text-gray-900">{user?.siteCode || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions Section */}
        {pendingActions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">
                Actions Required ({pendingActions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingActions.map((pendingAction, index) => {
                  const { initiative, workflowStep } = pendingAction;
                  return (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{initiative.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            Step {workflowStep.stepNumber}: {workflowStep.stage.activity}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Site: {initiative.site?.name || 'N/A'} | 
                            Expected Savings: ₹{initiative.estimatedSavings?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setSelectedInitiative(initiative)}
                              >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Take Action
                              </Button>
                            </DialogTrigger>
                            {renderActionDialog(pendingAction)}
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Initiatives Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">All Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {initiatives.map((initiative) => (
                <Card key={initiative.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-slate-800">{initiative.title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                          {initiative.initiativeId || initiative.id} • {initiative.proposer}
                        </p>
                      </div>
                      <Badge className={getStatusColor(initiative.status)}>
                        {getStatusIcon(initiative.status)}
                        <span className="ml-1">{initiative.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <p className="text-sm text-slate-700 line-clamp-2">{initiative.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Site:</span>
                          <p className="font-medium">{initiative.site?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Expected Savings:</span>
                          <p className="font-medium">₹{initiative.estimatedSavings?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4 border-t">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl">{initiative.title}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Initiative Details */}
                              <div className="space-y-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Initiative Details</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <Label className="font-medium">Initiative ID:</Label>
                                        <p>{initiative.initiativeId || initiative.id}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Status:</Label>
                                        <Badge className={getStatusColor(initiative.status)}>
                                          {initiative.status}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Site:</Label>
                                        <p>{initiative.site?.name || 'N/A'}</p>
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
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Workflow History */}
                              <div>
                                <WorkflowHistory initiativeId={initiative.id} />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default WorkflowManagement;