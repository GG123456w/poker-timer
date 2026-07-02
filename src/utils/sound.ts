const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export const playWarningBeep = (): void => {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = 600;
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
};

export const playLevelUpBeep = (): void => {
  if (!audioContext) return;
  const playNote = (freq: number, delay: number, duration: number) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    }, delay);
  };
  playNote(880, 0, 0.2);
  playNote(1100, 200, 0.2);
  playNote(1320, 400, 0.4);
};

export const playEndBeep = (): void => {
  if (!audioContext) return;
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }, i * 250);
  }
};
