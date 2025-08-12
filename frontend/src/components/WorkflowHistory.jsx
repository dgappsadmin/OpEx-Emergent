import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MessageSquare,
  Calendar,
  ArrowDown
} from 'lucide-react';
import { workflowAPI } from '../services/api';

const WorkflowHistory = ({ initiativeId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!initiativeId) return;
      
      try {
        setLoading(true);
        const response = await workflowAPI.getTransactions(initiativeId);
        setTransactions(response.data || []);
      } catch (error) {
        console.error('Error fetching workflow history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [initiativeId]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Workflow Transaction History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No workflow history available</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div key={transaction.id} className="relative">
                {/* Timeline connector */}
                {index < transactions.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                
                <div className="flex space-x-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200">
                    {getStatusIcon(transaction.status)}
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            Step {transaction.stageNumber}: {transaction.stageName}
                          </span>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                        
                        {/* Action Details */}
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Action by: {transaction.actionBy || 'System'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Date: {formatDate(transaction.actionDate)}</span>
                          </div>
                          {transaction.pendingWith && (
                            <div className="flex items-center space-x-2">
                              <ArrowDown className="h-4 w-4" />
                              <span>Pending with: {transaction.pendingWith}</span>
                            </div>
                          )}
                        </div>

                        {/* Comments */}
                        {transaction.comment && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <MessageSquare className="h-4 w-4 inline mr-2" />
                              {transaction.comment}
                            </p>
                          </div>
                        )}

                        {/* Additional Details */}
                        <div className="mt-2 space-y-1">
                          {transaction.mocRequired !== null && (
                            <div className="text-xs text-gray-500">
                              MOC Required: {transaction.mocRequired ? 'Yes' : 'No'}
                              {transaction.mocNumber && ` (${transaction.mocNumber})`}
                            </div>
                          )}
                          {transaction.capexRequired !== null && (
                            <div className="text-xs text-gray-500">
                              CAPEX Required: {transaction.capexRequired ? 'Yes' : 'No'}
                            </div>
                          )}
                          {transaction.initiativeLead && (
                            <div className="text-xs text-gray-500">
                              Initiative Lead: {transaction.initiativeLead}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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