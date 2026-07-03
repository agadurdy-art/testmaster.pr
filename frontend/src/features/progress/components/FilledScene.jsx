// Extracted verbatim from pages/Progress.js (Faz1 refactor).
import React, { useMemo } from 'react';
import {
  TrendingUp, BookOpen, ChevronRight, Award,
} from 'lucide-react';
import {
  T, FONT_DISPLAY, FONT_MONO, SKILLS, STRENGTH_DESCRIPTORS, bandPct, PACE_OPTIONS,
} from '../constants';
import { BackLink, PageHead, Panel, Kicker, Insight, Milestone } from './primitives';
import RadarChart from './RadarChart';
import TrendChart from './TrendChart';
import AttemptRow from './AttemptRow';

export default function FilledScene(props) {
  const {
    scene, onChip,
    stats, attempts, targetBand, weakestSkill, weekly, recent7, bandsReached, firstAttempt,
    writingByTask, trendPoints, trendWindow, setTrendWindow, weeklyPace, gap, gapText,
    navigate, onEditPace, onEditTarget,
    filter, setFilter, filteredAttempts, formatDate, formatShortDate,
  } = props;

  const targetReached = stats.avgBand > 0 && gap <= 0;
  const headline = targetReached
    ? `You're at Band ${targetBand.toFixed(1)}`
    : `You're closing the gap on Band ${targetBand.toFixed(1)}`;

  const subline = recent7.length > 0
    ? `Last 7 days: ${recent7.length} attempt${recent7.length !== 1 ? 's' : ''}${weakestSkill ? ` · ${weakestSkill.label.toLowerCase()} is your current weak spot` : ''}.`
    : (stats.totalTests > 0
        ? `${stats.totalTests} test${stats.totalTests !== 1 ? 's' : ''} taken so far${weakestSkill ? ` · ${weakestSkill.label.toLowerCase()} is your current weak spot` : ''}.`
        : 'Track your IELTS journey and improvement.');

  const paceOpt = PACE_OPTIONS.find((p) => p.id === weeklyPace) || PACE_OPTIONS[1];

  // Recommended skill (next-best target after weakest)
  const recommendedSkill = useMemo(() => {
    const scored = SKILLS
      .map((s) => ({ ...s, band: stats.byType?.[s.id]?.avg_score || stats.byType?.[s.id]?.avgBand || 0, count: stats.byType?.[s.id]?.count || 0 }))
      .filter((s) => weakestSkill ? s.id !== weakestSkill.id : true);
    if (!scored.length) return null;
    const noPractice = scored.find((s) => s.count === 0);
    if (noPractice) return noPractice;
    return scored.sort((a, b) => a.band - b.band)[0];
  }, [stats.byType, weakestSkill]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 48px' }}>

      <BackLink onClick={() => navigate('/dashboard')} />

      <PageHead
        kicker="Progress"
        title={headline}
        subtitle={subline}
        scene={scene}
        onChip={onChip}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)',
        gap: 20,
      }} className="d10-layout">
        <style>{`@media (max-width: 1040px) { .d10-layout { grid-template-columns: 1fr !important; } .d10-band-hero { grid-template-columns: 1fr !important; } }`}</style>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Band hero panel */}
          <Panel>
            <div className="d10-band-hero" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr',
              gap: 24,
              alignItems: 'center',
            }}>
              <div>
                <Kicker>Estimated overall band</Kicker>
                <div style={{
                  fontFamily: FONT_DISPLAY, fontSize: 64, fontWeight: 600,
                  lineHeight: 1, letterSpacing: '-0.02em',
                  color: `hsl(${T.brandDark})`, margin: '4px 0',
                }}>
                  {stats.avgBand > 0 ? stats.avgBand.toFixed(1) : '—'}
                </div>
                {weekly.lastCount > 0 && weekly.delta !== 0 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 999,
                    background: weekly.delta > 0 ? `hsl(${T.brand} / 0.12)` : `hsl(${T.rose} / 0.12)`,
                    color: weekly.delta > 0 ? `hsl(${T.brandDark})` : `hsl(${T.rose})`,
                    fontWeight: 600, fontSize: 13,
                  }}>
                    <TrendingUp style={{ width: 12, height: 12, transform: weekly.delta < 0 ? 'rotate(180deg)' : 'none' }} />
                    {weekly.delta > 0 ? '+' : ''}{weekly.delta.toFixed(1)} vs last week
                  </div>
                )}
                <div style={{ marginTop: 14, fontSize: 13, color: `hsl(${T.muted})`, maxWidth: 260 }}>
                  Target: Band {targetBand.toFixed(1)}{gapText ? ` · ${gapText}` : ''}
                  <button
                    onClick={onEditTarget}
                    style={{
                      marginLeft: 8, padding: '2px 8px', borderRadius: 999,
                      background: `hsl(${T.borderSoft})`, color: `hsl(${T.muted})`,
                      fontSize: 11, fontWeight: 600, border: 0, cursor: 'pointer',
                    }}
                  >Edit</button>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: `hsl(${T.fainter})` }}>
                  {recent7.length > 0
                    ? `Based on ${recent7.length} recent attempt${recent7.length !== 1 ? 's' : ''}`
                    : 'Take a test to see your trend'}
                </div>
              </div>

              {/* Radar SVG */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <RadarChart
                  skills={SKILLS}
                  actual={SKILLS.map((s) => stats.byType?.[s.id]?.avg_score || stats.byType?.[s.id]?.avgBand || 0)}
                  target={targetBand}
                />
                <div style={{
                  display: 'flex', gap: 20, marginTop: 8,
                  fontSize: 12, color: `hsl(${T.muted})`,
                }}>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: `hsl(${T.brand})`, marginRight: 6, verticalAlign: 'middle' }} />
                    Current
                  </span>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: `hsl(${T.gold})`, opacity: 0.6, marginRight: 6, verticalAlign: 'middle' }} />
                    Target
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Trend chart panel */}
          <Panel>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <Kicker>Band trend</Kicker>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, margin: '4px 0 0' }}>
                  {trendWindow === '7d' ? 'Last 7 days' : trendWindow === '30d' ? 'Last 30 days' : 'All time'}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['7d', '30d', 'all'].map((w) => {
                  const active = trendWindow === w;
                  return (
                    <button
                      key={w}
                      onClick={() => setTrendWindow(w)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        background: active ? `hsl(${T.brand} / 0.08)` : 'transparent',
                        color: active ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                        border: 0, cursor: 'pointer',
                      }}
                    >
                      {w === '7d' ? '7d' : w === '30d' ? '30d' : 'All'}
                    </button>
                  );
                })}
              </div>
            </div>

            {trendPoints.length >= 2 ? (
              <TrendChart points={trendPoints} target={targetBand} />
            ) : (
              <div style={{
                padding: '40px 16px', textAlign: 'center',
                borderRadius: 12, background: `hsl(${T.bg})`,
                border: `1px dashed hsl(${T.border})`,
                color: `hsl(${T.fainter})`, fontSize: 13,
              }}>
                Take a test to see your trend.
              </div>
            )}
          </Panel>

          {/* Skills breakdown panel */}
          <Panel>
            <Kicker>By skill</Kicker>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, margin: '4px 0 12px' }}>
              Where to focus this week
            </h3>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12,
            }}>
              {SKILLS.map(({ id, label, Icon }) => {
                const band = stats.byType?.[id]?.avg_score || stats.byType?.[id]?.avgBand || 0;
                const count = stats.byType?.[id]?.count || 0;
                const isWeakest = weakestSkill?.id === id;
                const targetMarkLeft = `${bandPct(targetBand)}%`;
                const fill = `${bandPct(band)}%`;
                const desc = STRENGTH_DESCRIPTORS[id];
                return (
                  <div
                    key={id}
                    data-testid={`strength-${id}`}
                    style={{
                      padding: 14, borderRadius: 16,
                      border: `1px solid ${isWeakest ? `hsl(${T.rose} / 0.5)` : `hsl(${T.border})`}`,
                      background: isWeakest ? `hsl(${T.rose} / 0.03)` : `hsl(${T.surface})`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon style={{ width: 14, height: 14, color: `hsl(${T.muted})` }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                        {isWeakest && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 999,
                            background: `hsl(${T.rose} / 0.15)`, color: `hsl(${T.rose})`,
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
                          }}>Weakest</span>
                        )}
                      </div>
                      <span style={{
                        fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, lineHeight: 1,
                        color: band > 0 ? `hsl(${T.brandDark})` : `hsl(${T.fainter})`,
                      }}>
                        {band > 0 ? band.toFixed(1) : '—'}
                      </span>
                    </div>
                    <div style={{
                      height: 8, borderRadius: 4, background: `hsl(${T.border})`,
                      position: 'relative', overflow: 'visible',
                    }}>
                      <div style={{
                        height: '100%', width: fill,
                        background: `linear-gradient(90deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
                        borderRadius: 4, transition: 'width 400ms',
                      }} />
                      <span style={{
                        position: 'absolute', top: -2, bottom: -2, left: targetMarkLeft,
                        width: 2, background: `hsl(${T.gold})`, borderRadius: 1,
                      }} />
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginTop: 6, fontSize: 11, color: `hsl(${T.muted})`,
                      fontFamily: FONT_MONO,
                    }}>
                      <span>Target {targetBand.toFixed(1)}{band > 0 && targetBand > band ? ` (${(targetBand - band).toFixed(1)} to go)` : ''}</span>
                      <span>{count} test{count !== 1 ? 's' : ''}</span>
                    </div>
                    {desc && band > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: `hsl(${T.muted})` }}>
                        {desc.emoji} {desc.text}
                      </div>
                    )}
                    {id === 'writing' && writingByTask && (writingByTask.t1 || writingByTask.t2) && (
                      <div style={{
                        marginTop: 10, paddingTop: 10,
                        borderTop: `1px dashed hsl(${T.border})`,
                        display: 'flex', flexDirection: 'column', gap: 6,
                      }} data-testid="writing-by-task">
                        {[
                          { key: 't1', label: 'Task 1', d: writingByTask.t1 },
                          { key: 't2', label: 'Task 2', d: writingByTask.t2 },
                        ].map(({ key, label: tLabel, d }) => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                              color: `hsl(${T.muted})`, width: 44, flexShrink: 0,
                            }}>
                              {tLabel}
                            </span>
                            <div style={{
                              flex: 1, height: 6, borderRadius: 3,
                              background: `hsl(${T.border})`, position: 'relative', overflow: 'hidden',
                            }}>
                              {d?.avg_score > 0 && (
                                <div style={{
                                  height: '100%', width: `${bandPct(d.avg_score)}%`,
                                  background: key === 't1'
                                    ? `hsl(${T.sky})`
                                    : `linear-gradient(90deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
                                  borderRadius: 3,
                                }} />
                              )}
                            </div>
                            <span style={{
                              fontSize: 11, fontFamily: FONT_MONO,
                              color: d?.avg_score > 0 ? `hsl(${T.brandDark})` : `hsl(${T.fainter})`,
                              width: 28, textAlign: 'right', flexShrink: 0,
                            }}>
                              {d?.avg_score > 0 ? d.avg_score.toFixed(1) : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* This Week with Liz */}
          <Panel>
            <div style={{
              background: `linear-gradient(135deg, hsl(${T.brand} / 0.08), hsl(${T.sky} / 0.08))`,
              border: `1px solid hsl(${T.brand} / 0.22)`,
              borderRadius: 16, padding: 18,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: `linear-gradient(135deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
                  display: 'grid', placeItems: 'center', color: 'white',
                  fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15,
                  flex: '0 0 34px',
                }}>L</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: `hsl(${T.brandDark})`, fontWeight: 600 }}>
                    This week with Liz
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600 }}>
                    {paceOpt.sessions} session{paceOpt.sessions !== 1 ? 's' : ''} · {paceOpt.id} pace
                  </div>
                </div>
                <button
                  onClick={onEditPace}
                  style={{
                    marginLeft: 'auto', padding: '5px 10px', borderRadius: 8,
                    color: `hsl(${T.brandDark})`, fontSize: 12, fontWeight: 600,
                    background: 'transparent', border: 0, cursor: 'pointer',
                  }}
                >Edit</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0 8px' }}>
                {Array.from({ length: paceOpt.sessions }).map((_, i) => {
                  const done = i < Math.min(weekly.thisCount, paceOpt.sessions);
                  return (
                    <span
                      key={i}
                      style={{
                        flex: 1, height: 10, borderRadius: 5,
                        background: done ? `hsl(${T.brand})` : `hsl(${T.surface})`,
                        border: `1px solid ${done ? `hsl(${T.brand})` : `hsl(${T.brand} / 0.25)`}`,
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ fontSize: 13, color: `hsl(${T.ink} / 0.8)` }}>
                <b>{Math.min(weekly.thisCount, paceOpt.sessions)} of {paceOpt.sessions} done</b>
                {weekly.thisCount >= paceOpt.sessions
                  ? ' — pace hit for this week.'
                  : ' — keep going to stay on pace.'}{' '}
                <em style={{ fontStyle: 'normal', color: `hsl(${T.muted})` }}>
                  I scheduled {paceOpt.sessions} sessions this week — {paceOpt.id} pace.
                </em>
              </div>
            </div>
          </Panel>

          {/* Liz's Read insights */}
          <Panel>
            <Kicker>Liz's read</Kicker>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, margin: '4px 0 12px' }}>
              What's working, what's not
            </h3>
            {recent7.length < 3 && stats.totalTests < 3 ? (
              <div style={{
                padding: '20px 16px', textAlign: 'center',
                borderRadius: 12, background: `hsl(${T.bg})`,
                border: `1px dashed hsl(${T.border})`,
                color: `hsl(${T.fainter})`, fontSize: 13,
              }}>
                Take 3 tests and I'll have something to say.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {weakestSkill && (
                  <Insight kind="gap" title={`Your weakest skill is ${weakestSkill.label}`}>
                    Let's drill it. A targeted session this week will move the needle the fastest.
                  </Insight>
                )}
                <Insight kind="win" title={`${recent7.length} attempt${recent7.length !== 1 ? 's' : ''} in the last 7 days`}>
                  {recent7.length >= 3
                    ? "You're keeping the rhythm — that's where the trend comes from."
                    : 'Bump it to 3+ to see a clean trend line.'}
                </Insight>
                {recommendedSkill && (
                  <Insight kind="next" title={`Try ${recommendedSkill.label} this week`}>
                    {recommendedSkill.count === 0
                      ? "You haven't logged a test here yet — let's establish a baseline."
                      : 'A second pass will firm up the read on this skill.'}
                  </Insight>
                )}
              </div>
            )}
          </Panel>

          {/* Milestones */}
          <Panel>
            <Kicker>Milestones</Kicker>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, margin: '4px 0 0' }}>
              Road to your exam
            </h3>
            <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
              <Milestone done={!!firstAttempt} label="First attempt" date={firstAttempt ? formatShortDate(firstAttempt.completed_at) : '—'} />
              {bandsReached.map((b) => (
                <Milestone key={b} done label={`Band ${b} unlocked`} date="—" />
              ))}
              <Milestone next={!firstAttempt ? false : true} label="Full mock test" date="Schedule it" />
              <Milestone label="Exam day" date="Set your exam date" />
            </ul>
          </Panel>
        </div>

      </div>

      {/* Test History */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, margin: 0 }}>
            Test history
          </h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'reading', 'listening', 'writing', 'speaking'].map((type) => {
              const active = filter === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  style={{
                    padding: '6px 12px', borderRadius: 999,
                    background: active ? `hsl(${T.brand} / 0.10)` : `hsl(${T.surface})`,
                    border: `1px solid ${active ? `hsl(${T.brand} / 0.5)` : `hsl(${T.border})`}`,
                    color: active ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick start row — preserves the deep-link testids */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => navigate('/test/reading')}
            data-testid="quick-start-reading"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 12, borderRadius: 12,
              background: `hsl(${T.surface})`, border: `1px solid hsl(${T.brand} / 0.25)`,
              textAlign: 'left', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 34, height: 34, flex: '0 0 34px', borderRadius: 10,
              background: `hsl(${T.brand} / 0.12)`,
              display: 'grid', placeItems: 'center', color: `hsl(${T.brandDark})`,
            }}>
              <BookOpen style={{ width: 16, height: 16 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Random reading test</div>
              <div style={{ fontSize: 12, color: `hsl(${T.muted})` }}>Start a fresh passage now</div>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: `hsl(${T.muted})` }} />
          </button>
          <button
            onClick={() => navigate('/advanced-mastery')}
            data-testid="quick-start-advanced"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 12, borderRadius: 12,
              background: `hsl(${T.surface})`, border: `1px solid hsl(${T.gold} / 0.35)`,
              textAlign: 'left', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 34, height: 34, flex: '0 0 34px', borderRadius: 10,
              background: `hsl(${T.gold} / 0.18)`,
              display: 'grid', placeItems: 'center', color: `hsl(35 80% 36%)`,
            }}>
              <Award style={{ width: 16, height: 16 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Advanced Mastery</div>
              <div style={{ fontSize: 12, color: `hsl(${T.muted})` }}>Band 7+ drills curated by Liz</div>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: `hsl(${T.muted})` }} />
          </button>
        </div>

        {filteredAttempts.length === 0 ? (
          <div style={{
            padding: 40, borderRadius: 16,
            background: `hsl(${T.surface})`, border: `1px dashed hsl(${T.border})`,
            textAlign: 'center', color: `hsl(${T.muted})`,
          }}>
            No {filter === 'all' ? '' : filter} tests in this view yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredAttempts.map((attempt, idx) => (
              <AttemptRow
                key={attempt.id || idx}
                attempt={attempt}
                formatDate={formatDate}
                onClick={() => navigate(`/results/${attempt.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
