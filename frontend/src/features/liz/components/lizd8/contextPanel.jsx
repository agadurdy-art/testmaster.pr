// Right-hand context panel for the Liz D8 tutor UI (plan summary, memory,
// quick actions, homework cards + modal).
// Extracted verbatim from LizD8.jsx (lines 554-1017) during the monolith split.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarkdownBlock } from './markdown';

/* ---------- RIGHT PANEL ---------- */

function PlanSummaryCard({ lizStatus, voiceQuota }) {
  const planLabel = lizStatus?.plan_label || lizStatus?.plan || 'Free';
  const targetBand = lizStatus?.target_band;
  const baseBand = lizStatus?.current_band || lizStatus?.starting_band;
  const planDays = lizStatus?.plan_days;
  const messagesUsed = lizStatus?.messages_used;
  const messagesQuota = lizStatus?.messages_quota;
  const minutesLeft = voiceQuota?.seconds_remaining != null
    ? Math.max(0, Math.floor(voiceQuota.seconds_remaining / 60))
    : null;

  const headline = (baseBand && targetBand)
    ? `From Band ${baseBand} → ${targetBand}`
    : targetBand
      ? `Target Band ${targetBand}`
      : `Your ${planLabel} plan`;

  const summaryBits = [];
  if (messagesUsed != null && messagesQuota != null) {
    summaryBits.push(`${messagesUsed}/${messagesQuota} msgs`);
  }
  if (minutesLeft != null) summaryBits.push(`${minutesLeft} min Live`);
  if (planDays) summaryBits.push(`${planDays}-day plan`);
  const summary = summaryBits.join(' · ') || 'Stay consistent — Liz tracks your wins as you go.';

  return (
    <div className="plan-summary">
      <div className="ps-kicker">{planDays ? `Your ${planDays}-day plan` : `Your ${planLabel} plan`}</div>
      <h4>{headline}</h4>
      <p>{summary}</p>
    </div>
  );
}

function MemoryIcon({ type }) {
  const glyph = type === 'gap' ? '!' : type === 'habit' ? '◷' : '✓';
  return <span className="memo-icon" data-type={type || 'win'}>{glyph}</span>;
}

function deriveMemos(lizStatus, user, homework, currentMode, messagesCount) {
  const raw = Array.isArray(lizStatus?.memory_notes) ? lizStatus.memory_notes : [];
  const memos = raw.map((note) => {
    if (typeof note === 'string') {
      return { type: 'win', body: note, since: null };
    }
    return {
      type: note.type || note.kind || 'win',
      title: note.title || note.headline || null,
      body: note.body || note.text || note.note || '',
      since: note.since || note.timeframe || null,
    };
  });

  // Always include core facts so the panel never feels empty.
  const targetBand = user?.target_band || lizStatus?.target_band;
  if (targetBand && !memos.some((m) => /target/i.test(m.body || m.title || ''))) {
    memos.push({
      type: 'habit',
      title: 'Target band',
      body: `Aiming for ${targetBand}.`,
      since: null,
    });
  }
  const pending = (homework || []).filter((h) => h.status === 'pending').length;
  if (pending > 0) {
    memos.push({
      type: 'gap',
      title: 'Homework waiting',
      body: `${pending} task${pending === 1 ? '' : 's'} to submit.`,
      since: null,
    });
  }
  if (currentMode && currentMode !== 'default') {
    memos.push({
      type: 'habit',
      title: `${currentMode[0].toUpperCase()}${currentMode.slice(1)} mode`,
      body: `Liz is in ${currentMode} mode.`,
      since: null,
    });
  }
  if (messagesCount > 0 && !memos.some((m) => /messages/i.test(m.body || m.title || ''))) {
    memos.push({
      type: 'win',
      title: 'Today\'s session',
      body: `${messagesCount} message${messagesCount === 1 ? '' : 's'} so far.`,
      since: null,
    });
  }
  return memos.slice(0, 6);
}

