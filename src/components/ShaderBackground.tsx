import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;

  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    float wave1 = sin(p.x * 3.0 + u_time * 0.4) * 0.15;
    float wave2 = sin(p.x * 5.0 - u_time * 0.3 + 1.5) * 0.08;
    float wave3 = sin(p.x * 2.0 + u_time * 0.25 + 3.0) * 0.12;

    float dist1 = abs(p.y - wave1);
    float dist2 = abs(p.y - wave2 - 0.1);
    float dist3 = abs(p.y - wave3 + 0.15);

    float glow1 = 0.006 / (dist1 + 0.01);
    float glow2 = 0.004 / (dist2 + 0.01);
    float glow3 = 0.005 / (dist3 + 0.01);

    float hue1 = fract(u_time * 0.05 + uv.x * 0.4);
    float hue2 = fract(u_time * 0.05 + uv.x * 0.4 + 0.33);
    float hue3 = fract(u_time * 0.05 + uv.x * 0.4 + 0.66);

    vec3 col1 = hsl2rgb(hue1, 0.7, 0.5) * glow1;
    vec3 col2 = hsl2rgb(hue2, 0.7, 0.5) * glow2;
    vec3 col3 = hsl2rgb(hue3, 0.7, 0.5) * glow3;

    vec3 color = (col1 + col2 + col3) * 0.35;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const render = () => {
      t += 0.016;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};

export default ShaderBackground;
