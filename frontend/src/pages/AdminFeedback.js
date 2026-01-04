import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  MessageSquare, AlertTriangle, Lightbulb, FileText, Palette, 
  ArrowLeft, Search, Filter, Trash2, CheckCircle, Clock, Star,
  User, Mail, Calendar, Globe, ChevronDown, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminFeedback({ user }) {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Check if user is admin
  const isAdmin = user?.email?.includes('admin') || user?.role === 'admin' || user?.email === 'ieltsace@testmaster.pro';

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    loadFeedbacks();
  }, [isAdmin, navigate]);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/feedbacks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load');
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (feedbackId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/feedbacks/${feedbackId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to update');
      toast.success('Marked as resolved');
      loadFeedbacks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/feedbacks/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Feedback deleted');
      loadFeedbacks();
      setSelectedFeedback(null);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getCategoryInfo = (type) => {
    const categories = {
      general: { label: 'General', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
      bug: { label: 'Bug Report', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
      feature: { label: 'Feature Request', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-100' },
      content: { label: 'Content Issue', icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
      ui: { label: 'UI/UX', icon: Palette, color: 'text-purple-600', bg: 'bg-purple-100' },
    };
    return categories[type] || categories.general;
  };

  const filteredFeedbacks = feedbacks
    .filter(f => filter === 'all' || f.type === filter || (filter === 'resolved' && f.resolved) || (filter === 'pending' && !f.resolved))
    .filter(f => 
      searchQuery === '' || 
      f.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => !f.resolved).length,
    bugs: feedbacks.filter(f => f.type === 'bug').length,
    features: feedbacks.filter(f => f.type === 'feature').length,
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Feedback Management</h1>
              <p className="text-sm text-gray-500">Beta feedback and bug reports</p>
            </div>
          </div>
          <Button onClick={loadFeedbacks} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500' },
            { label: 'Pending', value: stats.pending, color: 'bg-amber-500' },
            { label: 'Bug Reports', value: stats.bugs, color: 'bg-red-500' },
            { label: 'Feature Requests', value: stats.features, color: 'bg-green-500' },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 bg-white border-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <span className="text-white font-bold">{stat.value}</span>
                </div>
                <span className="text-gray-600 text-sm">{stat.label}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search feedbacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
          >
            <option value="all">All Types</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="bug">Bug Reports</option>
            <option value="feature">Feature Requests</option>
            <option value="general">General</option>
            <option value="content">Content Issues</option>
            <option value="ui">UI/UX</option>
          </select>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Feedback List */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading feedbacks...</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No feedbacks found</p>
              </Card>
            ) : (
              filteredFeedbacks.map((feedback) => {
                const catInfo = getCategoryInfo(feedback.type);
                const Icon = catInfo.icon;
                return (
                  <Card
                    key={feedback.id}
                    onClick={() => setSelectedFeedback(feedback)}
                    className={`p-4 bg-white cursor-pointer hover:shadow-md transition-shadow ${
                      selectedFeedback?.id === feedback.id ? 'ring-2 ring-violet-500' : ''
                    } ${feedback.resolved ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${catInfo.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${catInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${catInfo.bg} ${catInfo.color}`}>
                            {catInfo.label}
                          </span>
                          {feedback.resolved && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              Resolved
                            </span>
                          )}
                          {feedback.rating && (
                            <span className="flex items-center text-xs text-amber-500">
                              <Star className="w-3 h-3 fill-amber-400" /> {feedback.rating}/5
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 text-sm line-clamp-2 mb-2">{feedback.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {feedback.user_name || 'Anonymous'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(feedback.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedFeedback ? (
              <Card className="p-6 bg-white sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Feedback Details</h3>
                  <div className="flex gap-2">
                    {!selectedFeedback.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsResolved(selectedFeedback.id)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteFeedback(selectedFeedback.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Category</label>
                    <p className="font-medium text-gray-900">{getCategoryInfo(selectedFeedback.type).label}</p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Message</label>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg mt-1">
                      {selectedFeedback.message}
                    </p>
                  </div>

                  {/* Rating */}
                  {selectedFeedback.rating && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Rating</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= selectedFeedback.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">User</label>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {selectedFeedback.user_name || 'Anonymous'}
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {selectedFeedback.user_email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Page URL */}
                  {selectedFeedback.page_url && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Page URL</label>
                      <p className="text-sm text-blue-600 truncate">{selectedFeedback.page_url}</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Submitted</label>
                    <p className="text-sm text-gray-700">
                      {new Date(selectedFeedback.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                    <p className={`text-sm font-medium ${selectedFeedback.resolved ? 'text-green-600' : 'text-amber-600'}`}>
                      {selectedFeedback.resolved ? '✅ Resolved' : '⏳ Pending'}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-white text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Select a feedback to view details</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
