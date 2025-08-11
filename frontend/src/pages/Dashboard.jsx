import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, CheckCircle, Clock, Activity, FileText, Users, Target } from 'lucide-react';
import { dashboardAPI, kpiAPI, initiativeAPI } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats and KPI data in parallel
        const [statsResponse, kpiResponse] = await Promise.all([
          dashboardAPI.getStats(),
          kpiAPI.getAll()
        ]);

        setDashboardData(statsResponse.data);
        setKpiData(kpiResponse.data || []);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const statusData = [
    { name: 'Approved', value: dashboardData?.approvedInitiatives || 0, color: '#10B981' },
    { name: 'Pending', value: dashboardData?.pendingInitiatives || 0, color: '#F59E0B' },
    { name: 'In Progress', value: dashboardData?.inProgressInitiatives || 0, color: '#3B82F6' },
  ];

  const monthlyTrends = kpiData.slice(-6).map((kpi, index) => ({
    month: `Month ${index + 1}`, // You can format this based on your date format
    savings: (kpi.costSavings || 0) / 1000,
    energy: (kpi.energySavings || 0) / 1000,
    productivity: kpi.productivityGain || 0
  }));

  const getActivityIcon = (type) => {
    switch(type) {
      case 'create': return <FileText size={16} className="text-blue-500" />;
      case 'approve': return <CheckCircle size={16} className="text-green-500" />;
      case 'update': return <Activity size={16} className="text-orange-500" />;
      case 'complete': return <Target size={16} className="text-purple-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <Layout title="Executive Dashboard">
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Initiatives</p>
                  <p className="text-3xl font-bold text-blue-900">{dashboardData?.totalInitiatives || 0}</p>
                </div>
                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Savings</p>
                  <p className="text-3xl font-bold text-green-900">₹{((dashboardData?.totalSavings || 0) / 100000).toFixed(1)}L</p>
                </div>
                <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-orange-900">{dashboardData?.completionRate || 0}%</p>
                </div>
                <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Pending Approvals</p>
                  <p className="text-3xl font-bold text-purple-900">{dashboardData?.pendingInitiatives || 0}</p>
                </div>
                <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {monthlyTrends.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Savings Trend */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800">Monthly Savings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrends}>
                    <defs>
                      <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}K`, 'Savings']} />
                    <Area type="monotone" dataKey="savings" stroke="#3B82F6" fillOpacity={1} fill="url(#savingsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Initiative Status Distribution */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800">Initiative Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-6 mt-4">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Towards Target */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Annual Savings Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-slate-700">
                  Current: ₹{((dashboardData?.totalSavings || 0) / 100000).toFixed(1)}L
                </span>
                <span className="text-lg font-medium text-slate-700">
                  Target: ₹{((dashboardData?.targetSavings || 3000000) / 100000).toFixed(1)}L
                </span>
              </div>
              <Progress 
                value={((dashboardData?.totalSavings || 0) / (dashboardData?.targetSavings || 3000000)) * 100} 
                className="h-4"
              />
              <p className="text-sm text-slate-600">
                {(((dashboardData?.totalSavings || 0) / (dashboardData?.targetSavings || 3000000)) * 100).toFixed(1)}% of annual target achieved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI Summary */}
        {kpiData.length > 0 && (
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">Latest KPI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Energy Savings</span>
                  <span className="text-lg font-bold text-blue-900">
                    {((kpiData[kpiData.length - 1]?.energySavings || 0) / 1000).toFixed(1)}K MWh
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Productivity Gain</span>
                  <span className="text-lg font-bold text-green-900">
                    {(kpiData[kpiData.length - 1]?.productivityGain || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-800">Waste Reduction</span>
                  <span className="text-lg font-bold text-orange-900">
                    {(kpiData[kpiData.length - 1]?.wasteReduction || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-800">CO₂ Reduction</span>
                  <span className="text-lg font-bold text-purple-900">
                    {(kpiData[kpiData.length - 1]?.co2Reduction || 0).toFixed(1)} MT
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;