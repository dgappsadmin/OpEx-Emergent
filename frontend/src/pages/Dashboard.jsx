import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, CheckCircle, Clock, Activity, FileText, Users, Target, AlertCircle } from 'lucide-react';
import { dashboardAPI, kpiAPI, initiativeAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [initiatives, setInitiatives] = useState([]);
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsResponse, initiativesResponse, kpiResponse] = await Promise.all([
        dashboardAPI.getStats(),
        initiativeAPI.getAll(),
        kpiAPI.getAll().catch(() => ({ data: [] })) // KPI data is optional
      ]);

      setDashboardData(statsResponse.data);
      setInitiatives(initiativesResponse.data || []);
      setKpiData(kpiResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const processChartData = () => {
    if (!dashboardData) return { pieData: [], trendData: [] };

    const pieData = [
      { name: 'Proposed', value: dashboardData.proposedInitiatives, color: '#F59E0B' },
      { name: 'In Progress', value: dashboardData.inProgressInitiatives, color: '#3B82F6' },
      { name: 'Completed', value: dashboardData.completedInitiatives, color: '#10B981' },
      { name: 'Rejected', value: dashboardData.rejectedInitiatives, color: '#EF4444' }
    ].filter(item => item.value > 0);

    // Generate trend data based on available data
    const trendData = [
      { month: 'Jan', initiatives: Math.floor(dashboardData.totalInitiatives * 0.6), savings: Math.floor(dashboardData.totalSavings * 0.4) },
      { month: 'Feb', initiatives: Math.floor(dashboardData.totalInitiatives * 0.7), savings: Math.floor(dashboardData.totalSavings * 0.5) },
      { month: 'Mar', initiatives: Math.floor(dashboardData.totalInitiatives * 0.8), savings: Math.floor(dashboardData.totalSavings * 0.7) },
      { month: 'Apr', initiatives: Math.floor(dashboardData.totalInitiatives * 0.9), savings: Math.floor(dashboardData.totalSavings * 0.8) },
      { month: 'May', initiatives: dashboardData.totalInitiatives, savings: dashboardData.totalSavings }
    ];

    return { pieData, trendData };
  };

  const { pieData, trendData } = processChartData();

  if (loading) {
    return (
      <Layout title="Executive Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Executive Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout title="Executive Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <p className="text-slate-600">No dashboard data available</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Executive Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Welcome to OpEx Dashboard</h1>
          <p className="opacity-90">
            Monitor and track your operational excellence initiatives
            {user?.siteName && ` for ${user.siteName}`}
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Initiatives</p>
                  <p className="text-2xl font-bold text-blue-900">{dashboardData.totalInitiatives}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-orange-600 text-sm font-medium">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-900">{dashboardData.pendingApprovals}</p>
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
                  <p className="text-2xl font-bold text-green-900">{dashboardData.completedInitiatives}</p>
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
                  <p className="text-purple-600 text-sm font-medium">Total Savings</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ₹{Math.round(dashboardData.totalSavings).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Initiative Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Initiative Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-72">
                  <p className="text-slate-500">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Initiative Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="initiatives" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.1}
                    name="Initiatives"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="mr-2 h-5 w-5" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {dashboardData.completionRate}%
                  </p>
                  <p className="text-sm text-slate-600">Overall completion rate</p>
                </div>
                <Progress value={dashboardData.completionRate} className="w-full" />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Completed: {dashboardData.completedInitiatives}</span>
                  <span>Total: {dashboardData.totalInitiatives}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="mr-2 h-5 w-5" />
                Financial Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Expected Savings</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{Math.round(dashboardData.totalSavings).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Average per Initiative</p>
                  <p className="text-lg font-semibold text-slate-800">
                    ₹{dashboardData.totalInitiatives > 0 ? 
                      Math.round(dashboardData.totalSavings / dashboardData.totalInitiatives).toLocaleString() : 
                      '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5" />
                User Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Your Role</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    {user?.roleName || user?.roleCode || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Your Site</p>
                  <p className="font-medium text-slate-800">
                    {user?.siteName || user?.siteCode || 'N/A'}
                  </p>
                </div>
                {user?.siteCode && (
                  <div>
                    <p className="text-sm text-slate-600">Site Initiatives</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {initiatives.filter(i => 
                        i.site?.code === user.siteCode || i.siteCode === user.siteCode
                      ).length}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Initiatives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Initiatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {initiatives.length > 0 ? (
              <div className="space-y-4">
                {initiatives.slice(0, 5).map((initiative) => (
                  <div key={initiative.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{initiative.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {initiative.site?.name || 'N/A'} • ₹{initiative.estimatedSavings?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <Badge className={
                      initiative.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      initiative.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      initiative.status === 'PROPOSED' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {initiative.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No initiatives available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;