import React from 'react';
import { AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';

// ═══════ ACTIVITY ERROR BOUNDARY ═══════
class ActivityErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error('Activity crash:', err, info); }
  componentDidUpdate(prevProps) {
    if (prevProps.activityType !== this.props.activityType) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center" data-testid="activity-error-card">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong with this activity</h3>
          <p className="text-sm text-gray-500 mb-4">Your lesson progress is saved. You can retry or skip this activity.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => this.setState({ hasError: false })} data-testid="activity-retry-btn">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
            {this.props.onSkip && (
              <Button onClick={this.props.onSkip} data-testid="activity-skip-btn">
                Skip <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      );
    }
    return this.props.children;
  }
}

// Per-game boundary — bad item / null prop in ONE game inside a 6-pack
// should not kill the rest. Resets whenever `resetKey` (gameIdx) changes.
class GameSlotBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error('Game slot crash:', err, info); }
  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 text-center" data-testid="game-slot-error">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-4">This mini-game can't load. Let's continue.</p>
          <Button size="sm" onClick={this.props.onSkip}>Next game <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </Card>
      );
    }
    return this.props.children;
  }
}

export { ActivityErrorBoundary, GameSlotBoundary };
