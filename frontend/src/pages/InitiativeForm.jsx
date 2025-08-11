import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, X, FileText, Save, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { initiativeAPI, lookupAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const InitiativeForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [sites, setSites] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    siteId: user?.site || '',
    disciplineId: '',
    budgetType: '',
    description: '',
    baselineData: '',
    targetOutcome: '',
    expectedValue: '',
    estimatedCapex: '',
    priority: 'MEDIUM',
    category: 'COST_REDUCTION'
  });

  // Load lookup data on component mount
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        const [sitesResponse, disciplinesResponse] = await Promise.all([
          lookupAPI.getSites(),
          lookupAPI.getDisciplines()
        ]);
        
        setSites(sitesResponse.data || []);
        setDisciplines(disciplinesResponse.data || []);
        
        // Pre-select user's site if available
        if (user?.site && sitesResponse.data) {
          const userSite = sitesResponse.data.find(site => site.code === user.site);
          if (userSite) {
            setFormData(prev => ({ ...prev, siteId: userSite.id.toString() }));
          }
        }
      } catch (error) {
        console.error('Error loading lookup data:', error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadLookupData();
  }, [toast, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const required = ['title', 'siteId', 'disciplineId', 'description', 'expectedValue'];
    const missing = required.filter(field => !formData[field]?.toString().trim());
    
    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    if (parseFloat(formData.expectedValue) <= 0) {
      toast({
        title: "Validation Error",
        description: "Expected savings must be greater than 0.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e, action = 'submit') => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    // Find selected site and discipline objects
    const selectedSite = sites.find(s => s.id.toString() === formData.siteId);
    const selectedDiscipline = disciplines.find(d => d.id.toString() === formData.disciplineId);

    const initiativeData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      siteId: parseInt(formData.siteId),
      disciplineId: parseInt(formData.disciplineId),
      proposer: user?.email || 'system@godeepak.com',
      proposalDate: new Date().toISOString().split('T')[0], // Today's date
      expectedClosureDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      estimatedSavings: parseFloat(formData.expectedValue),
      priority: formData.priority,
      budgetType: formData.budgetType || 'BUDGETED',
      comments: `Baseline: ${formData.baselineData || 'Not specified'}. Target: ${formData.targetOutcome || 'Not specified'}.`
    };

    try {
      const response = await initiativeAPI.create(initiativeData);
      console.log('Initiative created:', response);

      toast({
        title: "Initiative Submitted Successfully!",
        description: `Your initiative "${formData.title}" has been submitted and will enter the approval workflow starting with Site TSD Lead.`,
      });

      // Navigate to workflow page to see the submitted initiative
      navigate('/workflow');

    } catch (error) {
      console.error("Submission Error:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit the initiative. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Submit New Initiative">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">New OpEx Initiative</CardTitle>
            <p className="text-blue-100">Submit your operational excellence initiative for approval workflow (Steps 1-7)</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={(e) => handleSubmit(e, 'submit')} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 border-b-2 border-blue-200 pb-2">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title" className="text-slate-700 font-medium">Initiative Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter a clear and descriptive title"
                      className="h-12 border-slate-300 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site" className="text-slate-700 font-medium">Site *</Label>
                    <Select value={formData.siteId} onValueChange={(value) => handleInputChange('siteId', value)}>
                      <SelectTrigger className="h-12 border-slate-300">
                        <SelectValue placeholder="Select your site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map(site => (
                          <SelectItem key={site.id} value={site.id.toString()}>
                            {site.code} - {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discipline" className="text-slate-700 font-medium">Discipline *</Label>
                    <Select value={formData.disciplineId} onValueChange={(value) => handleInputChange('disciplineId', value)}>
                      <SelectTrigger className="h-12 border-slate-300">
                        <SelectValue placeholder="Select discipline" />
                      </SelectTrigger>
                      <SelectContent>
                        {disciplines.map(discipline => (
                          <SelectItem key={discipline.id} value={discipline.id.toString()}>
                            {discipline.code} - {discipline.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-700 font-medium">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="h-12 border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COST_REDUCTION">Cost Reduction</SelectItem>
                        <SelectItem value="PRODUCTIVITY">Productivity Improvement</SelectItem>
                        <SelectItem value="QUALITY">Quality Enhancement</SelectItem>
                        <SelectItem value="SAFETY">Safety Improvement</SelectItem>
                        <SelectItem value="ENVIRONMENT">Environmental</SelectItem>
                        <SelectItem value="ENERGY">Energy Efficiency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-slate-700 font-medium">Priority *</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger className="h-12 border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">Initiative Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of the initiative, its objectives, and expected outcomes..."
                    className="min-h-32 border-slate-300 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budgetType" className="text-slate-700 font-medium">Budget Type *</Label>
                  <Select value={formData.budgetType} onValueChange={(value) => handleInputChange('budgetType', value)}>
                    <SelectTrigger className="h-12 border-slate-300">
                      <SelectValue placeholder="Select Budget Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUDGETED">Budgeted</SelectItem>
                      <SelectItem value="NON_BUDGETED">Non-Budgeted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Baseline & Target Data */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 border-b-2 border-blue-200 pb-2">
                  Baseline & Target Data
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="baseline" className="text-slate-700 font-medium">Current Baseline Data</Label>
                    <Textarea
                      id="baseline"
                      value={formData.baselineData}
                      onChange={(e) => handleInputChange('baselineData', e.target.value)}
                      placeholder="Describe current state, historical data, and metrics..."
                      className="min-h-24 border-slate-300 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target" className="text-slate-700 font-medium">Target Outcome</Label>
                    <Textarea
                      id="target"
                      value={formData.targetOutcome}
                      onChange={(e) => handleInputChange('targetOutcome', e.target.value)}
                      placeholder="Describe expected outcomes and improvement targets..."
                      className="min-h-24 border-slate-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 border-b-2 border-blue-200 pb-2">
                  Financial Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="expectedValue" className="text-slate-700 font-medium">Expected Annual Savings (₹) *</Label>
                    <Input
                      id="expectedValue"
                      type="number"
                      value={formData.expectedValue}
                      onChange={(e) => handleInputChange('expectedValue', e.target.value)}
                      placeholder="0"
                      className="h-12 border-slate-300 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="capex" className="text-slate-700 font-medium">Estimated CAPEX (₹)</Label>
                    <Input
                      id="capex"
                      type="number"
                      value={formData.estimatedCapex}
                      onChange={(e) => handleInputChange('estimatedCapex', e.target.value)}
                      placeholder="0 (if no CAPEX required)"
                      className="h-12 border-slate-300 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-sm text-slate-500">
                      Leave blank or enter 0 if no capital expenditure is required
                    </p>
                  </div>
                </div>
              </div>

              {/* File Attachments */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 border-b-2 border-blue-200 pb-2">
                  Supporting Documents
                </h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-600 mb-2">Drag and drop files here, or click to browse</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload').click()}
                      className="mt-2"
                    >
                      Browse Files
                    </Button>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Attached Files:</Label>
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{file.name}</p>
                              <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Workflow Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Next Steps - Approval Workflow</h4>
                <p className="text-sm text-blue-600 mb-3">
                  Once submitted, your initiative will go through the following approval process:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-600">
                  <div>• Step 1: Site TSD Lead Registration</div>
                  <div>• Step 2: Site Head Approval</div>
                  <div>• Step 3: Engineering Head - Define Responsibilities</div>
                  <div>• Step 4: Initiative Lead - MOC Assessment</div>
                  <div>• Step 5: Initiative Lead - MOC Process</div>
                  <div>• Step 6: Initiative Lead - CAPEX Assessment</div>
                  <div>• Step 7: Site TSD Lead - CAPEX Process</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                >
                  <Send className="mr-2 h-5 w-5" />
                  {loading ? 'Submitting Initiative...' : 'Submit Initiative for Approval'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InitiativeForm;