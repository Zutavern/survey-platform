'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  UserPlus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Shield, 
  User,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'

type User = {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

type NewUserForm = {
  email: string
  name: string
  password: string
  role: 'ADMIN' | 'USER'
}

type EditUserForm = {
  id: string
  email: string
  name?: string
  password?: string
  role: 'ADMIN' | 'USER'
}

export default function UsersPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [newUser, setNewUser] = useState<NewUserForm>({
    email: '',
    name: '',
    password: '',
    role: 'USER'
  })
  
  // Edit state
  const [editingUser, setEditingUser] = useState<EditUserForm | null>(null)
  
  // Status message
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'none'
    message: string
  }>({
    type: 'none',
    message: ''
  })

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    user?: User
    isLoading: boolean
  }>({ open: false, isLoading: false })

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        
        if (response.ok) {
          const data = await response.json()
          setIsAuthenticated(data.authenticated)
          setIsAdmin(data.user?.role === 'ADMIN')
        } else {
          setIsAuthenticated(false)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        setIsAdmin(false)
      } finally {
        setAuthChecking(false)
      }
    }
    
    checkAuth()
  }, [])
  
  // Fetch users if authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, isAdmin])
  
  // Fetch users list
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        setStatus({
          type: 'error',
          message: 'Failed to load users'
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setStatus({
        type: 'error',
        message: 'Failed to load users'
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setStatus({ type: 'none', message: '' })
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })
      
      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'User created successfully'
        })
        
        // Reset form and refresh users list
        setNewUser({
          email: '',
          name: '',
          password: '',
          role: 'USER'
        })
        setShowNewUserForm(false)
        fetchUsers()
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatus({ type: 'none', message: '' })
        }, 3000)
      } else {
        const errorData = await response.json()
        setStatus({
          type: 'error',
          message: errorData.error || 'Failed to create user'
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setStatus({
        type: 'error',
        message: 'Failed to create user'
      })
    }
  }
  
  // Update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) return
    
    try {
      setStatus({ type: 'none', message: '' })
      
      // Prepare data - only include password if provided
      const updateData = { ...editingUser }
      if (!updateData.password) {
        delete updateData.password
      }
      
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'User updated successfully'
        })
        
        // Reset edit mode and refresh users list
        setEditingUser(null)
        fetchUsers()
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatus({ type: 'none', message: '' })
        }, 3000)
      } else {
        const errorData = await response.json()
        setStatus({
          type: 'error',
          message: errorData.error || 'Failed to update user'
        })
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setStatus({
        type: 'error',
        message: 'Failed to update user'
      })
    }
  }
  
  // Delete user functions
  const openDeleteDialog = (user: User) => {
    setDeleteDialog({
      open: true,
      user,
      isLoading: false
    })
  }

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }))
    
    try {
      setStatus({ type: 'none', message: '' })
      
      const response = await fetch(`/api/users/${deleteDialog.user.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'User deleted successfully'
        })
        
        // Refresh users list
        fetchUsers()
        setDeleteDialog({ open: false, isLoading: false })
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatus({ type: 'none', message: '' })
        }, 3000)
      } else {
        const errorData = await response.json()
        setStatus({
          type: 'error',
          message: errorData.error || 'Failed to delete user'
        })
        setDeleteDialog(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setStatus({
        type: 'error',
        message: 'Failed to delete user'
      })
      setDeleteDialog(prev => ({ ...prev, isLoading: false }))
    }
  }
  
  // Start editing user
  const startEditUser = (user: User) => {
    setEditingUser({
      id: user.id,
      email: user.email,
      name: user.name || '',
      password: '',
      role: user.role
    })
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // Render loading state
  if (authChecking) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-slate-600">Authentifizierung wird überprüft...</p>
          </div>
        </div>
      </Layout>
    )
  }
  
  // Render unauthorized state
  if (!isAuthenticated || !isAdmin) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md bg-white/60 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Zugriff verweigert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">
                Sie haben keine Berechtigung, auf diese Seite zuzugreifen. Diese Seite ist nur für Administratoren verfügbar.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  Benutzerverwaltung
                </h1>
                <p className="text-slate-600">
                  Verwalten Sie Benutzerkonten und Zugriffsrechte
                </p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowNewUserForm(!showNewUserForm)}
              >
                {showNewUserForm ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Abbrechen
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Neuer Benutzer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Status Message */}
          {status.type !== 'none' && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {status.type === 'success' ? 
                <CheckCircle2 className="w-5 h-5 text-green-600" /> : 
                <AlertCircle className="w-5 h-5 text-red-600" />
              }
              <p>{status.message}</p>
            </div>
          )}

          {/* New User Form */}
          {showNewUserForm && (
            <Card className="mb-8 bg-white/60 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Neuen Benutzer erstellen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-email">E-Mail</Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-name">Name</Label>
                      <Input
                        id="new-name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Passwort</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-role">Rolle</Label>
                      <select
                        id="new-role"
                        className="w-full p-2 border border-slate-300 rounded-md"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'ADMIN' | 'USER' })}
                      >
                        <option value="USER">Benutzer</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowNewUserForm(false)}
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Benutzer erstellen
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Users Table */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Benutzer ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                  <p className="mt-2 text-slate-600">Benutzer werden geladen...</p>
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">E-Mail</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Rolle</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Erstellt am</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-600">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        editingUser && editingUser.id === user.id ? (
                          // Edit form row
                          <tr key={user.id} className="border-b border-slate-200 bg-blue-50">
                            <td colSpan={5} className="py-3 px-4">
                              <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`edit-email-${user.id}`}>E-Mail</Label>
                                    <Input
                                      id={`edit-email-${user.id}`}
                                      type="email"
                                      value={editingUser.email}
                                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`edit-name-${user.id}`}>Name</Label>
                                    <Input
                                      id={`edit-name-${user.id}`}
                                      value={editingUser.name || ''}
                                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`edit-password-${user.id}`}>Neues Passwort (leer lassen für keine Änderung)</Label>
                                    <Input
                                      id={`edit-password-${user.id}`}
                                      type="password"
                                      value={editingUser.password || ''}
                                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`edit-role-${user.id}`}>Rolle</Label>
                                    <select
                                      id={`edit-role-${user.id}`}
                                      className="w-full p-2 border border-slate-300 rounded-md"
                                      value={editingUser.role}
                                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'ADMIN' | 'USER' })}
                                    >
                                      <option value="USER">Benutzer</option>
                                      <option value="ADMIN">Administrator</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setEditingUser(null)}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Abbrechen
                                  </Button>
                                  <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    Speichern
                                  </Button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        ) : (
                          // Normal row
                          <tr key={user.id} className="border-b border-slate-200">
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.name || '-'}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role === 'ADMIN' ? (
                                  <>
                                    <Shield className="w-3 h-3" />
                                    Administrator
                                  </>
                                ) : (
                                  <>
                                    <User className="w-3 h-3" />
                                    Benutzer
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-4">{formatDate(user.createdAt)}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => startEditUser(user)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => openDeleteDialog(user)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600">Keine Benutzer gefunden.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
            onConfirm={handleDeleteUser}
            isLoading={deleteDialog.isLoading}
            title="Benutzer löschen"
            description="Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Der Benutzer verliert sofort den Zugang zum System und alle zugehörigen Daten werden entfernt."
            itemName={deleteDialog.user ? `${deleteDialog.user.email}${deleteDialog.user.name ? ` (${deleteDialog.user.name})` : ''}` : undefined}
          />
        </div>
      </div>
    </Layout>
  )
}
