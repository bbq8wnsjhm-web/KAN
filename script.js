const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
const orb = document.querySelector('.color-orb');
const words = document.querySelectorAll('.motion-word');
const panels = document.querySelectorAll('.panel');
const liquidVideo = document.querySelector('.liquid-bg');

let mouseX = window.innerWidth * 0.5;
let mouseY = window.innerHeight * 0.5;
let ringX = mouseX;
let ringY = mouseY;
let orbX = mouseX;
let orbY = mouseY;
let orbEnergy = 0;

function splitHeadingLines() {
  document.querySelectorAll('.motion-heading').forEach((heading) => {
    if (heading.classList.contains('motion-heading-single')) {
      return;
    }

    const text = heading.textContent.trim();
    if (!text) return;

    const wordsList = text.split(/\s+/);
    heading.innerHTML = wordsList
      .map((word) => `<span class="heading-line"><span>${word}</span></span>`)
      .join(' ');
  });
}

splitHeadingLines();

function initCursorSystem() {
  if (!dot || !ring || !orb) return;

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;

    orbX += (mouseX - orbX) * 0.08;
    orbY += (mouseY - orbY) * 0.08;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    orb.style.left = `${orbX}px`;
    orb.style.top = `${orbY}px`;

    orbEnergy += (0 - orbEnergy) * 0.06;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  words.forEach((element) => {
    element.addEventListener('mouseenter', () => {
      ring.classList.add('active');
      const tone = element.getAttribute('data-color') || '#ff8a4c';
      document.documentElement.style.setProperty('--orb-color', tone);
      orbEnergy = 1;

      if (window.gsap) {
        gsap.to(orb, { opacity: 0.42, scale: 1.18, duration: 0.45, ease: 'power3.out' });
        gsap.to(element, {
          duration: 0.45,
          ease: 'power3.out',
          y: -8,
          textShadow: `0 0 26px ${tone}`
        });
      }
    });

    element.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
      orbEnergy = 0.45;

      if (window.gsap) {
        gsap.to(orb, { opacity: 0.24, scale: 1, duration: 0.5, ease: 'power2.out' });
        gsap.to(element, { duration: 0.4, y: 0, textShadow: '0 0 0 transparent', ease: 'power2.out' });
      }
    });
  });
}

if (!prefersReducedMotion) {
  initCursorSystem();
}

function initGsapMotion() {
  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) {
    document.querySelectorAll('.motion-word, .motion-fade, .heading-line > span').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.motion-heading-single').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const initialPanel = panels[0];
  if (initialPanel) {
    const initialLines = initialPanel.querySelectorAll('.heading-line > span');
    const initialSingleHeading = initialPanel.querySelector('.motion-heading-single');
    const initialNote = initialPanel.querySelector('.motion-fade');
    const initialWords = initialPanel.querySelectorAll('.motion-word');
    const initialTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (initialLines.length) {
      initialTimeline.to(initialLines, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.08
      });
    } else if (initialSingleHeading) {
      initialTimeline.to(initialSingleHeading, {
        y: 0,
        opacity: 1,
        duration: 1
      });
    }

    if (initialNote) {
      initialTimeline.to(initialNote, {
        y: 0,
        opacity: 1,
        duration: 0.9
      }, '-=0.7');
    }

    if (initialWords.length) {
      initialTimeline.to(initialWords, {
        y: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.08
      }, '-=0.6');
    }
  }

  const sectionSettings = [
    { tone: 'calm', frameY: 42, wordY: 24, parallax: -4, scrub: 1.2 },
    { tone: 'expressive', frameY: 56, wordY: 34, parallax: -8, scrub: 0.9 },
    { tone: 'expressive', frameY: 28, wordY: 14, parallax: -3, scrub: 1.05 }
  ];

  panels.forEach((panel, index) => {
    const frame = panel.querySelector('.frame');
    const note = panel.querySelector('.motion-fade');
    const panelWords = panel.querySelectorAll('.motion-word');
    const lines = panel.querySelectorAll('.heading-line > span');
    const singleHeading = panel.querySelector('.motion-heading-single');
    const cfg = sectionSettings[index] || sectionSettings[0];

    if (index > 0) {
      const tl = gsap.timeline({
        defaults: { ease: cfg.tone === 'expressive' ? 'power3.out' : 'power2.out' },
        scrollTrigger: {
          trigger: panel,
          start: 'top 74%',
          toggleActions: 'play none none reverse'
        }
      });

      tl.fromTo(frame,
        { y: cfg.frameY, opacity: 0, scale: cfg.tone === 'expressive' ? 0.985 : 1 },
        { y: 0, opacity: 1, scale: 1, duration: cfg.tone === 'expressive' ? 1.05 : 1.25 }
      );

      if (lines.length) {
        tl.to(lines, {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.06
        }, '-=0.72');
      }

      if (!lines.length && singleHeading) {
        tl.to(singleHeading, {
          y: 0,
          opacity: 1,
          duration: 0.9
        }, '-=0.72');
      }

      if (note) {
        tl.to(note, { y: 0, opacity: 1, duration: 0.8 }, '-=0.62');
      }

      if (panelWords.length) {
        tl.to(panelWords, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, '-=0.58');
      }
    }

    if (frame) {
      gsap.to(frame, {
        yPercent: cfg.parallax,
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'bottom top',
          scrub: cfg.scrub
        }
      });
    }

    if (panelWords.length) {
      gsap.to(panelWords, {
        yPercent: cfg.tone === 'expressive' ? -10 : -5,
        xPercent: cfg.tone === 'expressive' ? 2.5 : 0,
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'bottom top',
          scrub: cfg.scrub + 0.25
        }
      });
    }
  });

  gsap.to('.liquid-overlay', {
    opacity: 0.82,
    scrollTrigger: {
      trigger: 'main',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.4
    }
  });

  ScrollTrigger.refresh();
}

