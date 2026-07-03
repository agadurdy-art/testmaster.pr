// StudyProfileCard — verbatim from pages/Profile.js lines 677-796 (Faz1 wave 10).
// Closed-over values arrive as same-named props.
import React from 'react';
import { Calendar, Award, Target, Save, Pencil, Sparkles } from 'lucide-react';
import { SKILL_TONE, formatDate, formatISODate } from '../lib';
import { Card, Field, ReadTile } from './primitives';

// ─── Study profile (editable) ──────────────────────────────────────────────

export default function StudyProfileCard({
  fullUser,
  editing,
  draft,
  setDraft,
  onEdit,
  onCancel,
  onSave,
  saving,
  weakest,
}) {
  const examDateValue = formatISODate(fullUser?.exam_date);
  return (
    <Card
      title="Study profile"
      subtitle="Where you are, where you're going."
      action={
        !editing && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full hairline border"
            style={{ borderColor: 'hsl(var(--rule))' }}
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        )
      }
    >
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Target band">
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={draft.targetBand}
                onChange={(e) => setDraft((d) => ({ ...d, targetBand: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border hairline text-sm"
                style={{ borderColor: 'hsl(var(--rule))', background: 'hsl(var(--bg))' }}
                placeholder="e.g. 7.5"
              />
            </Field>
            <Field label="Current band">
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={draft.currentBand}
                onChange={(e) => setDraft((d) => ({ ...d, currentBand: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border hairline text-sm"
                style={{ borderColor: 'hsl(var(--rule))', background: 'hsl(var(--bg))' }}
                placeholder="e.g. 6.5"
              />
            </Field>
            <Field label="Exam date">
              <input
                type="date"
                value={draft.examDate}
                onChange={(e) => setDraft((d) => ({ ...d, examDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border hairline text-sm"
                style={{ borderColor: 'hsl(var(--rule))', background: 'hsl(var(--bg))' }}
              />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white disabled:opacity-50"
              style={{ background: 'hsl(var(--fg))' }}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="text-xs font-semibold px-4 py-2 rounded-full hairline border"
              style={{ borderColor: 'hsl(var(--rule))' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ReadTile
            label="Target band"
            value={fullUser?.target_band ?? '—'}
            icon={<Target className="w-3.5 h-3.5" />}
          />
          <ReadTile
            label="Current band"
            value={fullUser?.current_band ?? '—'}
            icon={<Award className="w-3.5 h-3.5" />}
          />
          <ReadTile
            label="Exam date"
            value={examDateValue ? formatDate(fullUser.exam_date) : '—'}
            icon={<Calendar className="w-3.5 h-3.5" />}
          />
          <ReadTile
            label="Weakest skill"
            value={weakest ? `${weakest.name} (${weakest.band.toFixed(1)})` : '—'}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            tone={weakest ? SKILL_TONE[weakest.name] : null}
          />
        </div>
      )}
    </Card>
  );
}
