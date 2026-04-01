const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

const dom = {
  body: document.body,
  dot: document.querySelector('.cursor-dot'),
  ring: document.querySelector('.cursor-ring'),
  orb: document.querySelector('.color-orb'),
  words: Array.from(document.querySelectorAll('.motion-word')),
  panels: Array.from(document.querySelectorAll('.panel')),
  videos: Array.from(document.querySelectorAll('video')),
  liquidVideo: document.querySelector('.liquid-bg'),
  liquidOverlay: document.querySelector('.liquid-overlay'),
  canvas: document.querySelector('.webgl-bg'),
  homeHeroFrame: document.querySelector('.home-hero-frame'),
  homeShowcaseFrame: document.querySelector('.home-showcase-frame'),
  homeSignals: Array.from(document.querySelectorAll('.home-signal')),
  signalOutput: document.querySelector('[data-signal-output]'),
  homeVerbChips: Array.from(document.querySelectorAll('.home-verb-chip')),
  verbOutput: document.querySelector('[data-verb-output]'),
  backgroundAudio: document.querySelector('.site-audio')
};

const interaction = {
  mouseX: window.innerWidth * 0.5,
  mouseY: window.innerHeight * 0.5,
  ringX: window.innerWidth * 0.5,
  ringY: window.innerHeight * 0.5,
  orbX: window.innerWidth * 0.5,
  orbY: window.innerHeight * 0.5,
  orbEnergy: 0
};

const backgroundStateClasses = ['has-video', 'no-video', 'reduced-motion'];
const audioSessionStateKey = 'pulse-atelier-audio-state';
const panelMotionConfig = {
  calm: { ease: 'power2.out', frameY: 42, parallax: -4, scrub: 1.2, wordShiftY: -5, wordShiftX: 0 },
  expressive: { ease: 'power3.out', frameY: 56, parallax: -8, scrub: 0.9, wordShiftY: -10, wordShiftX: 2.5 },
  final: { frameY: 28, parallax: -3, scrub: 1.05, wordShiftY: -5, wordShiftX: 0 }
};

function prefersReducedMotion() {
  return motionPreference.matches;
}

function hasFinePointer() {
  return finePointerQuery.matches;
}

function setBackgroundState(nextState) {
  dom.body.classList.remove(...backgroundStateClasses);

  if (nextState) {
    dom.body.classList.add(nextState);
  }
}

function initSceneVideos() {
  if (!dom.videos.length) {
    return;
  }

  const safePlay = (video) => {
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  dom.videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');

    if (prefersReducedMotion()) {
      video.pause();
      return;
    }

    video.addEventListener('canplay', () => safePlay(video), { once: true });
    video.addEventListener('loadeddata', () => safePlay(video), { once: true });
    safePlay(video);
  });

  document.addEventListener('visibilitychange', () => {
    dom.videos.forEach((video) => {
      if (document.hidden || prefersReducedMotion()) {
        video.pause();
        return;
      }

      safePlay(video);
    });
  });
}

function splitHeadingLines() {
  document.querySelectorAll('.motion-heading').forEach((heading) => {
    if (heading.classList.contains('motion-heading-single')) {
      return;
    }

    const text = heading.textContent.trim();
    if (!text) {
      return;
    }

    heading.innerHTML = text
      .split(/\s+/)
      .map((word) => `<span class="heading-line"><span>${word}</span></span>`)
      .join(' ');
  });
}