function MemoryCard({ lizStatus, user, homework, currentMode, messagesCount }) {
  const memos = deriveMemos(lizStatus, user, homework, currentMode, messagesCount);
  return (
    <div className="liz-card">
      <h4>Liz remembers</h4>
      {memos.length ? (
        <ul className="memory-list">
          {memos.map((m, i) => (
            <li key={i}>
              <MemoryIcon type={m.type} />
              <div className="memo-body">
                {m.title ? <><b>{m.title}</b> — {m.body}</> : m.body}
                {m.since ? <div className="since">{m.since}</div> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="memory-empty">Liz will start jotting notes as you work together.</div>
      )}
    </div>
  );
}

function QuickActionsCard({
  onPick,
  onChatPrompt,
  onOpenStudyPlan,
  recommendedCourse,
  lessonModes,
}) {
  const navigate = useNavigate();
  const go = (target) => {
    if (typeof onPick === 'function' && onPick(target) === true) return;
    navigate(target);
  };
  // Resolve grammar/vocab prompts from LESSON_MODES (LizTeacher) so Liz starts
  // a structured lesson when the tile is tapped — same prompt the old
  // welcome chips used.
  const grammarPrompt = lessonModes?.find((m) => m.testId === 'lesson-grammar')?.prompt;
  const vocabPrompt   = lessonModes?.find((m) => m.testId === 'lesson-vocab')?.prompt;
  const courseHref    = recommendedCourse?.href || '/courses';
  const courseLabel   = recommendedCourse?.short_label || recommendedCourse?.level
    ? `${(recommendedCourse?.short_label || recommendedCourse?.level || '').toString().replace(/^./, (c) => c.toUpperCase())}`
    : 'Courses';
  const courseSub = recommendedCourse?.sub
    || (recommendedCourse?.level ? `Liz · ${recommendedCourse.level}` : 'All courses');
  const courseInitial = (recommendedCourse?.level || 'C').charAt(0).toUpperCase();
  return (
    <div className="liz-card">
      <h4>Quick actions</h4>
      <div className="quick-section-head">Practice</div>
      <div className="quick-grid">
        <button
          type="button"
          className="quick-tile"
          onClick={() => go('/question-bank?writing=1')}
          data-testid="quick-writing-drill"
        >
          <span className="qt-icon">W</span>
          <span className="qt-title">Writing</span>
          <span className="qt-sub">Task 1 & 2 prompts</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => go('/question-bank?reading=1')}
          data-testid="quick-reading-drill"
        >
          <span className="qt-icon">R</span>
          <span className="qt-title">Reading</span>
          <span className="qt-sub">Passages & questions</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => go('/question-bank?speaking=1')}
          data-testid="quick-speaking-drill"
        >
          <span className="qt-icon">S</span>
          <span className="qt-title">Speaking</span>
          <span className="qt-sub">Part 1 · 2 · 3</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => go('/question-bank?listening=1')}
          data-testid="quick-listening-drill"
        >
          <span className="qt-icon">L</span>
          <span className="qt-title">Listening</span>
          <span className="qt-sub">Sections 1–4</span>
        </button>
      </div>
      <div className="quick-section-head">Learn</div>
      <div className="quick-grid">
        <button
          type="button"
          className="quick-tile"
          onClick={() => grammarPrompt && onChatPrompt?.(grammarPrompt)}
          disabled={!grammarPrompt}
          data-testid="quick-grammar"
        >
          <span className="qt-icon">G</span>
          <span className="qt-title">Grammar</span>
          <span className="qt-sub">Liz-led lesson</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => vocabPrompt && onChatPrompt?.(vocabPrompt)}
          disabled={!vocabPrompt}
          data-testid="quick-vocabulary"
        >
          <span className="qt-icon">V</span>
          <span className="qt-title">Vocabulary</span>
          <span className="qt-sub">IELTS word lists</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => onOpenStudyPlan?.()}
          data-testid="quick-study-plan"
        >
          <span className="qt-icon">P</span>
          <span className="qt-title">Study plan</span>
          <span className="qt-sub">View week →</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => go(courseHref)}
          data-testid="quick-course"
        >
          <span className="qt-icon">{courseInitial}</span>
          <span className="qt-title">Course</span>
          <span className="qt-sub">{courseSub}</span>
        </button>
      </div>
    </div>
  );
}

