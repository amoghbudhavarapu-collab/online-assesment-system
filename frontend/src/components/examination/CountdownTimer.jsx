import { useEffect, useState } from 'react';
import { formatCountdown } from '../../utils/datetime';

export default function CountdownTimer({ deadlineAt, remainingSeconds, onExpire }) {
  const [seconds, setSeconds] = useState(remainingSeconds ?? 0);

  useEffect(() => {
    const compute = () => {
      if (deadlineAt) {
        return Math.max(0, Math.floor((new Date(deadlineAt).getTime() - Date.now()) / 1000));
      }
      return remainingSeconds ?? 0;
    };
    setSeconds(compute());
    const id = setInterval(() => {
      const next = compute();
      setSeconds(next);
      if (next <= 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadlineAt, remainingSeconds, onExpire]);

  const urgent = seconds <= 60;
  return (
    <div className={`rounded-xl px-4 py-2 font-mono text-lg font-bold ${urgent ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
      {formatCountdown(seconds)}
    </div>
  );
}