function revealStaticMotionState() {
  document.querySelectorAll('.motion-word, .motion-fade, .heading-line > span, .motion-heading-single').forEach((element) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
}

function getPanelParts(panel) {
  return {
    frame: panel.querySelector('.frame'),
    notes: panel.querySelectorAll('.motion-fade'),
    words: panel.querySelectorAll('.motion-word'),
    lines: panel.querySelectorAll('.heading-line > span'),
    singleHeading: panel.querySelector('.motion-heading-single')
  };
}

function getPanelConfig(panel) {
  const toneKey = panel.dataset.tone === 'expressive' ? 'expressive' : 'calm';
  const baseConfig = panelMotionConfig[toneKey];

  if (panel.querySelector('.frame-grid-final')) {
    return { ...baseConfig, ...panelMotionConfig.final };
  }

  return baseConfig;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readAudioSessionState() {
  try {
    return JSON.parse(window.sessionStorage.getItem(audioSessionStateKey) || '{}');
  } catch {
    return {};
  }
}

function writeAudioSessionState(nextState) {
  try {
    window.sessionStorage.setItem(audioSessionStateKey, JSON.stringify(nextState));
  } catch {}
}

function initBackgroundAudio() {
  const audio = dom.backgroundAudio;

  if (!audio) {
    return;
  }

  const storedState = readAudioSessionState();
  const requestedVolume = Number.parseFloat(audio.dataset.volume || '0.08');
  const targetVolume = Number.isFinite(requestedVolume) ? clamp(requestedVolume, 0, 1) : 0.08;
  const interactionEvents = ['pointerdown', 'touchstart', 'keydown', 'wheel'];

  audio.volume = targetVolume;
  audio.loop = true;

  const persistAudioState = () => {
    writeAudioSessionState({
      time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      shouldPlay: !audio.paused
    });
  };

  const restorePlaybackPosition = () => {
    const savedTime = Number.parseFloat(storedState.time);

    if (!Number.isFinite(savedTime) || savedTime <= 0) {
      return;
    }

    try {
      audio.currentTime = savedTime;
    } catch {}
  };

  const removeInteractionListeners = () => {
    interactionEvents.forEach((eventName) => {
      window.removeEventListener(eventName, resumeAudioPlayback);
    });
  };

  function resumeAudioPlayback() {
    const playPromise = audio.play();

    if (!playPromise || typeof playPromise.then !== 'function') {
      removeInteractionListeners();
      persistAudioState();
      return;
    }

    playPromise
      .then(() => {
        removeInteractionListeners();
        persistAudioState();
      })
      .catch(() => {});
  }

  const addInteractionListeners = () => {
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, resumeAudioPlayback, { passive: true });
    });
  };

  if (audio.readyState >= 1) {
    restorePlaybackPosition();
  } else {
    audio.addEventListener('loadedmetadata', restorePlaybackPosition, { once: true });
  }

  audio.addEventListener('playing', persistAudioState);
  audio.addEventListener('pause', persistAudioState);
  audio.addEventListener('timeupdate', persistAudioState);
  window.addEventListener('pagehide', persistAudioState);

  addInteractionListeners();
  resumeAudioPlayback();
}

function bindInteractiveCopy(items, output, container, colorVariableName) {
  if (!items.length || !output || !container) {
    return;
  }

  const activateItem = (item) => {
    items.forEach((button) => {
      const isActive = button === item;

      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    output.textContent = item.dataset.copy || '';

    const tone = item.getAttribute('data-color');
    if (tone) {
      container.style.setProperty(colorVariableName, tone);
    }
  };

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => activateItem(item));
    item.addEventListener('focus', () => activateItem(item));
    item.addEventListener('click', () => activateItem(item));
  });

  activateItem(items.find((item) => item.classList.contains('is-active')) || items[0]);
}

