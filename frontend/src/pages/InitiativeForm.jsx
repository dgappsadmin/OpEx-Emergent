import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Save, Send, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { initiativeAPI, lookupAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const InitiativeForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    siteCode: user?.siteCode || '',
    disciplineCode: '',
    budgetType: 'BUDGETED',
    description: '',
    estimatedSavings: '',
    priority: 'MEDIUM',
    category: 'COST_REDUCTION',
    proposer: user?.email || '',
    expectedClosureDate: '',
    comments: ''
  });

  // Load lookup data on component mount
  useEffect(() => {
    loadLookupData();
  }, []);

  const loadLookupData = async () => {
    try {
      const [sitesResponse, disciplinesResponse] = await Promise.all([
        lookupAPI.getSites(),
        lookupAPI.getDisciplines()
      ]);
      
      setSites(sitesResponse.data || []);
      setDisciplines(disciplinesResponse.data || []);
      
      // Pre-select user's site if available
      if (user?.siteCode && !formData.siteCode) {
        setFormData(prev => ({ ...prev, siteCode: user.siteCode }));
      }
      
    } catch (error) {
      console.error('Error loading lookup data:', error);
      toast({
        title: 'Warning',
        description: 'Could not load site and discipline data. Some fields may not work properly.',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.siteCode) errors.push('Site is required');
    if (!formData.disciplineCode) errors.push('Discipline is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.estimatedSavings || parseFloat(formData.estimatedSavings) <= 0) {
      errors.push('Valid estimated savings amount is required');
    }
    if (!formData.expectedClosureDate) errors.push('Expected closure date is required');
    
    // Check if expected closure date is in the future
    if (formData.expectedClosureDate) {
      const closureDate = new Date(formData.expectedClosureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (closureDate <= today) {
        errors.push('Expected closure date must be in the future');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the request data
      const requestData = {
        title: formData.title.trim(),
        siteCode: formData.siteCode,
        disciplineCode: formData.disciplineCode,
        description: formData.description.trim(),
        category: formData.category,
        proposer: formData.proposer || user?.email || 'unknown',
        expectedClosureDate: formData.expectedClosureDate,
        estimatedSavings: parseFloat(formData.estimatedSavings),
        priority: formData.priority,
        budgetType: formData.budgetType,
        comments: formData.comments?.trim() || null
      };

      const response = await initiativeAPI.create(requestData);
      
      toast({
        title: 'Success!',
        description: 'Initiative created successfully and workflow has been started.',
      });
      
      // Navigate to workflow management page
      navigate('/workflow');
      
    } catch (error) {
      console.error('Error creating initiative:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create initiative. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      siteCode: user?.siteCode || '',
      disciplineCode: '',
      budgetType: 'BUDGETED',
      description: '',
      estimatedSavings: '',
      priority: 'MEDIUM',
      category: 'COST_REDUCTION',
      proposer: user?.email || '',
      expectedClosureDate: '',
      comments: ''
    });
  };

  // Calculate minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Layout title="Create New Initiative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Create New Initiative</h1>
          <p className="text-slate-600">
            Submit a new operational excellence initiative for approval and tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Initiative Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter initiative title"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('category', value)} value={formData.category}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COST_REDUCTION">Cost Reduction</SelectItem>
                      <SelectItem value="PRODUCTIVITY">Productivity Improvement</SelectItem>
                      <SelectItem value="QUALITY">Quality Enhancement</SelectItem>
                      <SelectItem value="SAFETY">Safety Improvement</SelectItem>
                      <SelectItem value="ENVIRONMENT">Environmental</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="site" className="text-sm font-medium">
                    Site *
                  </Label>
                  <Select 
                    onValueChange={(value) => handleInputChange('siteCode', value)} 
                    value={formData.siteCode}
                    disabled={user?.siteCode} // Disable if user has a specific site
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.code}>
                          {site.name} ({site.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {user?.siteCode && (
                    <p className="text-xs text-slate-500 mt-1">
                      Site is pre-selected based on your profile
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="discipline" className="text-sm font-medium">
                    Discipline *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('disciplineCode', value)} value={formData.disciplineCode}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplines.map((discipline) => (
                        <SelectItem key={discipline.id} value={discipline.code}>
                          {discipline.name} ({discipline.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('priority', value)} value={formData.priority}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budgetType" className="text-sm font-medium">
                    Budget Type *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('budgetType', value)} value={formData.budgetType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select budget type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUDGETED">Budgeted</SelectItem>
                      <SelectItem value="NON_BUDGETED">Non-Budgeted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a detailed description of the initiative..."
                  className="mt-2"
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Financial & Timeline Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="estimatedSavings" className="text-sm font-medium">
                    Estimated Savings (₹) *
                  </Label>
                  <Input
                    id="estimatedSavings"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedSavings}
                    onChange={(e) => handleInputChange('estimatedSavings', e.target.value)}
                    placeholder="Enter estimated savings amount"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expectedClosureDate" className="text-sm font-medium">
                    Expected Closure Date *
                  </Label>
                  <Input
                    id="expectedClosureDate"
                    type="date"
                    min={getMinDate()}
                    value={formData.expectedClosureDate}
                    onChange={(e) => handleInputChange('expectedClosureDate', e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="comments" className="text-sm font-medium">
                  Additional Comments
                </Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  placeholder="Any additional comments or notes..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Initiative
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default InitiativeForm;