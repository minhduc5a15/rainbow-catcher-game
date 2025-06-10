'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { subscribeToGlobalHighScore, type GlobalHighScore } from '@/lib/firebase';

export function GlobalHighScoreDisplay() {
  const [globalHighScore, setGlobalHighScore] = useState<GlobalHighScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGlobalHighScore((highScore) => {
      setGlobalHighScore(highScore);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30" disabled>
        🌍 Loading...
      </Button>
    );
  }

  if (!globalHighScore) {
    return (
      <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30" disabled>
        🌍 No Global Record
      </Button>
    );
  }

  const timeAgo = getTimeAgo(globalHighScore.timestamp);

  return (
    <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30" disabled>
      🌍 Global: {globalHighScore.score.toLocaleString()} ({timeAgo})
    </Button>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}
