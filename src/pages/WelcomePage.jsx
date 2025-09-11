import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Users, LogIn, UserPlus, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { signInAsGuest } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleContinueAsGuest = async () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      signInAsGuest();
      navigate('/dashboard');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">Natural Query Explorer</h1>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Database className="h-4 w-4" />
              Database Query Made Simple
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Welcome to Natural Query Explorer
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your database interactions with natural language queries. 
              Ask questions in plain English and get intelligent responses from your data.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <div className="mx-auto p-3 rounded-full bg-blue-100 w-fit mb-4">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Manage Databases</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect and manage up to 5 databases with ease. Organize your data sources efficiently.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <div className="mx-auto p-3 rounded-full bg-green-100 w-fit mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Natural Language</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ask questions in plain English. No complex queries needed - just natural conversation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <div className="mx-auto p-3 rounded-full bg-purple-100 w-fit mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get intelligent insights and analysis powered by advanced AI technology.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Authentication Options */}
          <Card className="max-w-2xl mx-auto bg-gradient-card shadow-soft border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>
                Choose how you'd like to begin your journey with Natural Query Explorer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  size="lg"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-muted transition-smooth"
                >
                  <LogIn className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Sign In</div>
                    <div className="text-xs text-muted-foreground">Access your saved databases</div>
                  </div>
                </Button>

                <Button
                  onClick={handleSignUp}
                  variant="outline"
                  size="lg"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-muted transition-smooth"
                >
                  <UserPlus className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Sign Up</div>
                    <div className="text-xs text-muted-foreground">Create a new account</div>
                  </div>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                onClick={handleContinueAsGuest}
                disabled={isLoading}
                size="lg"
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 h-auto p-6 flex items-center justify-center gap-3"
              >
                <ArrowRight className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-semibold">
                    {isLoading ? 'Loading...' : 'Continue as Guest'}
                  </div>
                  <div className="text-xs opacity-90">
                    Try without creating an account
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="text-center mt-12 text-sm text-muted-foreground">
            <p>
              Guest mode provides limited functionality. Sign up for full access to save and manage your databases.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;
