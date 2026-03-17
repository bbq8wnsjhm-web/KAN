const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
const hoverTargets = document.querySelectorAll('a, button, .tilt, [data-magnetic]');

let mouseX = window.innerWidth * 0.5;
let mouseY = window.innerHeight * 0.5;
let ringX = mouseX;
let ringY = mouseY;

window.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  if (dot) {
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.16;
  ringY += (mouseY - ringY) * 0.16;

  if (ring) {
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
  }

  requestAnimationFrame(animateRing);
}

animateRing();

hoverTargets.forEach((element) => {
  element.addEventListener('mouseenter', () => ring?.classList.add('active'));
  element.addEventListener('mouseleave', () => ring?.classList.remove('active'));
});

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

reveals.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 80, 180)}ms`;
  revealObserver.observe(item);
});

document.querySelectorAll('.tilt').forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = (0.5 - (y / rect.height)) * 12;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  });
});

document.querySelectorAll('[data-magnetic]').forEach((target) => {
  target.addEventListener('mousemove', (event) => {
    const rect = target.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    target.style.transform = `translate(${offsetX * 0.12}px, ${offsetY * 0.12}px)`;
  });

  target.addEventListener('mouseleave', () => {
    target.style.transform = 'translate(0, 0)';
  });
});

const canvas = document.querySelector('.webgl-bg');
const gl = canvas?.getContext('webgl', {
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance'
});

if (gl) {
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
      float t = u_time * 0.22;

      vec2 flow = uv * 2.2 + vec2(t * 0.7, -t * 0.45) + m * 0.45;
      float n = fbm(flow);
      float n2 = fbm(flow * 1.8 + vec2(-t * 0.3, t * 0.4));

      float bands = sin((uv.x + n * 0.45 + t) * 5.5) + cos((uv.y - n2 * 0.35 - t * 0.7) * 5.0);
      float energy = smoothstep(0.15, 1.1, n + bands * 0.14 + u_scroll * 0.25);

      vec3 base = vec3(0.04, 0.06, 0.10);
      vec3 warm = vec3(0.98, 0.34, 0.19);
      vec3 cool = vec3(0.16, 0.52, 0.96);

      vec3 color = mix(base, warm, smoothstep(0.08, 0.95, n));
      color = mix(color, cool, smoothstep(0.2, 1.05, n2 + bands * 0.1));
      color += energy * 0.09;

      float vignette = smoothstep(1.4, 0.25, length(uv));
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

  if (vertexShader && fragmentShader) {
    const program = gl.createProgram();
    if (program) {
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1
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

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

          const elapsed = prefersReduced ? 0 : (now - start) * 0.001;
          const doc = document.documentElement;
          const scrollMax = Math.max(doc.scrollHeight - window.innerHeight, 1);
          const scrollNorm = window.scrollY / scrollMax;

          gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
          gl.uniform1f(timeLocation, elapsed);
          gl.uniform2f(mouseLocation, mouseX * (canvas.width / window.innerWidth), mouseY * (canvas.height / window.innerHeight));
          gl.uniform1f(scrollLocation, scrollNorm);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
          requestAnimationFrame(drawFrame);
        }

        requestAnimationFrame(drawFrame);
      }
    }
  }
}