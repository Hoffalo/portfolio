/** A note as [frequency in Hz, length in seconds]; 0 Hz is a rest. */
type Note = readonly [number, number];

let audio: AudioContext | undefined;

/**
 * Plays notes on a square wave, like an NES pulse channel. The audio context is created lazily, on
 * the first sound after a key press, because browsers only allow audio after user interaction.
 */
export function playChiptune(notes: readonly Note[], volume = 0.06) {
  try {
    audio ??= new AudioContext();
  } catch {
    return; // No Web Audio (old browser, test environment): stay silent.
  }
  const context = audio;
  let start = context.currentTime + 0.01;
  for (const [frequency, length] of notes) {
    if (frequency > 0) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + length);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + length);
    }
    start += length;
  }
}

/** A rising arpeggio that announces the secret world. */
export const playSecretJingle = () =>
  playChiptune([
    [523, 0.07],
    [659, 0.07],
    [784, 0.07],
    [1047, 0.07],
    [0, 0.05],
    [784, 0.07],
    [1047, 0.07],
    [1319, 0.07],
    [1568, 0.3],
  ]);

/** Two quick notes, up a fourth: a coin. */
export const playCoin = () =>
  playChiptune([
    [988, 0.07],
    [1319, 0.22],
  ]);
