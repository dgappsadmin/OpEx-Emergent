import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

const WorkflowSummary = ({ initiatives, user }) => {
  // Calculate workflow statistics
  const myActions = initiatives.filter(initiative => {
    // This would need to be enhanced with proper user role checking
    return initiative.status === 'PROPOSED' || initiative.status === 'IN_PROGRESS';
  });

  const completedInitiatives = initiatives.filter(i => i.status === 'COMPLETED');
  const inProgressInitiatives = initiatives.filter(i => i.status === 'IN_PROGRESS');
  const pendingInitiatives = initiatives.filter(i => i.status === 'PROPOSED');

  const totalSavings = initiatives.reduce((sum, i) => sum + (i.estimatedSavings || 0), 0);
  const completedSavings = completedInitiatives.reduce((sum, i) => sum + (i.estimatedSavings || 0), 0);

  const completionRate = initiatives.length > 0 ? (completedInitiatives.length / initiatives.length * 100) : 0;

  const stats = [
    {
      title: 'My Pending Actions',
      value: myActions.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Items requiring your attention'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Overall completion percentage'
    },
    {
      title: 'Total Savings',
      value: `₹${(totalSavings / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Expected cost savings'
    },
    {
      title: 'Active Workflows',
      value: inProgressInitiatives.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Currently in progress'
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Workflow Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-700">{stat.title}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Status Breakdown */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed: {completedInitiatives.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>In Progress: {inProgressInitiatives.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Pending: {pendingInitiatives.length}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Total: {initiatives.length} initiatives
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowSummary;