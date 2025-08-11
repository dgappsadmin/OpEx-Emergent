import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  FileX, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  MessageSquare,
  PenTool,
  Send,
  TrendingUp,
  DollarSign,
  Target,
  Users
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from '../hooks/use-toast';
import { initiativeAPI } from '../services/api';

const InitiativeClosure = () => {
  const { toast } = useToast();
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const signatureRef = useRef(null);

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        setLoading(true);
        // Fetch initiatives that are completed or ready for closure
        const response = await initiativeAPI.getAll();
        const closureReadyInitiatives = response.data?.filter(
          initiative => initiative.status === 'APPROVED' || initiative.status === 'COMPLETED'
        ) || [];
        
        setInitiatives(closureReadyInitiatives);
        if (closureReadyInitiatives.length > 0) {
          setSelectedInitiative(closureReadyInitiatives[0]);
        }
      } catch (error) {
        console.error('Error fetching initiatives:', error);
        setError('Failed to load closure data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitiatives();
  }, []);

  const getStageIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'waiting':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'waiting':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleStageAction = async (action) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: action === 'approve' ? 'Stage Approved!' : 'Stage Rejected',
      description: `Closure process has been ${action === 'approve' ? 'moved to next stage' : 'rejected'}.`,
    });
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    console.log('Adding comment:', newComment);
    toast({
      title: 'Comment Added',
      description: 'Your comment has been added to the closure process.',
    });
    setNewComment('');
  };

  const saveSignature = () => {
    if (signatureRef.current.isEmpty()) {
      toast({
        title: 'Signature Required',
        description: 'Please provide your digital signature.',
        variant: 'destructive'
      });
      return;
    }

    const signatureData = signatureRef.current.toDataURL();
    console.log('Signature saved:', signatureData);
    
    toast({
      title: 'Signature Captured',
      description: 'Your digital signature has been saved.',
    });
    
    setSignatureDialogOpen(false);
  };

  const completionPercentage = selectedInitiative ? 
    ((selectedInitiative.estimatedSavings || 0) / (selectedInitiative.estimatedSavings || 1)) * 100 : 0;

  return (
    <Layout title="Initiative Closure Management">
      <div className="space-y-8">
        {loading && (
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
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
        )}

        {!loading && !error && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <FileX className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Ready for Closure</p>
                      <p className="text-2xl font-bold text-purple-900">{initiatives.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Value</p>
                      <p className="text-2xl font-bold text-green-900">
                        ₹{(initiatives.reduce((sum, init) => sum + (init.estimatedSavings || 0), 0) / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Average Value</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ₹{initiatives.length > 0 ? 
                          ((initiatives.reduce((sum, init) => sum + (init.estimatedSavings || 0), 0) / initiatives.length) / 1000).toFixed(0) : 0}K
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Target className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Sites Covered</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {new Set(initiatives.map(init => init.site?.name || init.site?.code || 'Unknown')).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Closure Details */}
            {selectedInitiative && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl">{selectedInitiative.title}</CardTitle>
                  <p className="text-blue-100">Initiative ID: {selectedInitiative.initiativeId || selectedInitiative.id}</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Proposer</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{selectedInitiative.proposer}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Expected Savings</Label>
                        <p className="text-lg font-bold text-slate-900 mt-1">₹{selectedInitiative.estimatedSavings?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Site</Label>
                        <p className="text-sm text-slate-700 mt-1">{selectedInitiative.site?.name || selectedInitiative.site?.code || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Status</Label>
                        <Badge className="mt-1">
                          {selectedInitiative.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-800">Description</Label>
                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <p className="text-sm text-slate-700">{selectedInitiative.description}</p>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4">
                      <Label className="font-semibold text-slate-800">Closure Comments</Label>
                      <div className="flex space-x-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add closure comment..."
                          className="flex-1"
                        />
                        <Button onClick={addComment} className="px-6">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Closure Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Closure Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800">Initiative Outcomes</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-green-800">Approved</span>
                        <span className="font-bold text-green-900">
                          {initiatives.filter(i => i.status === 'APPROVED').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-800">In Progress</span>
                        <span className="font-bold text-blue-900">
                          {initiatives.filter(i => i.status === 'IN_PROGRESS').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-sm font-medium text-orange-800">Completed</span>
                        <span className="font-bold text-orange-900">
                          {initiatives.filter(i => i.status === 'COMPLETED').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800">Financial Impact</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Total Value</span>
                        <span className="font-bold">₹{(initiatives.reduce((sum, init) => sum + (init.estimatedSavings || 0), 0) / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Average per Initiative</span>
                        <span className="font-bold text-green-600">
                          ₹{initiatives.length > 0 ? ((initiatives.reduce((sum, init) => sum + (init.estimatedSavings || 0), 0) / initiatives.length) / 1000).toFixed(0) : 0}K
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Sites Covered</span>
                        <span className="font-bold text-orange-600">{new Set(initiatives.map(init => init.site?.name || init.site?.code || 'Unknown')).size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                        <p className="text-sm font-medium text-blue-600">Priority Distribution</p>
                        <div className="text-xs text-blue-700 mt-2 space-y-1">
                          <div>High: {initiatives.filter(i => i.priority === 'HIGH').length}</div>
                          <div>Medium: {initiatives.filter(i => i.priority === 'MEDIUM').length}</div>
                          <div>Low: {initiatives.filter(i => i.priority === 'LOW').length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default InitiativeClosure;