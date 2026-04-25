import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  ArrowLeft, Image, Upload, Search, ChevronDown, ChevronRight,
  Check, X, Loader2, Eye, Shield
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function VocabularyImageManager({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();

  const isAdmin = user?.email && (
    user.email.includes('aga.durdy') ||
    user.email === 'admin@ieltsace.com' ||
    user.email === 'stemhousebenluc@gmail.com'
  );

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/vocabulary-groups?admin_email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setGroups(data.groups || []);
      if (data.groups?.length > 0 && !expandedStage) {
        setExpandedStage(data.groups[0].stage_id);
      }
    } catch (err) {
      toast.error('Failed to load vocabulary data');
    } finally {
      setLoading(false);
    }
  }, [user.email, expandedStage]);

  useEffect(() => {
    if (isAdmin) loadGroups();
  }, [isAdmin, loadGroups]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md bg-gray-900 border-gray-800">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You don't have permission to access this admin page.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="border-gray-700 text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const handleFileUpload = async (lessonId, word, file) => {
    const uploadKey = `${lessonId}_${word}`;
    setUploading(uploadKey);
    try {
      const formData = new FormData();
      formData.append('admin_email', user.email);
      formData.append('lesson_id', lessonId);
      formData.append('word', word);
      formData.append('file', file);

      const res = await fetch(`${API_URL}/api/admin/vocabulary/update-image`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Updated image for "${word}"`);
        loadGroups();
      } else {
        toast.error(data.detail || 'Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleUrlUpdate = async (lessonId, word, url) => {
    const uploadKey = `${lessonId}_${word}`;
    setUploading(uploadKey);
    try {
      const formData = new FormData();
      formData.append('admin_email', user.email);
      formData.append('lesson_id', lessonId);
      formData.append('word', word);
      formData.append('image_url', url);

      const res = await fetch(`${API_URL}/api/admin/vocabulary/update-image`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Updated image for "${word}"`);
        loadGroups();
      } else {
        toast.error(data.detail || 'Update failed');
      }
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setUploading(null);
    }
  };

  const filteredGroups = groups.map(stage => ({
    ...stage,
    units: stage.units.map(unit => ({
      ...unit,
      lessons: unit.lessons.map(lesson => ({
        ...lesson,
        words: lesson.words.filter(w =>
          !searchTerm || w.word.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(l => l.words.length > 0)
    })).filter(u => u.lessons.length > 0)
  })).filter(s => s.units.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20" data-testid="vocab-image-manager">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goBack} className="text-gray-400 hover:text-white" data-testid="back-to-admin">
              <ArrowLeft className="w-4 h-4 mr-2" /> Admin
            </Button>
            <div className="h-6 w-px bg-gray-800" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">Vocabulary Images</h1>
            </div>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              data-testid="vocab-search"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {filteredGroups.map(stage => (
          <Card key={stage.stage_id} className="bg-gray-900 border-gray-800 overflow-hidden" data-testid={`stage-${stage.stage_id}`}>
            <button
              onClick={() => setExpandedStage(expandedStage === stage.stage_id ? null : stage.stage_id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-base font-semibold text-white">
                  Stage {stage.number}: {stage.name}
                </span>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                  {stage.cefr_level}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {stage.units.reduce((s, u) => s + u.total_words, 0)} words
                </span>
                {expandedStage === stage.stage_id ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </button>

            {expandedStage === stage.stage_id && (
              <div className="border-t border-gray-800">
                {stage.units.map(unit => (
                  <div key={unit.unit_id} className="border-b border-gray-800/50 last:border-0">
                    <button
                      onClick={() => setExpandedUnit(expandedUnit === unit.unit_id ? null : unit.unit_id)}
                      className="w-full px-8 py-3 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-300">
                        Unit {unit.number}: {unit.title}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {unit.total_images}/{unit.total_words} images
                        </span>
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${unit.total_words ? (unit.total_images / unit.total_words) * 100 : 0}%` }}
                          />
                        </div>
                        {expandedUnit === unit.unit_id ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </button>

                    {expandedUnit === unit.unit_id && (
                      <div className="px-8 pb-3">
                        {unit.lessons.map(lesson => (
                          <div key={lesson.lesson_id} className="mb-3">
                            <button
                              onClick={() => setExpandedLesson(expandedLesson === lesson.lesson_id ? null : lesson.lesson_id)}
                              className="w-full px-4 py-2 flex items-center justify-between bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors"
                            >
                              <span className="text-sm text-gray-400">
                                L{lesson.number}: {lesson.title}
                              </span>
                              <span className="text-xs text-gray-600">
                                {lesson.image_count}/{lesson.word_count}
                              </span>
                            </button>

                            {expandedLesson === lesson.lesson_id && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3 px-2">
                                {lesson.words.map((word, idx) => (
                                  <WordCard
                                    key={`${lesson.lesson_id}_${word.word}_${idx}`}
                                    word={word}
                                    lessonId={lesson.lesson_id}
                                    uploading={uploading === `${lesson.lesson_id}_${word.word}`}
                                    onUpload={(file) => handleFileUpload(lesson.lesson_id, word.word, file)}
                                    onUrlUpdate={(url) => handleUrlUpdate(lesson.lesson_id, word.word, url)}
                                    onPreview={(url) => setPreviewImage(url)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-xl max-h-[80vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage.startsWith('http') ? previewImage : `${API_URL}${previewImage}`}
              alt="Preview"
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function WordCard({ word, lessonId, uploading, onUpload, onUrlUpdate, onPreview }) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const hasImage = !!word.image_url;
  const imgSrc = word.image_url
    ? (word.image_url.startsWith('http') ? word.image_url : `${API_URL}${word.image_url}`)
    : null;

  return (
    <div
      data-testid={`word-card-${word.word}`}
      className={`rounded-xl border p-3 transition-all ${
        hasImage ? 'bg-gray-800/40 border-gray-700' : 'bg-red-950/20 border-red-900/30'
      }`}
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-900 mb-2 relative group">
        {hasImage ? (
          <>
            <img src={imgSrc} alt={word.word} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => onPreview(word.image_url)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                title="Preview"
              >
                <Eye className="w-4 h-4 text-white" />
              </button>
              <label className="p-2 bg-white/20 rounded-lg hover:bg-white/30 cursor-pointer" title="Replace">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
                />
              </label>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
            <span className="text-2xl mb-1">{word.image_emoji || '?'}</span>
            <label className="mt-1 cursor-pointer">
              <span className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
                <Upload className="w-3 h-3" /> Upload
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
              />
            </label>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white truncate">{word.word}</p>
        <p className="text-xs text-gray-500 truncate">{word.definition}</p>
      </div>
      {hasImage ? (
        <div className="mt-1 flex justify-center">
          <Check className="w-3 h-3 text-emerald-500" />
        </div>
      ) : (
        <div className="mt-1">
          {showUrlInput ? (
            <div className="flex gap-1">
              <Input
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="Image URL"
                className="h-6 text-xs bg-gray-900 border-gray-700 text-white"
              />
              <button
                onClick={() => { onUrlUpdate(urlValue); setShowUrlInput(false); }}
                className="text-emerald-500 hover:text-emerald-400"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowUrlInput(true)}
              className="w-full text-xs text-gray-500 hover:text-gray-400 text-center"
            >
              or paste URL
            </button>
          )}
        </div>
      )}
    </div>
  );
}