function initEditorialInteractions() {
  bindInteractiveCopy(dom.homeSignals, dom.signalOutput, dom.homeHeroFrame, '--hero-accent');
  bindInteractiveCopy(dom.homeVerbChips, dom.verbOutput, dom.homeShowcaseFrame, '--showcase-accent');

  const resetHeroPointer = () => {
    if (!dom.homeHeroFrame) {
      return;
    }

    dom.homeHeroFrame.style.setProperty('--hero-shift-x', '0px');
    dom.homeHeroFrame.style.setProperty('--hero-shift-y', '0px');
    dom.homeHeroFrame.style.setProperty('--hero-spot-x', '52%');
    dom.homeHeroFrame.style.setProperty('--hero-spot-y', '38%');
  };

  const resetShowcasePointer = () => {
    if (!dom.homeShowcaseFrame) {
      return;
    }

    dom.homeShowcaseFrame.style.setProperty('--showcase-spot-x', '52%');
    dom.homeShowcaseFrame.style.setProperty('--showcase-spot-y', '50%');
  };

  if (!prefersReducedMotion() && hasFinePointer()) {
    if (dom.homeHeroFrame) {
      dom.homeHeroFrame.addEventListener('pointermove', (event) => {
        const rect = dom.homeHeroFrame.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);

        dom.homeHeroFrame.style.setProperty('--hero-shift-x', `${((x - 0.5) * 52).toFixed(2)}px`);
        dom.homeHeroFrame.style.setProperty('--hero-shift-y', `${((y - 0.5) * 38).toFixed(2)}px`);
        dom.homeHeroFrame.style.setProperty('--hero-spot-x', `${(x * 100).toFixed(1)}%`);
        dom.homeHeroFrame.style.setProperty('--hero-spot-y', `${(y * 100).toFixed(1)}%`);
      }, { passive: true });

      dom.homeHeroFrame.addEventListener('pointerleave', resetHeroPointer);
    }

    if (dom.homeShowcaseFrame) {
      dom.homeShowcaseFrame.addEventListener('pointermove', (event) => {
        const rect = dom.homeShowcaseFrame.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);

        dom.homeShowcaseFrame.style.setProperty('--showcase-spot-x', `${(x * 100).toFixed(1)}%`);
        dom.homeShowcaseFrame.style.setProperty('--showcase-spot-y', `${(y * 100).toFixed(1)}%`);
      }, { passive: true });

      dom.homeShowcaseFrame.addEventListener('pointerleave', resetShowcasePointer);
    }
  } else {
    resetHeroPointer();
    resetShowcasePointer();
  }

  const updateHeroProgress = () => {
    if (!dom.homeHeroFrame) {
      return;
    }

    const heroPanel = dom.homeHeroFrame.closest('.panel') || dom.homeHeroFrame;
    const rect = heroPanel.getBoundingClientRect();
    const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);

    dom.homeHeroFrame.style.setProperty('--hero-progress', progress.toFixed(3));
  };

  updateHeroProgress();

  window.addEventListener('scroll', updateHeroProgress, { passive: true });
  window.addEventListener('resize', updateHeroProgress, { passive: true });
}

function initCursorSystem() {
  if (prefersReducedMotion() || !hasFinePointer() || !dom.dot || !dom.ring || !dom.orb) {
    return;
  }

  const updatePointerPosition = (event) => {
    interaction.mouseX = event.clientX;
    interaction.mouseY = event.clientY;

    dom.dot.style.left = `${interaction.mouseX}px`;
    dom.dot.style.top = `${interaction.mouseY}px`;
  };

  const animateCursor = () => {
    interaction.ringX += (interaction.mouseX - interaction.ringX) * 0.16;
    interaction.ringY += (interaction.mouseY - interaction.ringY) * 0.16;
    interaction.orbX += (interaction.mouseX - interaction.orbX) * 0.08;
    interaction.orbY += (interaction.mouseY - interaction.orbY) * 0.08;

    dom.ring.style.left = `${interaction.ringX}px`;
    dom.ring.style.top = `${interaction.ringY}px`;
    dom.orb.style.left = `${interaction.orbX}px`;
    dom.orb.style.top = `${interaction.orbY}px`;

    interaction.orbEnergy += (0 - interaction.orbEnergy) * 0.06;

    requestAnimationFrame(animateCursor);
  };

  const setWordHoverState = (element, isActive) => {
    const tone = element.getAttribute('data-color') || '#ff8a4c';

    document.documentElement.style.setProperty('--orb-color', tone);
    interaction.orbEnergy = isActive ? 1 : 0.45;
    dom.ring.classList.toggle('active', isActive);

    if (!window.gsap) {
      return;
    }

    window.gsap.to(dom.orb, {
      opacity: isActive ? 0.42 : 0.24,
      scale: isActive ? 1.18 : 1,
      duration: isActive ? 0.45 : 0.5,
      ease: isActive ? 'power3.out' : 'power2.out'
    });

    window.gsap.to(element, {
      duration: isActive ? 0.45 : 0.4,
      ease: isActive ? 'power3.out' : 'power2.out',
      y: isActive ? -8 : 0,
      textShadow: isActive ? `0 0 26px ${tone}` : '0 0 0 transparent'
    });
  };

  window.addEventListener('pointermove', updatePointerPosition, { passive: true });

  dom.words.forEach((element) => {
    element.addEventListener('mouseenter', () => setWordHoverState(element, true));
    element.addEventListener('mouseleave', () => setWordHoverState(element, false));
  });

  animateCursor();
}

