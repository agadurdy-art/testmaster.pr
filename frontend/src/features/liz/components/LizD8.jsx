/**
 * LizD8
 * -----
 * D8 design port — rebuilt 2026-04-30 as a near 1:1 React mirror of
 * /Users/aga/Desktop/design-handoffs/D8-liz-tutor.html. Feature handlers
 * and data come in as props from LizTeacher.js and are slotted into the
 * handoff's structure (rather than the prior approach of layering handoff
 * styling on top of the old DOM).
 *
 * Layout (matches handoff verbatim):
 *   LEFT  panel : today-head → focus-card (liz-note) → ol.lesson-steps
 *                 → streak-chip (BOTTOM) → recent sessions
 *   CENTER      : canvas-head (avatar+name+presence+head-actions)
 *                 → listen-cta header
 *                 → .conversation (turns)
 *                 → composer (Attach + hint + Talk + Send)
 *                 → voice-overlay (absolute, when live)
 *                 → welcome-overlay (absolute, when isEmpty)
 *   RIGHT panel : plan-summary (TOP) → "Liz remembers" rich memos
 *                 → "Quick actions" 2x2 → Homework card
 *
 * Features slotted in: mic STT (handleMicClick), auto-voice toggle,
 * stop-speaking pill, voice insight pill, lesson-mode chips inside the
 * welcome overlay, expandable HomeworkCard/HomeworkModal, homework badge
 * + request gating, ElevenLabs Live via useElevenLabsLiz + VoiceOverlay,
 * MarkdownBlock with callouts/blockquote/headings, pronunciation
 * underlines. All data-testids preserved.
 */
// NOTE (monolith split): presentational sub-components were extracted verbatim
// into ./lizd8/* — LizD8Inner (all chat/voice/TTS state and effects) and the
// LizD8 provider wrapper below are unchanged.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import { useNavigate } from 'react-router-dom';
import useElevenLabsLiz from '../hooks/useElevenLabsLiz';
import VoiceOverlay from './VoiceOverlay';
import '../liz.css';
import {
  TodayPanel, ConversationStream, CanvasHead, ListenCta, Composer,
} from './lizd8/panels';
import { ContextPanel } from './lizd8/contextPanel';
import {
  LizSuggestStrip, detectPronGap, TalkPracticeModal, SceneBar,
  pickLatest, formatSpeakingReview, formatWritingReview,
  EMPTY_SPEAKING_REVIEW, EMPTY_WRITING_REVIEW,
  StudyPlanDrawer, deriveRecommendedCourse, StaticVoiceOverlay,
} from './lizd8/overlays';

/* ---------- ROOT ---------- */

