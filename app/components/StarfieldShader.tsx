"use client";

import { useEffect, useRef } from "react";

export default function StarfieldShader(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // Handle resize
    const resizeCanvas = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Create shader program
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(
      vertexShader,
      `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `,
    );
    gl.compileShader(vertexShader);

    // Fragment shader from starfield.glsl
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(
      fragmentShader,
      `
      precision highp float;
      varying vec2 vUv;
      uniform float iTime;
      uniform vec2 iResolution;
      
      // divisions of grid
      const float repeats = 30.;
      
      // number of layers
      const float layers = 21.;
      
      // star colors
      const vec3 white = vec3(1.0); // Set star color to pure white
      
      float N21(vec2 p) {
        p = fract(p * vec2(233.34, 851.73));
        p += dot(p, p + 23.45);
        return fract(p.x * p.y);
      }
      
      vec2 N22(vec2 p) {
        float n = N21(p);
        return vec2(n, N21(p + n));
      }
      
      mat2 scale(vec2 _scale) {
        return mat2(_scale.x, 0.0,
            0.0, _scale.y);
      }
      
      // 2D Noise based on Morgan McGuire
      float noise(in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
      
        // Four corners in 2D of a tile
        float a = N21(i);
        float b = N21(i + vec2(1.0, 0.0));
        float c = N21(i + vec2(0.0, 1.0));
        float d = N21(i + vec2(1.0, 1.0));
      
        // Smooth Interpolation
        vec2 u = f * f * (3.0 - 2.0 * f); // Cubic Hermite Curve
      
        // Mix 4 corners percentages
        return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
      }
      
      vec3 stars(vec2 uv, float offset) {
        float timeScale = -(iTime / 12.0 + offset) / layers;
        float trans = fract(timeScale);
        float newRnd = floor(timeScale);
        vec3 col = vec3(0.0);
        
        // Only render stars when they're in the closer part of their cycle
        // Show only the closest 50% of stars for a cleaner look
        if (trans < 0.5) {
          // Translate uv then scale for center
          uv -= vec2(0.5);
          uv = scale(vec2(trans)) * uv;
          uv += vec2(0.5);
        
          // Create square aspect ratio
          uv.x *= iResolution.x / iResolution.y;
        
          // Create boxes
          uv *= repeats;
        
          // Get position
          vec2 ipos = floor(uv);
        
          // Return uv as 0 to 1
          uv = fract(uv);
        
          // Calculate random xy and size
          vec2 rndXY = N22(newRnd + ipos * (offset + 1.0)) * 0.9 + 0.05;
          float rndSize = N21(ipos) * 100.0 + 200.0;
        
          vec2 j = (rndXY - uv) * rndSize;
          float sparkle = 1.0 / dot(j, j);
        
          // Set stars to be pure white with non-linear brightness curve
          // This curve gives more emphasis to brighter stars
          // Using a quadratic falloff for more pronounced bright stars
          float brightness = 1.0 - pow(trans / 0.5, 2.0) * 0.8;
          
          // Boost overall brightness by 40%
          brightness *= 1.4;
          
          col += white * sparkle * brightness;
        }
        
        return col;
      }
      
      void main() {
        // Normalized pixel coordinates (from 0 to 1)
        vec2 uv = vUv;
      
        vec3 col = vec3(0.0);
      
        for (float i = 0.0; i < layers; i++) {
          col += stars(uv, i);
        }
      
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    );
    gl.compileShader(fragmentShader);

    // Check for shader compilation errors
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error(
        "Vertex shader compilation error:",
        gl.getShaderInfoLog(vertexShader),
      );
      return;
    }

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(
        "Fragment shader compilation error:",
        gl.getShaderInfoLog(fragmentShader),
      );
      return;
    }

    // Link shaders to program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Create a quad that covers the entire viewport
    const vertices = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Set up attribute
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set up uniforms
    const timeLocation = gl.getUniformLocation(program, "iTime");
    const resolutionLocation = gl.getUniformLocation(program, "iResolution");

    // Rendering loop
    const startTime = Date.now();
    let animationFrameId: number;

    const render = (): void => {
      const currentTime = (Date.now() - startTime) / 1000;
      gl.uniform1f(timeLocation, currentTime);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] bg-black pointer-events-none"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