function HomeworkCard({ hw, hwIcons, onOpen, onDelete }) {
  const Icon = hwIcons?.[hw.type] || hwIcons?.default;
  const isPending = hw.status === 'pending';
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(hw.homework_id);
  };
  return (
    <button
      type="button"
      className="quick-card hw-card"
      data-state={hw.status || 'pending'}
      data-testid={`hw-card-${hw.homework_id}`}
      onClick={() => onOpen?.(hw)}
    >
      <div className="hw-card-head">
        {Icon ? <Icon className="hw-icon" /> : null}
        <div className="hw-card-text">
          <div className="qc-title">{hw.title}</div>
          <div className="qc-meta">
            {isPending
              ? `${hw.type} · due ${hw.due_date ? new Date(hw.due_date).toLocaleDateString() : 'soon'}`
              : `Reviewed · band ${hw.score ?? '—'}/10`}
          </div>
        </div>
        {isPending && onDelete ? (
          <span
            role="button"
            tabIndex={0}
            className="hw-delete"
            onClick={handleDelete}
            onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(e); }}
            aria-label="Delete homework"
            data-testid={`hw-delete-${hw.homework_id}`}
          >×</span>
        ) : null}
      </div>
    </button>
  );
}

function HomeworkModal({ hw, hwIcons, onClose, onSubmit, submitting }) {
  const [answer, setAnswer] = useState('');
  useEffect(() => {
    setAnswer('');
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hw?.homework_id, onClose]);
  if (!hw) return null;
  const Icon = hwIcons?.[hw.type] || hwIcons?.default;
  const isPending = hw.status === 'pending';
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    await onSubmit?.(hw.homework_id, answer);
    onClose?.();
  };
  return (
    <div className="hw-modal-backdrop" onClick={onClose} data-testid="hw-modal">
      <div className="hw-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="hw-modal-title">
        <header className="hw-modal-head">
          <div className="hw-modal-icon">{Icon ? <Icon /> : null}</div>
          <div className="hw-modal-title-wrap">
            <h2 id="hw-modal-title" className="hw-modal-title">{hw.title}</h2>
            <div className="hw-modal-meta">
              <span className="hw-modal-type">{hw.type}</span>
              {hw.due_date ? <span>· due {new Date(hw.due_date).toLocaleDateString()}</span> : null}
              {!isPending ? <span>· band {hw.score ?? '—'}/10</span> : null}
            </div>
          </div>
          <button
            type="button"
            className="hw-modal-close"
            onClick={onClose}
            aria-label="Close"
            data-testid="hw-modal-close"
          >×</button>
        </header>

        <section className="hw-modal-body">
          <div className="hw-modal-section-head">Task</div>
          <MarkdownBlock text={hw.task || hw.prompt || hw.description || 'No task instructions provided.'} />
          {!isPending && hw.feedback ? (
            <>
              <div className="hw-modal-section-head">Liz's feedback</div>
              <MarkdownBlock text={hw.feedback} />
            </>
          ) : null}
          {!isPending && hw.student_answer ? (
            <>
              <div className="hw-modal-section-head">Your answer</div>
              <div className="hw-modal-answer-readonly">{hw.student_answer}</div>
            </>
          ) : null}
        </section>

        {isPending ? (
          <footer className="hw-modal-foot">
            <textarea
              className="hw-modal-answer"
              placeholder="Type your answer here…"
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              data-testid="hw-modal-answer"
            />
            <div className="hw-modal-actions">
              <button type="button" className="liz-btn liz-btn-ghost" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="liz-btn liz-btn-primary"
                onClick={handleSubmit}
                disabled={submitting || !answer.trim()}
                data-testid="hw-modal-submit"
              >
                {submitting ? 'Submitting…' : 'Submit for review'}
              </button>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function HomeworkCardWrap({
  homework, hwIcons, onAssignHomework, onSubmitHomework, onDeleteHomework,
  submittingHw, messagesCount,
}) {
  const pending = (homework || []).filter((h) => h.status === 'pending');
  const reviewed = (homework || []).filter((h) => h.status === 'reviewed').slice(0, 3);
  const pendingCount = pending.length;
  const canRequestHomework = (messagesCount || 0) > 2;
  const [openHwId, setOpenHwId] = useState(null);
  const openHw = (homework || []).find((h) => h.homework_id === openHwId) || null;

  return (
    <div className="liz-card">
      <div className="panel-section-head" style={{ marginBottom: 10 }}>
        <h4 style={{ margin: 0 }}>
          Homework
          {pendingCount > 0 ? (
            <span className="homework-badge" data-testid="homework-badge">{pendingCount}</span>
          ) : null}
        </h4>
        {canRequestHomework ? (
          <button
            type="button"
            className="liz-btn-link"
            onClick={onAssignHomework}
            data-testid="request-homework-btn"
          >Ask for one</button>
        ) : (
          <span className="liz-btn-link liz-btn-link-muted" title="Chat a bit first so Liz knows what to assign">
            Chat first
          </span>
        )}
      </div>
      <div className="quick-grid">
        {pending.slice(0, 3).map((hw) => (
          <HomeworkCard
            key={hw.homework_id}
            hw={hw}
            hwIcons={hwIcons}
            onOpen={() => setOpenHwId(hw.homework_id)}
            onDelete={onDeleteHomework}
          />
        ))}
        {reviewed.map((hw) => (
          <HomeworkCard
            key={hw.homework_id}
            hw={hw}
            hwIcons={hwIcons}
            onOpen={() => setOpenHwId(hw.homework_id)}
            onDelete={onDeleteHomework}
          />
        ))}
        {!pending.length && !reviewed.length ? (
          <div className="quick-empty">No homework yet — ask Liz for a focused drill.</div>
        ) : null}
      </div>

      {openHw ? (
        <HomeworkModal
          hw={openHw}
          hwIcons={hwIcons}
          onClose={() => setOpenHwId(null)}
          onSubmit={onSubmitHomework}
          submitting={submittingHw === openHw.homework_id}
        />
      ) : null}
    </div>
  );
}

function ContextPanel({
  user, lizStatus, homework, onAssignHomework, onSubmitHomework, onDeleteHomework,
  submittingHw, hwIcons, voiceQuota, currentMode, messagesCount,
  onChatPrompt, onOpenStudyPlan, recommendedCourse, lessonModes,
}) {
  return (
    <aside className="panel panel-right" aria-label="Context" data-testid="homework-panel">
      <PlanSummaryCard lizStatus={lizStatus} voiceQuota={voiceQuota} />
      <MemoryCard
        lizStatus={lizStatus}
        user={user}
        homework={homework}
        currentMode={currentMode}
        messagesCount={messagesCount}
      />
      <QuickActionsCard
        onChatPrompt={onChatPrompt}
        onOpenStudyPlan={onOpenStudyPlan}
        recommendedCourse={recommendedCourse}
        lessonModes={lessonModes}
      />
      <HomeworkCardWrap
        homework={homework}
        hwIcons={hwIcons}
        onAssignHomework={onAssignHomework}
        onSubmitHomework={onSubmitHomework}
        onDeleteHomework={onDeleteHomework}
        submittingHw={submittingHw}
        messagesCount={messagesCount}
      />
    </aside>
  );
}

export {
  PlanSummaryCard, MemoryIcon, deriveMemos, MemoryCard, QuickActionsCard,
  HomeworkCard, HomeworkModal, HomeworkCardWrap, ContextPanel,
};
