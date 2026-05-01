import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, BookOpen, Headphones, PenTool, Mic, ArrowLeft } from 'lucide-react';
import { getTips } from '../lib/api';
import { toast } from 'sonner';

export default function TipsPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadTips();
  }, []);

  const loadTips = async () => {
    try {
      const data = await getTips();
      // Backend route is GET /api/tips reading db.tips — collection is often
      // unseeded in local/preview environments. We don't toast.error in that
      // case; the empty state below handles it gracefully.
      setTips(Array.isArray(data) ? data : []);
    } catch (error) {
      // TODO(backend): seed db.tips with reading/listening/writing/speaking
      // entries so this page is useful. Until then we soft-fail to the
      // "coming soon" empty state instead of erroring out the whole page.
      console.warn('TipsPage: getTips() failed, showing empty state', error);
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Tips', icon: BookOpen },
    { id: 'reading', name: 'Reading', icon: BookOpen },
    { id: 'listening', name: 'Listening', icon: Headphones },
    { id: 'writing', name: 'Writing', icon: PenTool },
    { id: 'speaking', name: 'Speaking', icon: Mic }
  ];

  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">IELTS Ace</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Tips & Strategies</h2>
          <p className="text-xl text-gray-600">
            Expert advice to improve your IELTS performance
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tips...</p>
          </div>
        ) : filteredTips.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredTips.map((tip, idx) => (
              <Card key={tip.id} className="p-6 hover-lift">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    {tip.category === 'reading' && <BookOpen className="w-6 h-6 text-white" />}
                    {tip.category === 'listening' && <Headphones className="w-6 h-6 text-white" />}
                    {tip.category === 'writing' && <PenTool className="w-6 h-6 text-white" />}
                    {tip.category === 'speaking' && <Mic className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{tip.title}</h3>
                    <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: tip.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-7 h-7 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Tips are coming soon</h3>
              <p className="text-sm text-gray-600">
                Liz is curating per-skill strategies for {selectedCategory === 'all' ? 'every section' : selectedCategory}. Check back shortly — meanwhile her live feedback inside any course already covers the same ground.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
