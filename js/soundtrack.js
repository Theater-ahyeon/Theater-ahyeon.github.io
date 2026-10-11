/**
 * Original, sample-free 120 BPM / 16-bar electronic score.
 *
 * Integration: mountSoundtrack(document) once after the controls exist. The
 * initial HTML button must be disabled. Required: #audio-toggle; optional:
 * #audio-volume (0–100), #audio-status (role=status), #audio-panel.
 * Only a trusted button click can start playback. Motion settings are unrelated.
 * The returned controller offers pause(), destroy(), and read-only state/volume.
 */
const mounts = new WeakMap();
const VOLUME_KEY = 'theater-audio-volume';
const DEFAULT_VOLUME = 24;
const BPM = 120;
const STEP_SECONDS = 60 / BPM / 4;
const midi = note => 440 * 2 ** ((note - 69) / 12);
const chords = [
  {root:40, notes:[52,55,59,66]}, // E minor 9
  {root:36, notes:[48,55,59,64]}, // C major 7
  {root:43, notes:[50,55,59,69]}, // G add 9
  {root:38, notes:[50,57,64,66]}, // D add 9
  {root:40, notes:[52,55,59,66]},
  {root:36, notes:[48,55,59,64]},
  {root:33, notes:[45,52,55,60]}, // A minor 7
  {root:35, notes:[47,54,57,62]}  // B minor 7, returning to E
];
const arpeggio = [0,2,1,3,2,1,3,1];
const motif = [
  [76,79,78,74,71], [74,76,71,69,67],
  [74,79,78,74,71], [73,74,78,76,69],
  [76,79,83,78,76], [76,79,76,74,71],
  [72,76,79,76,74], [74,78,76,71,66]
];

function boundedVolume(value, fallback = DEFAULT_VOLUME) {
  if (typeof value === 'string' && !/^\d+(?:\.\d+)?$/.test(value.trim())) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(Math.min(100, Math.max(0, number))) : fallback;
}

