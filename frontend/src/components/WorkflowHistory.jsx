import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle, User, Calendar, MessageSquare } from 'lucide-react';
import { workflowAPI } from '../services/api';

const WorkflowHistory = ({ initiativeId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initiativeId) {
      fetchWorkflowHistory();
    }
  }, [initiativeId]);

  const fetchWorkflowHistory = async () => {
    try {
      setLoading(true);
      const response = await workflowAPI.getTransactions(initiativeId);
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching workflow history:', error);
      setError('Failed to load workflow history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchWorkflowHistory}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Workflow History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No workflow history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div key={transaction.id || index} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <span className="text-blue-600 font-semibold text-sm">
                        {transaction.stageNumber || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">
                        {transaction.stageName || 'Unknown Stage'}
                      </h4>
                      <p className="text-sm text-slate-600">
                        Step {transaction.stageNumber || 'N/A'} of 5
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {getStatusIcon(transaction.status)}
                    <span className="ml-1">{transaction.status || 'Unknown'}</span>
                  </Badge>
                </div>

                {/* Transaction Details */}
                <div className="space-y-2 text-sm">
                  {transaction.comment && (
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700">{transaction.comment}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-slate-500">
                    {transaction.actionBy && (
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{transaction.actionBy}</span>
                      </div>
                    )}
                    {transaction.actionDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(transaction.actionDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Details */}
                  {(transaction.mocRequired || transaction.capexRequired || transaction.initiativeLead) && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <h5 className="font-medium text-blue-800 mb-2">Additional Details:</h5>
                      <div className="space-y-1 text-sm">
                        {transaction.mocRequired && (
                          <p className="text-blue-700">
                            MOC Required: Yes
                            {transaction.mocNumber && (
                              <span className="ml-2 font-medium">({transaction.mocNumber})</span>
                            )}
                          </p>
                        )}
                        {transaction.capexRequired && (
                          <p className="text-blue-700">
                            CAPEX Required: Yes
                            {transaction.capexDetails && (
                              <span className="block mt-1 text-xs">{transaction.capexDetails}</span>
                            )}
                          </p>
                        )}
                        {transaction.initiativeLead && (
                          <p className="text-blue-700">
                            Initiative Lead: {transaction.initiativeLead}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pending With */}
                  {transaction.pendingWith && transaction.status === 'PENDING' && (
                    <div className="mt-2 text-orange-600 text-sm">
                      Awaiting action from: {transaction.pendingWith}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowHistory;