import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { ChevronRight, Eye, EyeOff, Shield, Lock } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-blue-50 flex">
      {/* Left Side - Company Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        </div>

        {/* Subtle animated elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-32 left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl animate-pulse"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-16 text-white w-full">
          {/* Company Logo and Branding */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <img 
                src="https://www.godeepak.com/wp-content/uploads/2024/01/DNL-Logo.png" 
                alt="DNL Logo" 
                className="h-24 w-auto mx-auto brightness-110 mb-6"
              />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">DNL OpEx Hub</h1>
            <p className="text-xl text-blue-100 mb-2">Operational Excellence Platform</p>
            <p className="text-blue-200 text-lg">Internal Access Portal</p>
          </div>

          {/* Professional messaging */}
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-blue-100">
              Welcome to Your Workspace
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed mb-8">
              Access your operational excellence tools and resources through our secure internal portal.
            </p>
            
            {/* Security notice */}
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Shield className="h-6 w-6 text-blue-200" />
              <div className="text-left">
                <h3 className="font-semibold text-white text-sm">Secure Access</h3>
                <p className="text-blue-200 text-xs">Protected internal system</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-blue-300 text-sm">
              © 2024 DNL OpEx Hub - Internal Use Only
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-lg">
          {/* Mobile Logo for smaller screens */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="text-center">
              <img 
                src="https://www.godeepak.com/wp-content/uploads/2024/01/DNL-Logo.png" 
                alt="DNL Logo" 
                className="h-16 w-auto mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-slate-800 mb-2">DNL OpEx Hub</h1>
              <p className="text-slate-600">Internal Access Portal</p>
            </div>
          </div>

          <Card className="bg-white/80 backdrop-blur-lg border border-white/60 shadow-2xl">
            <CardHeader className="space-y-6 pb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-800 mb-3">Employee Login</CardTitle>
                <p className="text-slate-600 text-lg">Please authenticate to access your workspace</p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-slate-700 font-semibold text-base">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-14 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/90 backdrop-blur-sm transition-all duration-300 text-base"
                    placeholder="Enter your company email"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-slate-700 font-semibold text-base">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-14 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/90 backdrop-blur-sm pr-12 transition-all duration-300 text-base"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
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
                    <label htmlFor="remember" className="text-slate-600 font-medium">Remember me</label>
                  </div>
                  <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-200">
                <p>
                  For IT support, contact{' '}
                  <a href="mailto:support@dnl.com" className="text-blue-600 hover:underline font-medium">
                    support@dnl.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info for smaller screens */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-slate-600 text-sm">
              DNL OpEx Hub - Internal Use Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;