/** A new bounded node graph for each play; the AudioContext is reused. */
function createScore(context, output, view) {
  const graph = [];
  const sources = new Set();
  const node = value => { graph.push(value); return value; };
  const mix = node(context.createGain());
  mix.gain.value = 0.8;
  const compressor = node(context.createDynamicsCompressor());
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.18;
  mix.connect(compressor); compressor.connect(output);
  const echoSend = node(context.createGain());
  echoSend.gain.value = 0.16;
  const delay = node(context.createDelay(1));
  delay.delayTime.value = 0.375;
  const echoFilter = node(context.createBiquadFilter());
  echoFilter.type = 'lowpass'; echoFilter.frequency.value = 2100;
  const feedback = node(context.createGain());
  feedback.gain.value = 0.23;
  echoSend.connect(delay); delay.connect(echoFilter); echoFilter.connect(mix);
  echoFilter.connect(feedback); feedback.connect(delay);

  // Fixed seed, very short percussion bursts. There is no continuous noise bed.
  const noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.18), context.sampleRate);
  const data = noise.getChannelData(0);
  let seed = 219;
  for (let i = 0; i < data.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    data[i] = ((seed / 4294967296) * 2 - 1) * 0.7;
  }
  let disposed = false, timer = null, step = 0, nextTime = context.currentTime + 0.04;

  function track(source, nodes, start, end) {
    const voice = {source, nodes}; sources.add(voice);
    source.onended = () => {
      sources.delete(voice);
      for (const owned of [source, ...nodes]) { try { owned.disconnect(); } catch {} }
    };
    source.start(start); source.stop(end);
  }
  function tone(note, start, duration, level, type = 'triangle', cutoff = 2000, echo = false, attack = 0.008) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = type; oscillator.frequency.value = midi(note);
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(cutoff, start);
    filter.Q.value = 0.5;
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(level, start + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter); filter.connect(envelope); envelope.connect(mix);
    if (echo) envelope.connect(echoSend);
    track(oscillator, [filter,envelope], start, start + duration + 0.025);
  }
  function pad(note, start, level) {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    oscillator.type = 'sawtooth'; oscillator.frequency.value = midi(note);
    filter.type = 'lowpass'; filter.frequency.value = 780; filter.Q.value = 0.35;
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(level, start + 0.24);
    envelope.gain.setValueAtTime(level * 0.8, start + 1.45);
    envelope.gain.linearRampToValueAtTime(0, start + 2.2);
    oscillator.connect(filter); filter.connect(envelope);
    envelope.connect(mix); envelope.connect(echoSend);
    track(oscillator, [filter,envelope], start, start + 2.22);
  }
  function kick(start, level) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(112, start);
    oscillator.frequency.exponentialRampToValueAtTime(47, start + 0.09);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(level, start + 0.004);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.27);
    oscillator.connect(envelope); envelope.connect(mix);
    track(oscillator, [envelope], start, start + 0.29);
  }
  function percussion(start, level, snare = false) {
    const source = context.createBufferSource(); source.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = snare ? 'bandpass' : 'highpass';
    filter.frequency.value = snare ? 1700 : 6800; filter.Q.value = snare ? 0.8 : 0.4;
    const envelope = context.createGain();
    const duration = snare ? 0.13 : 0.045;
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(level, start + 0.002);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter); filter.connect(envelope); envelope.connect(mix);
    track(source, [filter,envelope], start, start + duration + 0.01);
    if (snare) tone(50, start, 0.085, 0.045, 'sine', 1000);
  }
  function scheduleStep(index, time) {
    const bar = Math.floor(index / 16) % 16;
    const beat = index % 16;
    const harmony = chords[Math.floor(bar / 2)];
    // Bars 9–10 ease back before the second phrase builds to its resolution.
    const breakdown = bar === 8 || bar === 9;
    const intensity = breakdown ? 0.7 : bar >= 12 ? 1.08 : 1;
    if (beat === 0) harmony.notes.forEach(note => pad(note, time, 0.018 * intensity));
    if (beat % 4 === 0 && (!breakdown || beat % 8 === 0)) kick(time, beat === 0 ? 0.29 : 0.23);
    if ((beat === 4 || beat === 12) && !breakdown) percussion(time, 0.075, true);
    if (beat % 4 === 2) percussion(time, 0.038 * intensity);
    if (bar >= 12 && (beat === 7 || beat === 15)) percussion(time, 0.019);
    if ([0,3,6,8,11,14].includes(beat)) {
      const offset = beat === 11 ? 12 : beat === 14 && bar % 2 ? 7 : 0;
      tone(harmony.root + offset, time + 0.009, beat === 0 || beat === 8 ? 0.30 : 0.18,
        0.105 * intensity, 'triangle', 480);
    }
    if (beat % 2 === 0 && (!breakdown || beat % 4 === 0)) {
      const order = (beat / 2 + (bar % 2 ? 3 : 0)) % arpeggio.length;
      tone(harmony.notes[arpeggio[order]] + 12, time + (beat % 4 === 2 ? 0.014 : 0),
        0.27, (beat % 4 === 0 ? 0.047 : 0.032) * intensity, 'triangle', 2400, true);
    }
    const phraseIndex = [0,3,6,10,14].indexOf(beat);
    if (bar % 8 >= 4 && phraseIndex >= 0) {
      tone(motif[Math.floor(bar / 2)][phraseIndex], time + 0.017, phraseIndex === 4 ? 0.43 : 0.30,
        0.032 * intensity, 'sawtooth', 1350, true, 0.025);
    }
  }
  function tick() {
    if (disposed) return;
    // An overdue tab gets a new clock anchor, never a burst of missed notes.
    if (nextTime < context.currentTime - 0.3) nextTime = context.currentTime + 0.04;
    while (nextTime < context.currentTime + 0.16) {
      scheduleStep(step, nextTime);
      step = (step + 1) % 256;
      nextTime += STEP_SECONDS;
    }
  }
  try { tick(); timer = view.setInterval(tick, 25); }
  catch (error) { stop(); throw error; }
  function stop() {
    if (disposed) return;
    disposed = true;
    if (timer !== null) view.clearInterval(timer);
    for (const voice of sources) {
      voice.source.onended = null;
      try { voice.source.stop(); } catch {}
      for (const owned of [voice.source, ...voice.nodes]) { try { owned.disconnect(); } catch {} }
    }
    sources.clear();
    for (const owned of graph) { try { owned.disconnect(); } catch {} }
  }
  return {stop};
}

