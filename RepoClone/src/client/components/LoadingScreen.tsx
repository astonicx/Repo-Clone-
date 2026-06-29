import React, { useEffect, useRef, useState } from 'react';
import '../styles/LoadingScreen.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

interface LoadingTask {
  name: string;
  progress: number;
}

const LOADING_TIPS = [
  'Keep valuables safe — one mishandle and they\'re worthless',
  'Listen for distant sounds — your hearing is your best weapon',
  'Teamwork and communication are your survival tools',
  'Move slowly in unfamiliar areas — watch for hazards',
  'The Taxman takes 20% of all profits — plan accordingly',
  'Don\'t run with expensive loot — physics matter',
  'Revive fallen teammates at extraction points',
  'Monsters hear noise — silence is safety',
  'Cart your loot for safer transport',
  'Learn the layout before rushing in',
];

// Each task completes at the given elapsed time (ms).
const TASK_TIMINGS: { name: string; completeAt: number }[] = [
  { name: 'Checking equipment', completeAt: 500 },
  { name: 'Loading facility map', completeAt: 2000 },
  { name: 'Syncing team comms', completeAt: 3000 },
  { name: 'Calibrating sensors', completeAt: 3500 },
];

const TOTAL_LOAD_MS = 4000;

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState<LoadingTask[]>(
    TASK_TIMINGS.map((t) => ({ name: t.name, progress: 0 }))
  );
  const [canSkip, setCanSkip] = useState(false);
  const [tip] = useState(() => LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
  const completedRef = useRef(false);

  useEffect(() => {
    const start = performance.now();
    let rafId = 0;

    const complete = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setProgress(100);
      setTasks((prev) => prev.map((t) => ({ ...t, progress: 100 })));
      window.setTimeout(onComplete, 400);
    };

    const tick = () => {
      const elapsed = performance.now() - start;

      setTasks(
        TASK_TIMINGS.map((t) => ({
          name: t.name,
          progress: Math.min(100, Math.max(0, (elapsed / t.completeAt) * 100)),
        }))
      );

      setProgress(Math.min(100, (elapsed / TOTAL_LOAD_MS) * 100));

      if (elapsed >= TOTAL_LOAD_MS) {
        complete();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const skipTimeout = window.setTimeout(() => setCanSkip(true), 800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Escape') {
        complete();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(skipTimeout);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <div className="scanlines" />
      <div className="loading-content">
        {/* Title */}
        <div className="loading-title glitch" data-text="R.E.P.O.">
          R.E.P.O.
        </div>
        <div className="loading-subtitle">Retrieval Extraction Protocol Operations</div>

        {/* Particles */}
        <div className="particles">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

        {/* Loading Bar */}
        <div className="loading-bar-container">
          <div className="loading-bar">
            <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-percentage">{Math.round(progress)}%</div>
        </div>

        {/* Tasks */}
        <div className="loading-tasks">
          <div className="loading-tasks-header">INITIALIZING SYSTEMS...</div>
          {tasks.map((task, idx) => (
            <div key={idx} className="loading-task">
              <span className="task-name">&gt; {task.name}</span>
              <span className={`task-progress ${task.progress >= 100 ? 'done' : ''}`}>
                {task.progress >= 100 ? '✓ 100%' : `${Math.round(task.progress)}%`}
              </span>
            </div>
          ))}
        </div>

        {/* Random Tip */}
        <div className="loading-tip">"{tip}"</div>

        {/* Skip Hint */}
        {canSkip && <div className="loading-skip">Press SPACE or ESC to skip</div>}

        {/* Version */}
        <div className="loading-version">v1.0.0 - Early Access</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
