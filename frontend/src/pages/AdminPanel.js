import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Users, Search, ArrowLeft, Crown, CreditCard, TrendingUp, 
  Mail, Calendar, Award, Trash2, Edit, Eye, X, Plus, Minus,
  BookOpen, Headphones, Mic, PenTool, ChevronRight, Shield
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const PLAN_STYLES = {
  // IELTS-Ace (current) tiers
  monthly: 'bg-purple-100 text-purple-700',
  exam: 'bg-rose-100 text-rose-700',
  weekly: 'bg-blue-100 text-blue-700',
  // Legacy General English tiers — still present in DB for existing users
  master: 'bg-purple-100 text-purple-700',
  achiever: 'bg-amber-100 text-amber-700',
  learner: 'bg-blue-100 text-blue-700',
  explorer: 'bg-green-100 text-green-700',
  free: 'bg-gray-100 text-gray-600',
};

const getPlanBadgeClass = (plan) => PLAN_STYLES[plan] || PLAN_STYLES.free;
const getPlanLabel = (userLike) => userLike?.plan_label || userLike?.plan || 'free';
const formatAdminDate = (value) => (value ? new Date(value).toLocaleString() : 'Unknown');

export default function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ plan: '', credits: 0, addCredits: 0 });

  // Admin check - only allow specific emails
  const isAdmin = user?.email && (
    user.email.includes('aga.durdy') || 
    user.email === 'admin@ieltsace.com'
  );

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users?admin_email=${encodeURIComponent(user.email)}`);
      setUsers(response.data || response);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetail = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}?admin_email=${encodeURIComponent(user.email)}`);
      setUserDetail(response.data || response);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Failed to load user detail:', error);
      toast.error('Failed to load user details');
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;
    try {
      const params = new URLSearchParams();
      params.append('admin_email', user.email);
      if (editForm.plan) params.append('plan', editForm.plan);
      if (editForm.credits > 0) params.append('exam_credits', editForm.credits);
      if (editForm.addCredits !== 0) params.append('add_credits', editForm.addCredits);

      await api.put(`/admin/users/${selectedUser}?${params.toString()}`);
      toast.success('User updated successfully');
      setShowEditModal(false);
      loadUsers();
      loadUserDetail(selectedUser);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}?admin_email=${encodeURIComponent(user.email)}`);
      toast.success('User deleted');
      setSelectedUser(null);
      setUserDetail(null);
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTestIcon = (type) => {
    switch(type) {
      case 'reading': return BookOpen;
      case 'listening': return Headphones;
      case 'speaking': return Mic;
      case 'writing': return PenTool;
      default: return BookOpen;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-4">You don't have permission to access the admin panel.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Admin
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-violet-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{users.length} users</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
                <h2 className="font-semibold text-gray-900 mb-3">All Users</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <div 
                      key={u.id}
                      onClick={() => loadUserDetail(u.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser === u.id ? 'bg-violet-50 border-l-4 border-violet-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{u.name || 'No name'}</p>
                          <p className="text-sm text-gray-500 truncate">{u.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              getPlanBadgeClass(u.plan)
                            }`}>
                              {getPlanLabel(u)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {u.examCredits || 0} credits
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-sm font-bold ${
                            u.avg_band >= 7 ? 'text-green-600' :
                            u.avg_band >= 6 ? 'text-blue-600' :
                            u.avg_band >= 5 ? 'text-yellow-600' : 'text-gray-400'
                          }`}>
                            {u.avg_band > 0 ? `Band ${u.avg_band}` : '-'}
                          </span>
                          <span className="text-xs text-gray-400">{u.total_tests} tests</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* User Detail */}
          <div className="lg:col-span-2">
            {selectedUser && userDetail ? (
              <div className="space-y-6">
                {/* User Info Card */}
                <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {userDetail.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{userDetail.user?.name || 'No name'}</h2>
                        <p className="text-gray-500 flex items-center gap-1">
                          <Mail className="w-4 h-4" /> {userDetail.user?.email}
                        </p>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Joined {userDetail.user?.created_at ? new Date(userDetail.user.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                        {userDetail.user?.legacy_plan && (
                          <p className="text-xs text-amber-600 mt-1">
                            Legacy plan migrated from <span className="font-medium">{userDetail.user.legacy_plan}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditForm({
                            plan: userDetail.user?.plan || 'free',
                            credits: userDetail.user?.examCredits || 0,
                            addCredits: 0
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteUser(selectedUser)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Subscription & Credits */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Plan</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-900 capitalize">{getPlanLabel(userDetail.user)}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-violet-600" />
                        <span className="text-sm font-medium text-violet-800">Credits</span>
                      </div>
                      <p className="text-2xl font-bold text-violet-900">{userDetail.user?.examCredits || 0}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-cyan-600" />
                        <span className="text-sm font-medium text-cyan-800">Tests</span>
                      </div>
                      <p className="text-2xl font-bold text-cyan-900">{userDetail.total_tests || 0}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-violet-600" /> Activity Overview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-violet-50 rounded-xl">
                      <p className="text-xs uppercase tracking-wide text-violet-700">Learning Lessons</p>
                      <p className="text-2xl font-bold text-violet-900">{userDetail.activity_summary?.learning_lessons_completed || 0}</p>
                    </div>
                    <div className="p-4 bg-cyan-50 rounded-xl">
                      <p className="text-xs uppercase tracking-wide text-cyan-700">Full Tests</p>
                      <p className="text-2xl font-bold text-cyan-900">{userDetail.activity_summary?.full_tests_completed || 0}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-xs uppercase tracking-wide text-emerald-700">Liz Sessions</p>
                      <p className="text-2xl font-bold text-emerald-900">{userDetail.activity_summary?.liz_sessions || 0}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <p className="text-xs uppercase tracking-wide text-amber-700">Review Bank</p>
                      <p className="text-2xl font-bold text-amber-900">{userDetail.activity_summary?.review_bank_items || 0}</p>
                    </div>
                  </div>
                </Card>

                {/* Progress by Test Type */}
                <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-violet-600" /> Progress by Module
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['reading', 'listening', 'writing', 'speaking'].map(type => {
                      const progress = userDetail.progress_by_type?.[type];
                      const Icon = getTestIcon(type);
                      return (
                        <div key={type} className="p-4 bg-gray-50 rounded-xl text-center">
                          <Icon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm font-medium text-gray-700 capitalize">{type}</p>
                          {progress ? (
                            <>
                              <p className="text-lg font-bold text-gray-900">Band {progress.avg_band}</p>
                              <p className="text-xs text-gray-500">{progress.count} tests • Best: {progress.best_band}</p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400">No tests</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Recent Tests */}
                <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Test Attempts</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {userDetail.test_attempts?.length > 0 ? (
                      userDetail.test_attempts.slice(0, 10).map((attempt, idx) => {
                        const Icon = getTestIcon(attempt.test_type);
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-900 capitalize">{attempt.test_type} Test</p>
                                <p className="text-xs text-gray-500">
                                  {attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : 'Unknown date'}
                                </p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                              attempt.band_score >= 7 ? 'bg-green-100 text-green-700' :
                              attempt.band_score >= 6 ? 'bg-blue-100 text-blue-700' :
                              attempt.band_score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              Band {attempt.band_score?.toFixed(1) || '-'}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-gray-500 py-4">No test attempts yet</p>
                    )}
                  </div>
                </Card>

                <div className="grid xl:grid-cols-2 gap-6">
                  <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-[360px] overflow-y-auto">
                      {userDetail.recent_activity?.length > 0 ? (
                        userDetail.recent_activity.map((activity, idx) => (
                          <div key={`${activity.type}-${idx}`} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-gray-900">{activity.label}</p>
                                <p className="text-sm text-gray-500">{activity.details}</p>
                              </div>
                              <span className="text-xs text-gray-400 whitespace-nowrap">{formatAdminDate(activity.time)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">No tracked activity yet</p>
                      )}
                    </div>
                  </Card>

                  <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Learning Platform</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">Current lesson</p>
                        <p className="font-semibold text-gray-900">{userDetail.learning_platform?.current_lesson_id || '-'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">Hours studied</p>
                        <p className="font-semibold text-gray-900">{userDetail.learning_platform?.total_hours_studied || 0}</p>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto">
                      {userDetail.learning_platform?.recent_completed_lessons?.length > 0 ? (
                        userDetail.learning_platform.recent_completed_lessons.map((lesson) => (
                          <div key={`${lesson.level_id}-${lesson.lesson_id}`} className="p-3 border rounded-xl">
                            <p className="font-medium text-gray-900">{lesson.lesson_id}</p>
                            <p className="text-xs text-gray-500">{lesson.level_id} / {lesson.unit_id}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatAdminDate(lesson.completed_at)}
                              {lesson.score != null ? ` • score ${lesson.score}` : ''}
                              {lesson.time_spent_minutes ? ` • ${lesson.time_spent_minutes} min` : ''}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">No saved lesson completions</p>
                      )}
                    </div>
                  </Card>
                </div>

                <div className="grid xl:grid-cols-2 gap-6">
                  <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Vocabulary & Grammar Course</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">Lessons started</p>
                        <p className="font-semibold text-gray-900">{userDetail.vocab_grammar?.lessons_started || 0}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500">Quiz accuracy</p>
                        <p className="font-semibold text-gray-900">{userDetail.vocab_grammar?.quiz_progress?.accuracy || 0}%</p>
                      </div>
                    </div>
                    {userDetail.vocab_grammar?.quiz_progress?.weak_units?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Weak units</p>
                        <div className="flex flex-wrap gap-2">
                          {userDetail.vocab_grammar.quiz_progress.weak_units.map((unit) => (
                            <span key={unit} className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">{unit}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-3 max-h-[260px] overflow-y-auto">
                      {userDetail.vocab_grammar?.recent_lessons?.length > 0 ? (
                        userDetail.vocab_grammar.recent_lessons.map((lesson) => (
                          <div key={lesson.lesson_id} className="p-3 border rounded-xl">
                            <p className="font-medium text-gray-900">{lesson.lesson_id}</p>
                            <p className="text-sm text-gray-500">{lesson.completed_items?.length || 0} completed items</p>
                            <p className="text-xs text-gray-400 mt-1">{formatAdminDate(lesson.updated_at)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">No saved vocab/grammar activity</p>
                      )}
                    </div>
                  </Card>

                  <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Vocabulary & Grammar Engines</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Vocabulary engine</p>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                          {userDetail.vocabulary_engine?.recent_modules?.length > 0 ? (
                            userDetail.vocabulary_engine.recent_modules.map((module) => (
                              <div key={module.module_id} className="p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-gray-900">{module.module_id}</p>
                                  <span className="text-xs text-gray-500">{module.progress_percent}%</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{module.sections_completed?.join(', ') || 'No sections complete'}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No vocabulary engine activity</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Grammar engine</p>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                          {userDetail.grammar_engine?.recent_modules?.length > 0 ? (
                            userDetail.grammar_engine.recent_modules.map((module) => (
                              <div key={module.module_id} className="p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-gray-900">{module.module_id}</p>
                                  <span className="text-xs text-gray-500">{module.completed_stage_count} stages</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{formatAdminDate(module.last_activity_at)}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No grammar engine activity</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid xl:grid-cols-2 gap-6">
                  <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Full Test History</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {Object.entries(userDetail.full_test_completions?.by_category || {}).map(([category, stats]) => (
                        <div key={category} className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs uppercase tracking-wide text-gray-500">{category.replace('_', ' ')}</p>
                          <p className="font-semibold text-gray-900">{stats.count} completed</p>
                          <p className="text-xs text-gray-500">Best band {stats.best_band}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto">
                      {userDetail.full_test_completions?.recent?.length > 0 ? (
                        userDetail.full_test_completions.recent.map((item, idx) => (
                          <div key={`${item.test_id}-${idx}`} className="p-3 border rounded-xl">
                            <p className="font-medium text-gray-900">{item.test_id}</p>
                            <p className="text-sm text-gray-500">{item.category}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatAdminDate(item.completed_at)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">No full test completions</p>
                      )}
                    </div>
                  </Card>

                  <Card className="bg-white border-0 shadow-lg rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Liz Teacher Sessions</h3>
                    <div className="space-y-3 max-h-[320px] overflow-y-auto">
                      {userDetail.liz_activity?.recent_sessions?.length > 0 ? (
                        userDetail.liz_activity.recent_sessions.map((session) => (
                          <div key={session.id} className="p-3 border rounded-xl">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-gray-900">{session.title || 'Untitled session'}</p>
                                <p className="text-xs text-gray-500">{session.message_count} messages</p>
                                {session.last_message && (
                                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{session.last_message}</p>
                                )}
                              </div>
                              <span className="text-xs text-gray-400 whitespace-nowrap">{formatAdminDate(session.last_updated)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">No Liz activity</p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="bg-white border-0 shadow-lg rounded-2xl p-8 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a User</h3>
                <p className="text-gray-500">Click on a user from the list to view their detailed learning activity and manage their plan.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <select 
                  value={editForm.plan}
                  onChange={(e) => setEditForm({...editForm, plan: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  data-testid="plan-select"
                >
                  <option value="free">Free</option>
                  <optgroup label="IELTS-Ace (current)">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="exam">Exam Pack</option>
                  </optgroup>
                  <optgroup label="Legacy General English">
                    <option value="explorer">Explorer ($4.99/mo)</option>
                    <option value="learner">Learner ($9/mo)</option>
                    <option value="achiever">Achiever ($19/mo)</option>
                    <option value="master">Master ($29/mo)</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Credits To</label>
                <Input 
                  type="number"
                  min="0"
                  value={editForm.credits}
                  onChange={(e) => setEditForm({...editForm, credits: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or Add/Remove Credits</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditForm({...editForm, addCredits: editForm.addCredits - 1})}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input 
                    type="number"
                    value={editForm.addCredits}
                    onChange={(e) => setEditForm({...editForm, addCredits: parseInt(e.target.value) || 0})}
                    className="text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditForm({...editForm, addCredits: editForm.addCredits + 1})}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: {userDetail?.user?.examCredits || 0} → New: {(userDetail?.user?.examCredits || 0) + editForm.addCredits}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={updateUser}>
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