export function mountSoundtrack(root = document) {
  const button = root.querySelector('#audio-toggle');
  if (!button) return null;
  if (mounts.has(button)) return mounts.get(button);
  const doc = button.ownerDocument || root;
  const view = doc.defaultView || globalThis;
  const AudioContext = view.AudioContext || view.webkitAudioContext;
  const slider = root.querySelector('#audio-volume');
  const status = root.querySelector('#audio-status');
  const panel = root.querySelector('#audio-panel');
  let volume = DEFAULT_VOLUME;
  try {
    const stored = view.localStorage.getItem(VOLUME_KEY);
    if (stored !== null) volume = boundedVolume(stored);
  } catch {}
  let state = 'idle', destroyed = false, generation = 0;
  let context = null, output = null, score = null, pendingSuspend = null;
  const hidden = () => Boolean(doc.hidden) || doc.visibilityState === 'hidden';
  const targetGain = () => volume / 100 * 0.65;
  const labels = {
    idle:'原创电子配乐 · 点击播放', starting:'原创电子配乐 · 正在准备',
    playing:'原创电子配乐 · 播放中', paused:'原创电子配乐 · 已暂停',
    blocked:'播放未获允许，请再次点击', interrupted:'音频已中断，请点击继续',
    hidden:'离开页面已暂停，请点击继续', unavailable:'此浏览器无法播放原创电子配乐'
  };
  function render(next, text) {
    state = next;
    const playing = state === 'playing';
    const label = state === 'starting' ? '取消播放' : playing ? '暂停配乐' : '播放配乐';
    const labelNode = button.querySelector('[data-audio-label]');
    if (labelNode) labelNode.textContent = label;
    else button.textContent = label;
    button.setAttribute('aria-label', `${label} · 原创电子配乐`);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-busy', String(state === 'starting'));
    button.dataset.audioState = state;
    button.disabled = destroyed || !AudioContext || state === 'unavailable';
    if (status) status.textContent = text || labels[state] || labels.paused;
    if (panel) panel.dataset.audioState = state;
  }
  function silence() {
    if (output && context) {
      try {
        output.gain.cancelScheduledValues(context.currentTime);
        output.gain.setValueAtTime(0, context.currentTime);
      } catch {}
    }
    score?.stop(); score = null;
  }
  function suspendWhenHidden() {
    if (!context || context.state === 'closed' || pendingSuspend) return;
    try {
      const suspension = Promise.resolve(context.suspend());
      pendingSuspend = suspension;
      suspension.catch(() => {}).finally(() => { if (pendingSuspend === suspension) pendingSuspend = null; });
    } catch {}
  }
  function pause(reason = 'paused') {
    if (destroyed || !AudioContext) return;
    generation++;
    silence();
    render(reason);
    if (hidden() || reason === 'hidden') suspendWhenHidden();
  }
  function onContextChange() {
    if (state === 'playing' && context.state !== 'running') pause('interrupted');
    // A browser may resume its own context on return. The stopped graph stays
    // silent: statechange never starts a score or restores playing intention.
  }
  function ensureContext() {
    if (context) return;
    context = new AudioContext({latencyHint:'playback'});
    output = context.createGain(); output.gain.value = 0;
    output.connect(context.destination);
    context.addEventListener('statechange', onContextChange);
  }
  async function activate(token, resume, suspension) {
    try {
      await resume;
      if (suspension) await suspension.catch(() => {});
      if (destroyed || token !== generation || hidden()) return;
      // A preceding background suspension can finish after the click's resume.
      if (context.state !== 'running') await context.resume();
      if (destroyed || token !== generation || hidden()) return;
      if (context.state !== 'running') throw new Error('Audio context is not running');
      score = createScore(context, output, view);
      output.gain.cancelScheduledValues(context.currentTime);
      output.gain.setValueAtTime(0, context.currentTime);
      output.gain.linearRampToValueAtTime(targetGain(), context.currentTime + 0.09);
      render('playing');
    } catch {
      if (destroyed || token !== generation) return;
      silence(); render('blocked');
    }
  }
  function onToggle(event) {
    // Keyboard activation also generates a trusted click. Scripted .click()
    // cannot bypass opt-in, including hydration or persisted UI restoration.
    if (event.isTrusted === false || destroyed || !AudioContext || hidden()) return;
    if (state === 'playing' || state === 'starting') { pause(); return; }
    const token = ++generation;
    render('starting');
    try {
      ensureContext();
      const suspension = pendingSuspend;
      // The first resume happens synchronously within the user gesture.
      const resume = context.resume();
      void activate(token, resume, suspension);
    } catch { if (token === generation) { silence(); render('blocked'); } }
  }
  function onVolume() {
    volume = boundedVolume(slider.value, volume);
    slider.value = String(volume);
    slider.setAttribute('aria-valuetext', `${volume}%`);
    try { view.localStorage.setItem(VOLUME_KEY, String(volume)); } catch {}
    if (state === 'playing' && output && context) {
      output.gain.cancelScheduledValues(context.currentTime);
      output.gain.setTargetAtTime(targetGain(), context.currentTime, 0.035);
    }
  }
  function onVisibility() { if (hidden()) pause('hidden'); }
  function onPageHide() { pause('hidden'); }
  if (slider) {
    slider.min = '0'; slider.max = '100'; slider.step = '1'; slider.value = String(volume);
    slider.disabled = !AudioContext;
    slider.setAttribute('aria-valuetext', `${volume}%`);
    slider.addEventListener('input', onVolume);
  }
  button.addEventListener('click', onToggle);
  doc.addEventListener('visibilitychange', onVisibility);
  view.addEventListener('pagehide', onPageHide);
  render(AudioContext ? 'idle' : 'unavailable');
  const controller = {
    pause,
    get state() { return state; },
    get volume() { return volume; },
    destroy() {
      if (destroyed) return;
      pause(); destroyed = true;
      button.removeEventListener('click', onToggle);
      slider?.removeEventListener('input', onVolume);
      doc.removeEventListener('visibilitychange', onVisibility);
      view.removeEventListener('pagehide', onPageHide);
      context?.removeEventListener('statechange', onContextChange);
      try { Promise.resolve(context?.close()).catch(() => {}); } catch {}
      render('paused');
      if (slider) slider.disabled = true;
      mounts.delete(button);
    }
  };
  mounts.set(button, controller);
  return controller;
}