function LizD8Inner({
  user,
  messages,
  input,
  setInput,
  onSend,
  onSpeakMessage,
  sending,
  status,
  currentMode,
  sessions,
  lizStatus,
  homework,
  onLoadSession,
  onNewSession,
  onAssignHomework,
  onAppendLizMessage,
  onDeleteHomework,
  onSubmitHomework,
  submittingHw,
  onMicClick,
  autoVoice,
  onToggleAutoVoice,
  onStopSpeaking,
  voiceInsight,
  lessonModes,
  onPickLesson,
  hwIcons,
  recentAttempts,
}) {
  const liz = useElevenLabsLiz({ userId: user?.id });
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [listenBusy, setListenBusy] = useState(false);
  const [previewScene, setPreviewScene] = useState('default');
  const [talkPickerOpen, setTalkPickerOpen] = useState(false);
  const [studyPlanOpen, setStudyPlanOpen] = useState(false);
  // Mobile-only tab state (hidden on >1180px). Default 'chat' so the
  // conversation surface is the primary view on phones; Today / Tools
  // panels are reachable by tapping the segmented control.
  const [mobileTab, setMobileTab] = useState('chat');

  const recommendedCourse = useMemo(
    () => deriveRecommendedCourse(lizStatus, user),
    [lizStatus, user],
  );

  // Scene-driven derived data: pull the user's most recent attempt of the
  // type the scene preview is showing. Falls back to empty-state copy when
  // the user has no attempts yet.
  const latestSpeaking = useMemo(() => pickLatest(recentAttempts, 'speaking'), [recentAttempts]);
  const latestWriting  = useMemo(() => pickLatest(recentAttempts, 'writing'),  [recentAttempts]);

  const canvasEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    canvasEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!liz.isEnded || !liz.transcript) return;
    onAppendLizMessage?.({
      role: 'assistant',
      content: `Live conversation transcript (${Math.round((liz.elapsedSeconds || 0) / 60)} min):\n\n${liz.transcript}`,
      mode: 'reviewing',
      timestamp: new Date().toISOString(),
    });
    liz.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liz.isEnded, liz.transcript]);

  const handleTalk = () => {
    // Open picker first; selection in TalkPracticeModal calls handleTalkStart.
    setTalkPickerOpen(true);
  };

  const handleTalkStart = async (mode) => {
    setTalkPickerOpen(false);
    setVoiceOpen(true);
    const startArgs = { part: mode.part || 'part1' };
    if (mode.mode) startArgs.mode = mode.mode;
    await liz.start(startArgs);
  };

  const handleClose = () => setVoiceOpen(false);

  const smartTalkDefault = useMemo(() => {
    return detectPronGap(lizStatus, user) ? 'drill' : 'convo';
  }, [lizStatus, user]);

  const handleSuggestPick = (s) => {
    if (s.action === 'cue') {
      navigate('/test/speaking?part=2');
    } else if (s.action === 'essay') {
      const ta = document.querySelector('[data-testid="liz-input"]');
      if (ta) {
        ta.focus();
        if (!input) setInput('Here is my essay — please review it for me:\n\n');
      }
    } else if (s.action === 'drill') {
      handleTalkStart({ part: 'part1', mode: 'pronunciation' });
    } else if (s.action === 'homework') {
      onAssignHomework?.();
    } else if (s.url) {
      navigate(s.url);
    }
  };

  const talkLocked = !user?.id || liz.isConnecting || liz.isLive || liz.isFinalizing;
  const talkLockedReason = !user?.id
    ? 'Sign in to talk with Liz'
    : liz.isConnecting
      ? 'Connecting…'
      : liz.isLive
        ? 'Already live'
        : null;

  const showVoiceUpgrade = liz.isError && liz.errorCode === 'liz_live_locked';

  const effectiveStatus = useMemo(() => {
    if (status) return status;
    if (sending) return 'thinking';
    return 'idle';
  }, [status, sending]);

  const isSpeaking = effectiveStatus === 'speaking';

  // Scene bar overrides — speaking/writing scenes inject a synthetic Liz
  // turn built from the user's REAL most recent attempt (or an empty-state
  // message when the user has no attempts yet). Real `messages` are never
  // mutated, only the rendered list is augmented for preview.
  const displayMessages = useMemo(() => {
    if (previewScene === 'speaking') {
      const content = latestSpeaking ? formatSpeakingReview(latestSpeaking) : EMPTY_SPEAKING_REVIEW;
      return [...messages, {
        role: 'assistant',
        content,
        mode: 'reviewing',
        timestamp: new Date().toISOString(),
      }];
    }
    if (previewScene === 'writing') {
      const content = latestWriting ? formatWritingReview(latestWriting) : EMPTY_WRITING_REVIEW;
      return [...messages, {
        role: 'assistant',
        content,
        mode: 'reviewing',
        timestamp: new Date().toISOString(),
      }];
    }
    return messages;
  }, [messages, previewScene, latestSpeaking, latestWriting]);
  const isEmpty = !displayMessages || displayMessages.length === 0;
  const showStaticVoice = previewScene === 'voice';

  // Listen-CTA: replay first Liz message via parent's onSpeakMessage handler.
  const firstLizMessage = displayMessages.find((m) => m.role === 'assistant');
  const handleListenCta = firstLizMessage && onSpeakMessage ? async () => {
    setListenBusy(true);
    try { await onSpeakMessage(firstLizMessage); } finally {
      setTimeout(() => setListenBusy(false), 3000);
    }
  } : null;

  const pendingHwCount = Array.isArray(homework)
    ? homework.filter((h) => h.status === 'pending').length
    : 0;

  return (
    <div className="liz-scope" data-testid="liz-teacher-page">
      <SceneBar scene={previewScene} onChange={setPreviewScene} />
      <div className="liz-mobile-tabs" role="tablist" aria-label="Liz sections">
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'today'}
          data-active={mobileTab === 'today'}
          onClick={() => setMobileTab('today')}
          data-testid="liz-mobile-tab-today"
        >Today</button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'chat'}
          data-active={mobileTab === 'chat'}
          onClick={() => setMobileTab('chat')}
          data-testid="liz-mobile-tab-chat"
        >Chat</button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'tools'}
          data-active={mobileTab === 'tools'}
          onClick={() => setMobileTab('tools')}
          data-testid="liz-mobile-tab-tools"
        >
          Tools
          {pendingHwCount > 0 ? (
            <span className="liz-mobile-tab-badge" aria-label={`${pendingHwCount} homework pending`}>{pendingHwCount}</span>
          ) : null}
        </button>
      </div>
      <main className="liz-layout" data-mobile-tab={mobileTab}>
        <TodayPanel
          user={user}
          lizStatus={lizStatus}
          sessions={sessions}
          onLoadSession={onLoadSession}
          onNewSession={onNewSession}
          onOpenStudyPlan={() => setStudyPlanOpen(true)}
        />

        <section className="canvas" data-mode={currentMode || 'teaching'}>
          <CanvasHead
            effectiveStatus={effectiveStatus}
            isSpeaking={isSpeaking}
            autoVoice={autoVoice}
            onToggleAutoVoice={onToggleAutoVoice}
            onStopSpeaking={onStopSpeaking}
            onNewSession={onNewSession}
          />

          {!isEmpty && handleListenCta ? (
            <ListenCta onClick={handleListenCta} busy={listenBusy} />
          ) : null}

          {!isEmpty ? (
            <ConversationStream messages={displayMessages} onListen={onSpeakMessage} />
          ) : (
            <div className="conversation" id="liz-conversation" />
          )}

          {!isEmpty && !showStaticVoice && displayMessages.length <= 2 && !input?.trim() ? (
            <LizSuggestStrip
              suggestions={lizStatus?.suggestions}
              onPick={handleSuggestPick}
            />
          ) : null}

          {voiceInsight && !isEmpty ? (
            <div className="voice-insight" data-testid="liz-voice-insight">
              <span className="voice-insight-label">Voice insight</span>
              <span className="voice-insight-text">{voiceInsight}</span>
            </div>
          ) : null}

          <div ref={canvasEndRef} />

          <Composer
            input={input}
            setInput={setInput}
            onSend={onSend}
            onTalk={handleTalk}
            sending={sending}
            talkLocked={talkLocked}
            talkLockedReason={talkLockedReason}
            onMicClick={onMicClick}
            status={effectiveStatus}
          />

          {talkPickerOpen ? (
            <TalkPracticeModal
              smartDefault={smartTalkDefault}
              onPick={handleTalkStart}
              onClose={() => setTalkPickerOpen(false)}
            />
          ) : null}

          {voiceOpen ? (
            <VoiceOverlay liz={liz} onClose={handleClose} />
          ) : null}

          {showStaticVoice ? (
            <StaticVoiceOverlay onClose={() => setPreviewScene('default')} />
          ) : null}


          {showVoiceUpgrade ? (
            <div className="voice-upgrade" role="alert">
              <p><b>Live with Liz</b> is on Premium plans only.</p>
              <a className="liz-btn liz-btn-primary" href="/pricing/v2">See plans</a>
              <button type="button" className="liz-btn liz-btn-ghost" onClick={liz.reset}>Dismiss</button>
            </div>
          ) : null}
        </section>

        <ContextPanel
          user={user}
          lizStatus={lizStatus}
          homework={homework}
          onAssignHomework={onAssignHomework}
          onSubmitHomework={onSubmitHomework}
          onDeleteHomework={onDeleteHomework}
          submittingHw={submittingHw}
          hwIcons={hwIcons}
          voiceQuota={liz.quota}
          currentMode={currentMode}
          messagesCount={messages?.length || 0}
          onChatPrompt={onPickLesson}
          onOpenStudyPlan={() => setStudyPlanOpen(true)}
          recommendedCourse={recommendedCourse}
          lessonModes={lessonModes}
        />
      </main>

      {studyPlanOpen ? (
        <StudyPlanDrawer
          lizStatus={lizStatus}
          user={user}
          onClose={() => setStudyPlanOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default function LizD8(props) {
  return (
    <ConversationProvider>
      <LizD8Inner {...props} />
    </ConversationProvider>
  );
}
