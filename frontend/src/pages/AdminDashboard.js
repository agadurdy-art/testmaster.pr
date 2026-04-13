import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Shield, Users, MessageSquare, CreditCard, BookOpen, Image,
  Paintbrush, ArrowLeft, ChevronRight, BarChart3, Brain, GraduationCap, Map
} from 'lucide-react';

const ADMIN_MODULES = [
  {
    id: 'users',
    title: 'User Management',
    description: 'View, edit, delete users. Manage plans and credits.',
    icon: Users,
    path: '/admin/users',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50'
  },
  {
    id: 'vocab-images',
    title: 'Vocabulary Images',
    description: 'Review and fix word images by lesson. Upload correct photos.',
    icon: Image,
    path: '/admin/vocabulary-images',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50'
  },
  {
    id: 'feedback',
    title: 'User Feedback',
    description: 'View and manage user feedback and reports.',
    icon: MessageSquare,
    path: '/admin/feedback',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50'
  },
  {
    id: 'credits',
    title: 'Credits Management',
    description: 'Manage exam credits and billing.',
    icon: CreditCard,
    path: '/admin/credits',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50'
  },
  {
    id: 'content',
    title: 'Content Admin',
    description: 'Manage lessons, units, and learning content.',
    icon: BookOpen,
    path: '/admin/content',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50'
  },
  {
    id: 'visual-gen',
    title: 'Visual Generator',
    description: 'AI-powered image generation for lessons.',
    icon: Paintbrush,
    path: '/admin/visual-generator',
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50'
  },
  {
    id: 'liz-analytics',
    title: 'Liz Analytics',
    description: 'Message usage, navigation clicks, evaluation chat stats by plan.',
    icon: Brain,
    path: '/admin/liz-analytics',
    color: 'from-violet-600 to-purple-700',
    bg: 'bg-violet-50'
  },
  {
    id: 'onboarding-analytics',
    title: 'Onboarding Analytics',
    description: 'Quiz completion rates, drop-off points, plan recommendation vs purchase.',
    icon: BarChart3,
    path: '/admin/onboarding-analytics',
    color: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50'
  },
  {
    id: 'learning-mode',
    title: 'Learning Mode Stats',
    description: 'IELTS vs General English users, Unified Course stage progress.',
    icon: Map,
    path: '/admin/learning-mode',
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50'
  }
];

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();

  const isAdmin = user?.email && (
    user.email.includes('aga.durdy') ||
    user.email === 'admin@ieltsace.com' ||
    user.email === 'stemhousebenluc@gmail.com'
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md bg-gray-900 border-gray-800">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You don't have permission to access the admin panel.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="border-gray-700 text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20" data-testid="admin-dashboard">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-800" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Management Tools</h2>
          <p className="text-gray-500">Select a module to manage your platform.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADMIN_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card
                key={mod.id}
                data-testid={`admin-module-${mod.id}`}
                onClick={() => navigate(mod.path)}
                className="bg-gray-900 border-gray-800 hover:border-gray-600 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 group"
              >
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1 flex items-center justify-between">
                    {mod.title}
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{mod.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