function initGsapMotion() {
  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion()) {
    revealStaticMotionState();
    return;
  }

  const { gsap, ScrollTrigger } = window;

  gsap.registerPlugin(ScrollTrigger);

  const initialPanel = dom.panels[0];
  if (initialPanel) {
    const { lines, singleHeading, notes, words } = getPanelParts(initialPanel);
    const introTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (lines.length) {
      introTimeline.to(lines, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.08
      });
    } else if (singleHeading) {
      introTimeline.to(singleHeading, {
        y: 0,
        opacity: 1,
        duration: 1
      });
    }

    if (notes.length) {
      introTimeline.to(notes, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.06
      }, '-=0.7');
    }

    if (words.length) {
      introTimeline.to(words, {
        y: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.08
      }, '-=0.6');
    }
  }

  dom.panels.forEach((panel, index) => {
    const { frame, notes, words, lines, singleHeading } = getPanelParts(panel);
    const config = getPanelConfig(panel);

    if (index > 0 && frame) {
      const entranceTimeline = gsap.timeline({
        defaults: { ease: config.ease },
        scrollTrigger: {
          trigger: panel,
          start: 'top 74%',
          toggleActions: 'play none none reverse'
        }
      });

      entranceTimeline.fromTo(
        frame,
        { y: config.frameY, opacity: 0, scale: config.ease === 'power3.out' ? 0.985 : 1 },
        { y: 0, opacity: 1, scale: 1, duration: config.ease === 'power3.out' ? 1.05 : 1.25 }
      );

      if (lines.length) {
        entranceTimeline.to(lines, {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.06
        }, '-=0.72');
      } else if (singleHeading) {
        entranceTimeline.to(singleHeading, {
          y: 0,
          opacity: 1,
          duration: 0.9
        }, '-=0.72');
      }

      if (notes.length) {
        entranceTimeline.to(notes, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.06
        }, '-=0.62');
      }

      if (words.length) {
        entranceTimeline.to(words, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08
        }, '-=0.58');
      }
    }

    if (frame) {
      gsap.to(frame, {
        yPercent: config.parallax,
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'bottom top',
          scrub: config.scrub
        }
      });
    }

    if (words.length) {
      gsap.to(words, {
        yPercent: config.wordShiftY,
        xPercent: config.wordShiftX,
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'bottom top',
          scrub: config.scrub + 0.25
        }
      });
    }
  });

  if (dom.liquidOverlay) {
    gsap.to(dom.liquidOverlay, {
      opacity: 0.82,
      scrollTrigger: {
        trigger: dom.panels.length ? 'main' : document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.4
      }
    });
  }

  ScrollTrigger.refresh();
}

let webglInitialized = false;

