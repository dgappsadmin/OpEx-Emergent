import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { Factory, Shield, Users, TrendingUp, ChevronRight, Eye, EyeOff, UserPlus } from 'lucide-react';

const Login = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const demoLogin = () => {
    setFormData({ email: 'nds_stld@godeepak.com', password: 'password123' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Branding & Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-indigo-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-slate-400/20 rounded-full blur-lg animate-bounce"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo and Company Name */}
          <div className="flex items-center space-x-4">
            <img 
              src="https://www.godeepak.com/wp-content/uploads/2024/01/DNL-Logo.png" 
              alt="DNL Logo" 
              className="h-12 w-auto brightness-110"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">DNL OpEx Hub</h1>
              <p className="text-blue-200 text-sm">Operational Excellence Platform</p>
            </div>
          </div>

          {/* Middle Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Transform Your
                <span className="block text-blue-300">Manufacturing Operations</span>
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Streamline processes, track KPIs, and drive continuous improvement across your chemical manufacturing operations.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <div className="p-2 bg-blue-500/30 rounded-lg">
                  <Factory className="h-6 w-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Process Optimization</h3>
                  <p className="text-blue-200 text-sm">Enhance manufacturing efficiency</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <div className="p-2 bg-indigo-500/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Real-time Analytics</h3>
                  <p className="text-blue-200 text-sm">Data-driven decision making</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <div className="p-2 bg-slate-500/30 rounded-lg">
                  <Shield className="h-6 w-6 text-slate-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Compliance Management</h3>
                  <p className="text-blue-200 text-sm">Maintain industry standards</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300">500+</div>
              <div className="text-blue-200 text-sm">Initiatives Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-300">98%</div>
              <div className="text-blue-200 text-sm">Process Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-300">24/7</div>
              <div className="text-blue-200 text-sm">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo for smaller screens */}
          <div className="lg:hidden flex items-center justify-center mb-8 space-x-3">
            <img 
              src="https://www.godeepak.com/wp-content/uploads/2024/01/DNL-Logo.png" 
              alt="DNL Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">DNL OpEx Hub</h1>
              <p className="text-slate-600 text-sm">Operational Excellence Platform</p>
            </div>
          </div>

          <Card className="bg-white/70 backdrop-blur-lg border border-white/50 shadow-2xl">
            <CardHeader className="space-y-4 pb-8">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</CardTitle>
                <p className="text-slate-600">Please sign in to your account to continue</p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your @godeepak.com email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm pr-12 transition-all duration-300"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remember" className="text-slate-600">Remember me</label>
                  </div>
                  <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>

                {/* Create Account Section */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">New to OpEx Hub?</span>
                  </div>
                </div>

                <Link to="/register">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 font-medium"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create New Account
                  </Button>
                </Link>

                {/* Demo Login Button */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or try demo</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={demoLogin}
                  className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Demo Login (NDS Site TSD Lead)
                </Button>
              </form>

              {/* Additional Help Text */}
              <div className="text-center text-sm text-slate-600 pt-4 space-y-2">
                <p>
                  <strong>New User?</strong> Use your @godeepak.com email to create an account
                </p>
                <p className="text-xs text-slate-500">
                  By accessing this system, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info for smaller screens */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Need help? Contact{' '}
              <a href="mailto:support@dnl.com" className="text-blue-600 hover:underline">
                support@dnl.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;