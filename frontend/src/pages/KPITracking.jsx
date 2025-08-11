import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Recycle, 
  Clock, 
  Leaf,
  Plus,
  Download,
  Filter,
  BarChart3
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { kpiAPI } from '../services/api';

const KPITracking = () => {
  const { toast } = useToast();
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('costSavings');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newKPI, setNewKPI] = useState({
    month: '',
    site: '',
    actualValue: '',
    targetValue: '',
    kpiType: 'COST_SAVINGS'
  });

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        const response = await kpiAPI.getAll();
        setKpis(response.data || []);
      } catch (error) {
        console.error('Error fetching KPIs:', error);
        setError('Failed to load KPI data');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'accepted', label: 'Accepted', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'under-approvals', label: 'Under Approvals', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'implemented', label: 'Implemented', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { value: 'validated', label: 'Validated', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'dropped', label: 'Dropped', color: 'bg-red-100 text-red-800 border-red-200' }
  ];

  const kpiMetrics = [
    { key: 'costSavings', label: 'Cost Savings', icon: DollarSign, color: '#3B82F6', unit: '₹K' },
    { key: 'energySavings', label: 'Energy Savings', icon: Zap, color: '#F59E0B', unit: 'MWh' },
    { key: 'productivityGain', label: 'Productivity Gain', icon: TrendingUp, color: '#10B981', unit: '%' },
    { key: 'wasteReduction', label: 'Waste Reduction', icon: Recycle, color: '#8B5CF6', unit: '%' },
    { key: 'co2Reduction', label: 'CO₂ Reduction', icon: Leaf, color: '#06B6D4', unit: 'MT' },
    { key: 'cycleTimeReduction', label: 'Cycle Time Reduction', icon: Clock, color: '#EF4444', unit: '%' }
  ];

  const handleKPISubmit = async () => {
    try {
      const kpiData = {
        month: newKPI.month,
        site: newKPI.site,
        actualValue: parseFloat(newKPI.actualValue) || 0,
        targetValue: parseFloat(newKPI.targetValue) || 0,
        kpiType: newKPI.kpiType
      };

      await kpiAPI.create(kpiData);
      
      toast({
        title: 'KPI Data Added',
        description: 'Monthly KPI data has been successfully recorded.',
      });
      
      // Refresh KPI data
      const response = await kpiAPI.getAll();
      setKpis(response.data || []);
      
      setNewKPI({
        month: '',
        site: '',
        actualValue: '',
        targetValue: '',
        kpiType: 'COST_SAVINGS'
      });
    } catch (error) {
      console.error('Error adding KPI:', error);
      toast({
        title: 'Error',
        description: 'Failed to add KPI data. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const exportData = (format) => {
    toast({
      title: `Exporting to ${format.toUpperCase()}`,
      description: 'Your report is being generated and will download shortly.',
    });
  };

  // Process KPI data for charts - handle different data structures
  const processChartData = () => {
    if (!kpis || kpis.length === 0) return [];
    
    // Group KPIs by month for chart display
    const monthlyData = {};
    kpis.forEach(kpi => {
      const month = kpi.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month: month.split('-')[1] || month,
          costSavings: 0,
          energySavings: 0,
          productivity: 0
        };
      }
      
      // Map based on KPI type
      if (kpi.kpiType === 'COST_SAVINGS') {
        monthlyData[month].costSavings += kpi.actualValue || 0;
      } else if (kpi.kpiType === 'ENERGY_SAVINGS') {
        monthlyData[month].energySavings += kpi.actualValue || 0;
      } else if (kpi.kpiType === 'PRODUCTIVITY_GAIN') {
        monthlyData[month].productivity += kpi.actualValue || 0;
      }
    });

    return Object.values(monthlyData).map(data => ({
      ...data,
      costSavings: data.costSavings / 1000, // Convert to K
      energySavings: data.energySavings / 1000
    }));
  };

  const chartData = processChartData();

  const selectedMetricData = kpiMetrics.find(m => m.key === selectedMetric);

  return (
    <Layout title="KPI Tracking & Monthly Monitoring">
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
            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kpiMetrics.map((metric) => {
                const Icon = metric.icon;
                // Calculate latest values from real KPI data
                const relevantKPIs = kpis.filter(kpi => kpi.kpiType === metric.key.toUpperCase());
                const latestValue = relevantKPIs.length > 0 ? 
                  relevantKPIs[relevantKPIs.length - 1]?.actualValue || 0 : 0;
                const previousValue = relevantKPIs.length > 1 ? 
                  relevantKPIs[relevantKPIs.length - 2]?.actualValue || 0 : 0;
                const change = latestValue - previousValue;
                const changePercent = previousValue ? ((change / previousValue) * 100).toFixed(1) : 0;

                return (
                  <Card key={metric.key} className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}20` }}>
                          <Icon className="h-6 w-6" style={{ color: metric.color }} />
                        </div>
                        <Badge className={change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {change >= 0 ? '+' : ''}{changePercent}%
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">{metric.label}</p>
                        <p className="text-2xl font-bold" style={{ color: metric.color }}>
                          {metric.key === 'costSavings' || metric.key === 'energySavings' 
                            ? (latestValue / 1000).toFixed(1) 
                            : latestValue.toFixed(1)
                          } {metric.unit}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          vs last period: {change >= 0 ? '+' : ''}{change.toFixed(1)} {metric.unit}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

        {/* Chart and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <span>Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Metric</Label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kpiMetrics.map((metric) => (
                      <SelectItem key={metric.key} value={metric.key}>
                        {metric.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Status Filter</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="text-sm font-medium">Export Reports</Label>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => exportData('pdf')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF Report
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => exportData('excel')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Excel Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6" style={{ color: selectedMetricData?.color }} />
                <span>{selectedMetricData?.label} Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedMetricData?.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={selectedMetricData?.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      `${value} ${selectedMetricData?.unit}`, 
                      selectedMetricData?.label
                    ]} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke={selectedMetricData?.color} 
                    fillOpacity={1} 
                    fill={`url(#gradient-${selectedMetric})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Status Categories and Financial Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Initiative Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center justify-between p-3 rounded-lg border">
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                    <span className="text-sm font-medium">
                      {Math.floor(Math.random() * 10) + 1}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Financial Metrics</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Monthly KPI Data</DialogTitle>
                  </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Month</Label>
                          <Input
                            type="month"
                            value={newKPI.month}
                            onChange={(e) => setNewKPI({...newKPI, month: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Site</Label>
                          <Select onValueChange={(value) => setNewKPI({...newKPI, site: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select site" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="plant-a">Plant A</SelectItem>
                              <SelectItem value="plant-b">Plant B</SelectItem>
                              <SelectItem value="plant-c">Plant C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>KPI Type</Label>
                          <Select onValueChange={(value) => setNewKPI({...newKPI, kpiType: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select KPI type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COST_SAVINGS">Cost Savings</SelectItem>
                              <SelectItem value="ENERGY_SAVINGS">Energy Savings</SelectItem>
                              <SelectItem value="PRODUCTIVITY_GAIN">Productivity Gain</SelectItem>
                              <SelectItem value="WASTE_REDUCTION">Waste Reduction</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Actual Value</Label>
                          <Input
                            type="number"
                            value={newKPI.actualValue}
                            onChange={(e) => setNewKPI({...newKPI, actualValue: e.target.value})}
                            placeholder="Actual value achieved"
                          />
                        </div>
                        <div>
                          <Label>Target Value</Label>
                          <Input
                            type="number"
                            value={newKPI.targetValue}
                            onChange={(e) => setNewKPI({...newKPI, targetValue: e.target.value})}
                            placeholder="Target value"
                          />
                        </div>
                      </div>
                      <Button onClick={handleKPISubmit} className="w-full" disabled={loading}>
                        Add KPI Data
                      </Button>
                    </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm font-medium text-green-800">Estimated Annual Savings</p>
                    <p className="text-2xl font-bold text-green-900">₹24.5L</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Budgeted Savings</p>
                    <p className="text-lg font-bold text-blue-900">₹18.2L</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-800">Non-budgeted</p>
                    <p className="text-lg font-bold text-orange-900">₹6.3L</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Total CAPEX</p>
                      <p className="text-xl font-bold text-purple-900">₹12.8L</p>
                    </div>
                    <p className="text-sm text-purple-700">ROI: 91%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed KPI Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly KPI Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="costSavings" fill="#3B82F6" name="Cost Savings (₹K)" />
                <Bar dataKey="energySavings" fill="#10B981" name="Energy Savings (MWh)" />
                <Bar dataKey="productivity" fill="#F59E0B" name="Productivity %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default KPITracking;