function initWebGLBackground() {
  if (webglInitialized || !dom.canvas) {
    return;
  }

  webglInitialized = true;

  const gl = dom.canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance'
  });

  if (!gl) {
    return;
  }

  const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_scroll;
    uniform float u_energy;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);

      float a = hash(i + vec2(0.0, 0.0));
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;

      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }

      return v;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      vec2 m = (u_mouse / u_resolution - 0.5) * 2.0;
      float t = u_time * 0.18;

      vec2 drift = uv * 1.9 + vec2(t * 0.52, -t * 0.34) + m * 0.18;
      float n = fbm(drift);
      float n2 = fbm(drift * 1.7 + vec2(-t * 0.26, t * 0.3));

      float bands = sin((uv.x + n * 0.36 + t) * 4.8) + cos((uv.y - n2 * 0.28 - t * 0.52) * 4.5);
      float energy = smoothstep(0.12, 1.2, n + bands * 0.12 + u_scroll * 0.2 + u_energy * 0.45);

      vec3 base = vec3(0.03, 0.05, 0.09);
      vec3 warm = vec3(0.92, 0.36, 0.22);
      vec3 cool = vec3(0.24, 0.55, 0.93);

      vec3 color = mix(base, warm, smoothstep(0.08, 0.9, n));
      color = mix(color, cool, smoothstep(0.2, 1.0, n2 + bands * 0.08));
      color += energy * (0.06 + u_energy * 0.05);

      float vignette = smoothstep(1.35, 0.25, length(uv));
      color *= vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    return;
  }

  const program = gl.createProgram();
  if (!program) {
    return;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return;
  }

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1
    ]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
  const scrollLocation = gl.getUniformLocation(program, 'u_scroll');
  const energyLocation = gl.getUniformLocation(program, 'u_energy');

  let needsResize = true;

  const markForResize = () => {
    needsResize = true;
  };

  const resizeCanvas = () => {
    if (!needsResize) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.floor(window.innerWidth * dpr);
    const height = Math.floor(window.innerHeight * dpr);

    if (dom.canvas.width !== width || dom.canvas.height !== height) {
      dom.canvas.width = width;
      dom.canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    needsResize = false;
  };

  window.addEventListener('resize', markForResize, { passive: true });
  resizeCanvas();

  const startTime = performance.now();

  function drawFrame(now) {
    if (document.hidden) {
      requestAnimationFrame(drawFrame);
      return;
    }

    resizeCanvas();

    const elapsed = prefersReducedMotion() ? 0 : (now - startTime) * 0.001;
    const scrollMax = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scrollProgress = window.scrollY / scrollMax;

    gl.uniform2f(resolutionLocation, dom.canvas.width, dom.canvas.height);
    gl.uniform1f(timeLocation, elapsed);
    gl.uniform2f(
      mouseLocation,
      interaction.mouseX * (dom.canvas.width / window.innerWidth),
      interaction.mouseY * (dom.canvas.height / window.innerHeight)
    );
    gl.uniform1f(scrollLocation, scrollProgress);
    gl.uniform1f(energyLocation, interaction.orbEnergy);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(drawFrame);
  }

  requestAnimationFrame(drawFrame);
}

function initVideoBackground() {
  const { liquidVideo } = dom;

  if (!liquidVideo) {
    setBackgroundState('no-video');
    initWebGLBackground();
    return;
  }

  if (prefersReducedMotion()) {
    setBackgroundState('reduced-motion');
    liquidVideo.pause();
    return;
  }

  liquidVideo.muted = true;
  liquidVideo.defaultMuted = true;
  liquidVideo.playsInline = true;
  liquidVideo.setAttribute('muted', '');
  liquidVideo.setAttribute('playsinline', '');

  let settled = false;

  const settleVideoState = (state, onSettle) => {
    if (settled) {
      return;
    }

    settled = true;
    setBackgroundState(state);

    if (typeof onSettle === 'function') {
      onSettle();
    }
  };

  const requestPlayback = () => {
    const playPromise = liquidVideo.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  const fallbackTimer = window.setTimeout(() => {
    settleVideoState('no-video', initWebGLBackground);
  }, 4000);

  const clearFallbackTimer = () => {
    window.clearTimeout(fallbackTimer);
  };

  liquidVideo.addEventListener('playing', () => {
    clearFallbackTimer();
    settleVideoState('has-video');
  }, { once: true });

  liquidVideo.addEventListener('error', () => {
    clearFallbackTimer();
    settleVideoState('no-video', initWebGLBackground);
  }, { once: true });

  liquidVideo.addEventListener('canplay', requestPlayback, { once: true });
  liquidVideo.addEventListener('loadeddata', requestPlayback, { once: true });

  requestPlayback();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      liquidVideo.pause();
      return;
    }

    if (!settled || dom.body.classList.contains('has-video')) {
      requestPlayback();
    }
  });
}

splitHeadingLines();
initBackgroundAudio();
initVideoBackground();
initSceneVideos();
initCursorSystem();
initEditorialInteractions();
initGsapMotion();
