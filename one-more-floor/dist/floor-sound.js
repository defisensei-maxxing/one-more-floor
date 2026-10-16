// Original, locally synthesized cues: no downloads or external audio requests.
export function playFloorSound(audio, advancing = false) {
  const voices = [];
  const start = audio.currentTime + 0.015;
  // A restrained minor arpeggio suits the tower's sneaky, playful mood.
  const notes = advancing
    ? [[0, 392, .14, .045], [.09, 784, .25, .04]]
    : [[0, 392, .24, .055], [.13, 466.16, .24, .05], [.26, 587.33, .28, .045], [.42, 784, .65, .04]];
  for (const [offset, frequency, duration, volume] of notes) {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const time = start + offset;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(time);
    oscillator.stop(time + duration + .02);
    voices.push(oscillator);
  }
  return () => { for (const voice of voices) { try { voice.stop(); } catch {} } };
}
