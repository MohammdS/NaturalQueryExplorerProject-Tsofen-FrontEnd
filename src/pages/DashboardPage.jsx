import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalTitle, ModalDescription } from '@/components/ui/modal';
import { Database, Plus, Settings, Trash2, ArrowRight, LogOut, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isGuest, 
    databases, 
    addDatabase, 
    deleteDatabase, 
    selectDatabase, 
    logout, 
    error, 
    clearError 
  } = useApp();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDatabase, setNewDatabase] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddDatabase = async (e) => {
    e.preventDefault();
    
    if (!newDatabase.name.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const database = addDatabase({
        name: newDatabase.name.trim(),
        description: newDatabase.description.trim() || 'No description provided',
      });
      
      setNewDatabase({ name: '', description: '' });
      setShowAddModal(false);
      
      // Navigate to the new database's chat
      selectDatabase(database);
      navigate('/chat');
    } catch (err) {
      console.error('Error adding database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDatabase = (databaseId, databaseName) => {
    if (window.confirm(`Are you sure you want to delete "${databaseName}"? This action cannot be undone.`)) {
      deleteDatabase(databaseId);
    }
  };

  const handleSelectDatabase = (database) => {
    selectDatabase(database);
    navigate('/chat');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {isGuest ? 'Guest Mode' : `Welcome back, ${user?.name || user?.email}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isGuest && (
                <Badge variant="outline" className="hidden sm:flex">
                  <User className="h-3 w-3 mr-1" />
                  {user?.email}
                </Badge>
              )}
              {isGuest && (
                <Badge variant="outline">
                  Guest Mode
                </Badge>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="transition-smooth hover:bg-muted"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isGuest ? 'Exit' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Your Databases</h2>
            <p className="text-muted-foreground">
              Manage and interact with your databases using natural language queries
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="mt-2 text-destructive hover:bg-destructive/10"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Databases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Database Cards */}
            {databases.map((database) => (
              <Card
                key={database.id}
                className="hover:shadow-elevated transition-all duration-300 cursor-pointer group"
                onClick={() => handleSelectDatabase(database)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-primary">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {database.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Created {new Date(database.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDatabase(database.id, database.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {database.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      Ready to Query
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Database Card */}
            {databases.length < 5 && (
              <Card
                className="border-dashed border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setShowAddModal(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] p-6">
                  <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    Add Database
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Create a new database connection to start querying
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Empty State */}
          {databases.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <Database className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Databases Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Get started by adding your first database. You can manage up to 5 databases at once.
                </p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Database
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Max Databases Message */}
          {databases.length >= 5 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm">
                <Settings className="h-4 w-4" />
                You've reached the maximum of 5 databases
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Database Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader>
          <ModalTitle>Add New Database</ModalTitle>
          <ModalDescription>
            Create a new database connection to start querying with natural language
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleAddDatabase}>
          <ModalContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="db-name" className="text-sm font-medium">
                Database Name *
              </label>
              <Input
                id="db-name"
                placeholder="e.g., Sales Database, User Analytics"
                value={newDatabase.name}
                onChange={(e) => setNewDatabase(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="db-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Input
                id="db-description"
                placeholder="Brief description of this database"
                value={newDatabase.description}
                onChange={(e) => setNewDatabase(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a demo application. In a real implementation, you would configure actual database connections here.
              </p>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !newDatabase.name.trim()}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isLoading ? 'Creating...' : 'Create Database'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
