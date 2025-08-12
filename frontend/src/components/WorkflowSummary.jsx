import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  TrendingUp
} from 'lucide-react';

const WorkflowSummary = ({ initiatives = [], user = {} }) => {
  // Calculate statistics
  const totalInitiatives = initiatives.length;
  const proposedInitiatives = initiatives.filter(i => i.status === 'PROPOSED').length;
  const inProgressInitiatives = initiatives.filter(i => i.status === 'IN_PROGRESS').length;
  const completedInitiatives = initiatives.filter(i => i.status === 'COMPLETED').length;
  const rejectedInitiatives = initiatives.filter(i => i.status === 'REJECTED').length;
  
  const totalSavings = initiatives.reduce((sum, i) => sum + (i.estimatedSavings || 0), 0);
  const completedSavings = initiatives
    .filter(i => i.status === 'COMPLETED')
    .reduce((sum, i) => sum + (i.estimatedSavings || 0), 0);

  // Calculate user-specific metrics
  const userSiteInitiatives = initiatives.filter(i => 
    i.site?.code === user.siteCode || i.siteCode === user.siteCode
  );

  const completionRate = totalInitiatives > 0 ? 
    Math.round((completedInitiatives / totalInitiatives) * 100) : 0;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-blue-600" />
          Workflow Summary
        </CardTitle>
        <p className="text-slate-600">
          Overview of all initiatives and workflow progress
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Initiatives */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-800">{totalInitiatives}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {proposedInitiatives + inProgressInitiatives}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedInitiatives}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedInitiatives}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Expected Savings</p>
                <p className="text-xl font-bold text-slate-800">
                  ₹{totalSavings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Realized Savings</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{completedSavings.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completion Rate</p>
                <p className="text-xl font-bold text-blue-600">{completionRate}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* User-Specific Information */}
        {user.siteCode && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-slate-800 mb-3">Your Site Overview</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Site Initiatives</p>
                <p className="text-lg font-bold text-slate-800">{userSiteInitiatives.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Your Role</p>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  {user.roleName || user.roleCode || 'N/A'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Status Breakdown */}
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
          <h4 className="font-medium text-slate-800 mb-3">Status Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              Proposed: {proposedInitiatives}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              In Progress: {inProgressInitiatives}
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Completed: {completedInitiatives}
            </Badge>
            {rejectedInitiatives > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                Rejected: {rejectedInitiatives}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowSummary;