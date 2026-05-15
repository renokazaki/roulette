// Web Audio API sound effects — no dependencies required
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function playSpin() {
  try {
    const c = getCtx()
    // Filtered noise burst that rises in pitch — mimics wheel start
    const bufLen = Math.floor(c.sampleRate * 1.8)
    const buf = c.createBuffer(1, bufLen, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1)

    const src = c.createBufferSource()
    src.buffer = buf

    const filter = c.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 2.5
    filter.frequency.setValueAtTime(300, c.currentTime)
    filter.frequency.exponentialRampToValueAtTime(2400, c.currentTime + 1.6)

    const gain = c.createGain()
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(0.35, c.currentTime + 0.08)
    gain.gain.setValueAtTime(0.35, c.currentTime + 1.2)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.8)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(c.destination)
    src.start()
    src.stop(c.currentTime + 1.8)
  } catch { /* ignore if AudioContext blocked */ }
}

export function playTick() {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'square'
    osc.frequency.value = 900 + Math.random() * 400
    gain.gain.setValueAtTime(0.12, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.045)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start()
    osc.stop(c.currentTime + 0.05)
  } catch { /* ignore */ }
}

export function playWin() {
  try {
    const c = getCtx()
    // Coin cascade: 4-note rising arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const t = c.currentTime + i * 0.11
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02)
      gain.gain.setValueAtTime(0.22, t + 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.55)

      // Coin "metallic" overtone
      const osc2 = c.createOscillator()
      const gain2 = c.createGain()
      osc2.type = 'triangle'
      osc2.frequency.value = freq * 2.76
      gain2.gain.setValueAtTime(0, t)
      gain2.gain.linearRampToValueAtTime(0.07, t + 0.01)
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      osc2.connect(gain2)
      gain2.connect(c.destination)
      osc2.start(t)
      osc2.stop(t + 0.2)
    })
  } catch { /* ignore */ }
}

export function playLose() {
  try {
    const c = getCtx()
    // Low descending buzz
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(240, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(70, c.currentTime + 0.55)
    gain.gain.setValueAtTime(0.2, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start()
    osc.stop(c.currentTime + 0.65)
  } catch { /* ignore */ }
}