initGsapMotion();

let webglInitialized = false;

function initWebGLBackground() {
  if (webglInitialized) return;
  webglInitialized = true;

  const canvas = document.querySelector('.webgl-bg');
  const gl = canvas?.getContext('webgl', {
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance'
  });

  if (!gl) return;

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
    if (!shader) return null;

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

  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  if (!program) return;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

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

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.floor(window.innerWidth * dpr);
    const height = Math.floor(window.innerHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  window.addEventListener('resize', resize);
  resize();

  const start = performance.now();

  function drawFrame(now) {
    resize();

    const elapsed = prefersReducedMotion ? 0 : (now - start) * 0.001;
    const doc = document.documentElement;
    const scrollMax = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const scrollNorm = window.scrollY / scrollMax;

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, elapsed);
    gl.uniform2f(
      mouseLocation,
      mouseX * (canvas.width / window.innerWidth),
      mouseY * (canvas.height / window.innerHeight)
    );
    gl.uniform1f(scrollLocation, scrollNorm);
    gl.uniform1f(energyLocation, orbEnergy);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(drawFrame);
  }

  requestAnimationFrame(drawFrame);
}

function initVideoBackground() {
  if (!liquidVideo) {
    document.body.classList.add('no-video');
    initWebGLBackground();
    return;
  }

  liquidVideo.muted = true;
  liquidVideo.playsInline = true;
  liquidVideo.defaultMuted = true;
  liquidVideo.setAttribute('muted', '');
  liquidVideo.setAttribute('playsinline', '');

  let fallbackActivated = false;
  let videoActivated = false;

  const clearVideoState = () => {
    document.body.classList.remove('has-video', 'no-video');
  };

  const activateFallback = () => {
    if (fallbackActivated || videoActivated) return;
    fallbackActivated = true;
    clearVideoState();
    document.body.classList.add('no-video');
    initWebGLBackground();
  };

  const activateVideo = () => {
    if (videoActivated || fallbackActivated) return;
    videoActivated = true;
    clearVideoState();
    document.body.classList.add('has-video');
  };

  const tryPlay = () => {
    const playPromise = liquidVideo.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        if (liquidVideo.readyState >= 2 && !liquidVideo.paused) {
          activateVideo();
        }
      }).catch(() => {});
      return;
    }

    if (liquidVideo.readyState >= 2) {
      activateVideo();
    }
  };

  liquidVideo.addEventListener('error', activateFallback, { once: true });
  liquidVideo.addEventListener('playing', activateVideo, { once: true });
  liquidVideo.addEventListener('canplay', tryPlay, { once: true });
  liquidVideo.addEventListener('loadeddata', tryPlay, { once: true });

  if (prefersReducedMotion) {
    activateVideo();
    liquidVideo.pause();
    return;
  }

  const fallbackTimer = window.setTimeout(() => {
    if (!videoActivated) {
      activateFallback();
    }
  }, 4000);

  const clearFallbackTimer = () => {
    window.clearTimeout(fallbackTimer);
  };

  liquidVideo.addEventListener('playing', clearFallbackTimer, { once: true });
  liquidVideo.addEventListener('error', clearFallbackTimer, { once: true });

  tryPlay();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      liquidVideo.pause();
      return;
    }

    if (prefersReducedMotion || fallbackActivated) return;

    liquidVideo.play().catch(() => {
      if (!videoActivated) {
        activateFallback();
      }
    });
  });
}

initVideoBackground();
