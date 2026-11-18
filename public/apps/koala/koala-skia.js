// The koala on Koala's page, drawn live with Skia, as in the app.
//
// The drawing is the app's own (`src/components/koala-art.tsx` in the Koala repository):
// the same paths, gradients and blurs on the same 512 × 512 artboard, run here by
// CanvasKit, Skia's web build. Only the grown-up koala in fur with a white belt is drawn.
//
// It blinks, its eyes follow the pointer, it shuts its eyes while the page says it is
// asleep (`.asleep` on `.koala`, from the page's clock), and it smiles with its ears up
// when it jumps. The breathing, the droop and the jump stay in the page's CSS.
// The picture under the canvas stays until the first frame is drawn, so nothing is lost
// if CanvasKit can't load.
(() => {
  const koala = document.querySelector(".koala");
  const canvas = koala?.querySelector("canvas");
  if (!koala || !canvas || !window.WebAssembly) return;

  const CANVASKIT = "https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.40.0/bin/";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const script = document.createElement("script");
  script.src = `${CANVASKIT}canvaskit.js`;
  script.onload = () =>
    window.CanvasKitInit({ locateFile: (file) => CANVASKIT + file }).then(start, () => {});
  // Load after the page, so it never holds up the text or the screenshots.
  if (document.readyState === "complete") document.head.append(script);
  else addEventListener("load", () => document.head.append(script));

  function start(CK) {
    const dpr = Math.min(3, devicePixelRatio || 1);
    const size = koala.clientWidth;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    const surface = CK.MakeWebGLCanvasSurface(canvas) ?? CK.MakeSWCanvasSurface(canvas);
    if (!surface) return;

    // ---- The drawing, as in koala-art.tsx ----

    const svg = (d) => CK.Path.MakeFromSVGString(d);
    const oval = (cx, cy, rx, ry) => {
      const path = new CK.Path();
      path.addOval(CK.XYWHRect(cx - rx, cy - ry, rx * 2, ry * 2));
      return path;
    };
    const color = (hex) => {
      const n = (at) => parseInt(hex.slice(at, at + 2), 16) / 255;
      return CK.Color4f(n(1), n(3), n(5), hex.length > 7 ? n(7) : 1);
    };
    const blend = (hex, toward, amount) => {
      const n = (h, at) => parseInt(h.slice(at, at + 2), 16);
      return `#${[1, 3, 5]
        .map((at) =>
          Math.round(n(hex, at) * (1 - amount) + n(toward, at) * amount)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")}`;
    };

    const ear = (cx, cy, r, side) => {
      const hollowAt = { cx: cx + side * r * 0.1, cy: cy + r * 0.4, r: r * 0.85 };
      return {
        cx,
        cy,
        r,
        shape: oval(cx, cy, r, r),
        hollowAt,
        hollow: oval(hollowAt.cx, hollowAt.cy, hollowAt.r, hollowAt.r),
      };
    };
    const EARS = { near: ear(150, 168, 90, 1), far: ear(398, 168, 86, -1) };
    const FACE = svg(
      "M 111 309 C 106 262 128 226 170 199 C 208 175 250 158 290 158 C 345 157 390 181 415 216 C 440 252 446 300 437 341 C 428 392 393 423 345 430 C 290 441 218 442 177 422 C 137 403 116 369 111 309 Z",
    );
    const CUT_EDGE = svg("M 20 306 L 98 322 C 170 335 300 380 412 452 L 470 520");
    const CUT = svg(
      "M 0 302 L 20 306 L 98 322 C 170 335 300 380 412 452 L 470 520 L 512 520 V 512 H 0 Z",
    );
    const NOSE = svg(
      "M 317 224 C 330 216 352 221 365 231 C 377 241 380 263 381 291 C 382 319 382 344 375 363 C 370 378 358 386 340 386 C 319 386 302 382 296 368 C 289 351 290 319 290 290 C 291 259 296 232 307 227 C 310 226 313 225 317 224 Z",
    );
    const NOSE_SHADOW = svg(
      "M 320 231 C 333 223 355 228 368 238 C 380 248 383 270 384 298 C 385 326 385 351 378 370 C 373 385 361 393 343 393 C 322 393 305 389 299 375 C 292 358 293 326 293 297 C 294 266 299 239 310 234 C 313 233 316 232 320 231 Z",
    );
    const NOSE_RIM = svg("M 297 290 C 298 261 301 238 312 231 C 326 224 349 227 359 235");
    const EYES = [
      { cx: 245.5, cy: 280, rx: 12.5, ry: 23, reachX: 5, reachY: 6, lineWidth: 7, side: 1 },
      { cx: 406.5, cy: 282.5, rx: 8, ry: 20, reachX: 3.2, reachY: 5.5, lineWidth: 5.5, side: -1 },
    ].map((eye) => ({
      ...eye,
      socket: oval(eye.cx, eye.cy, eye.rx, eye.ry),
      shut: svg(
        `M ${eye.cx - eye.rx - 1} ${eye.cy + 4} Q ${eye.cx} ${eye.cy + eye.ry * 0.62} ${eye.cx + eye.rx + 1} ${eye.cy + 4}`,
      ),
    }));
    const MATTE = [0, 0.28, 0.52, 0.76, 1];
    const INK = ["#575566", "#424151", "#313141", "#222331", "#111422"];
    const GRAYS = {
      light: {
        face: ["#FFFFFF", "#F2F2F5", "#E3E3E8", "#D9D9DE", "#C7C7CC"],
        ear: ["#FBFBFD", "#ECECF0", "#DCDCE1", "#CDCDD2", "#BCBCC2"],
        inside: ["#6E6E73", "#7C7C81", "#8E8E93", "#A1A1A6", "#B4B4B9"],
        shade: "#636366",
        carve: "#8E8E93",
        cutShadow: 0.35,
        line: "#3A3A3C",
        accent: "#34C759",
      },
      dark: {
        face: ["#8E8E93", "#7C7C82", "#6C6C70", "#636366", "#545458"],
        ear: ["#8A8A8F", "#76767B", "#66666B", "#5A5A5F", "#4A4A4F"],
        inside: ["#2C2C2E", "#36363A", "#3F3F44", "#48484C", "#545458"],
        shade: "#1C1C1E",
        carve: "#3A3A3C",
        cutShadow: 0.6,
        line: "#1C1C1E",
        accent: "#30D158",
      },
    };

    const paint = new CK.Paint();
    paint.setAntiAlias(true);
    const blurs = new Map();
    const blur = (sigma) => {
      if (!blurs.has(sigma))
        blurs.set(sigma, CK.MaskFilter.MakeBlur(CK.BlurStyle.Normal, sigma, true));
      return blurs.get(sigma);
    };
    const linear = (x0, y0, x1, y1, colors, positions = MATTE) =>
      CK.Shader.MakeLinearGradient([x0, y0], [x1, y1], colors.map(color), positions, CK.TileMode.Clamp);
    const radial = (x, y, r, colors, positions = [0, 0.5, 1]) =>
      CK.Shader.MakeRadialGradient([x, y], r, colors.map(color), positions, CK.TileMode.Clamp);
    const light = (x, y, r, strength) => {
      const alpha = (share) =>
        Math.round(strength * share * 255)
          .toString(16)
          .padStart(2, "0");
      return radial(x, y, r, [`#FFFFFF${alpha(1)}`, `#FFFFFF${alpha(0.25)}`, "#FFFFFF00"]);
    };

    /** Fills or strokes `path` once, then puts the paint back. */
    function draw(c, path, { shader, fill, alpha = 1, stroke, cap, sigma }) {
      paint.setShader(shader ?? null);
      paint.setColor(color(fill ?? "#000000"));
      paint.setAlphaf(alpha);
      paint.setStyle(stroke ? CK.PaintStyle.Stroke : CK.PaintStyle.Fill);
      paint.setStrokeWidth(stroke ?? 0);
      paint.setStrokeCap(cap ? CK.StrokeCap.Round : CK.StrokeCap.Butt);
      paint.setMaskFilter(sigma ? blur(sigma) : null);
      c.drawPath(path, paint);
      shader?.delete();
    }

    /** RN Skia's `transform` with an `origin`: around (ox, oy), move, then turn. */
    function around(c, ox, oy, dx, dy, degrees = 0) {
      c.translate(ox + dx, oy + dy);
      c.rotate(degrees, 0, 0);
      c.translate(-ox, -oy);
    }

    function drawEar(c, at, body) {
      const { cx, cy, r, shape, hollow, hollowAt: inside } = at;
      draw(c, shape, { shader: linear(cx - r * 0.7, cy - r * 0.8, cx + r * 0.7, cy + r * 0.9, body.ear) });
      draw(c, shape, { shader: light(cx - r * 0.3, cy - r * 0.45, r * 1.3, 0.5) });
      c.save();
      c.clipPath(shape, CK.ClipOp.Intersect, true);
      draw(c, hollow, { shader: linear(cx, cy - r * 0.3, cx, cy + r, body.inside) });
      c.clipPath(hollow, CK.ClipOp.Intersect, true);
      draw(c, hollow, {
        shader: radial(inside.cx, inside.cy + inside.r * 0.35, inside.r * 0.9, ["#FFFFFF59", "#FFFFFF14", "#FFFFFF00"], [0, 0.55, 1]),
      });
      c.save();
      c.translate(0, r * 0.09);
      draw(c, hollow, { stroke: r * 0.32, alpha: 0.4, sigma: r * 0.12 });
      c.restore();
      draw(c, shape, { stroke: r * 0.1, fill: "#FFFFFF", alpha: 0.35, sigma: r * 0.04 });
      c.restore();
    }

    function drawEye(c, eye, f, line) {
      const { cx, cy, rx, ry, reachX, reachY, side } = eye;
      const lid = f.lid;
      c.save();
      // Where the eye sits: it moves with the head's turn and look.
      c.translate(f.turn * 10, f.look * 7);
      c.save();
      c.clipPath(eye.socket, CK.ClipOp.Intersect, true);
      // The upper lid comes down from the top.
      const shut = Math.min(1, Math.max(lid, f.happy * 0.18));
      c.clipRect(CK.LTRBRect(cx - 60, cy - ry + shut * ry * 2.05, cx + 60, cy + 200), CK.ClipOp.Intersect, true);
      // The lower lid, a wide dome that rises into the eye: a smiling crescent is left.
      const lower = oval(cx, cy + ry - f.happy * ry * 1.05 + 40, rx * 2.6, 40);
      c.clipPath(lower, CK.ClipOp.Difference, true);
      lower.delete();
      c.translate(f.gazeX * reachX, f.gazeY * reachY);
      const ball = oval(cx, cy, rx + 1, ry + 1);
      draw(c, ball, { shader: linear(232, 258, 258, 302, INK) });
      ball.delete();
      const glint = 0.85 * (1 - f.happy) * (1 - Math.min(1, lid * 1.4));
      if (glint > 0) {
        const spot = oval(cx - rx * 0.32, cy - ry * 0.42, rx * 0.26, ry * 0.16);
        draw(c, spot, { fill: "#FFFFFF", alpha: glint });
        spot.delete();
      }
      c.restore();
      const closed = Math.max(0, Math.min(1, (lid - 0.86) / 0.12));
      if (closed > 0) draw(c, eye.shut, { stroke: eye.lineWidth, cap: true, fill: line, alpha: closed });
      c.restore();
    }

    function drawKoala(c, f, scheme) {
      const body = GRAYS[scheme];
      const ramp = [blend(body.accent, "#000000", scheme === "dark" ? 0.55 : 0.45), blend(body.accent, "#000000", 0.15), body.accent, body.accent, body.accent];

      c.save();
      around(c, EARS.far.cx - 34, EARS.far.cy + 60, -f.turn * 7, -f.look * 5 - f.perk * 8, f.perk * 9);
      drawEar(c, EARS.far, body);
      c.restore();
      c.save();
      around(c, EARS.near.cx + 45, EARS.near.cy + 63, -f.turn * 7, -f.look * 5 - f.perk * 8, -f.perk * 9);
      drawEar(c, EARS.near, body);
      c.restore();

      c.save();
      c.clipPath(FACE, CK.ClipOp.Intersect, true);
      draw(c, FACE, { shader: linear(152, 176, 391, 418, body.face) });
      draw(c, FACE, { shader: light(204, 195, 300, 0.33) });
      draw(c, FACE, { shader: radial(440, 370, 220, [`${body.shade}40`, `${body.shade}12`, `${body.shade}00`]) });
      // The belt, carved into the face: no border, only a shadow under its top edge.
      c.clipPath(CUT, CK.ClipOp.Intersect, true);
      draw(c, FACE, { fill: body.carve });
      draw(c, FACE, { shader: linear(236, 352, 222, 420, ramp) });
      c.translate(0, 8);
      draw(c, CUT_EDGE, { stroke: 34, alpha: body.cutShadow, sigma: 12 });
      c.restore();

      c.save();
      c.translate(f.turn * 11, f.look * 8);
      draw(c, NOSE_SHADOW, { fill: body.shade, alpha: 0.28, sigma: 7 });
      c.restore();

      EYES.forEach((eye) => drawEye(c, eye, f, body.line));

      c.save();
      c.translate(f.turn * 13, f.look * 9);
      draw(c, NOSE, { shader: linear(301, 227, 369, 386, INK) });
      draw(c, NOSE, { shader: light(317, 240, 120, 0.19) });
      draw(c, NOSE_RIM, { stroke: 1.3, cap: true, fill: "#FFFFFF", alpha: 0.14 });
      c.restore();
    }

    // ---- What the face does, as in koala.tsx ----

    const face = { gazeX: 0, gazeY: 0, turn: 0, look: 0, lid: 0, happy: 0, perk: 0 };
    const target = { gazeX: 0, gazeY: 0 };
    let blinkAt = performance.now() + 2500;
    let blinking = -1;
    let jumpedAt = -Infinity;
    const sleep = { on: false, at: 0, from: 0 };

    // The eyes go first, the head follows a beat later and only partly, as people do.
    addEventListener(
      "pointermove",
      (event) => {
        const box = koala.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        target.gazeX = Math.max(-1, Math.min(1, dx / 300));
        target.gazeY = Math.max(-1, Math.min(1, dy / 300));
      },
      { passive: true },
    );
    document.addEventListener("pointerleave", () => {
      target.gazeX = 0;
      target.gazeY = 0;
    });
    koala.addEventListener("click", () => {
      jumpedAt = performance.now();
    });

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const bump = (t, up, hold, down) =>
      t < 0 ? 0 : t < up ? ease(t / up) : t < up + hold ? 1 : t < up + hold + down ? 1 - ease((t - up - hold) / down) : 0;

    let last = performance.now();
    function frame(c) {
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const still = reduced.matches;
      const asleep = koala.classList.contains("asleep") && !koala.classList.contains("jumping");

      const follow = (key, to, speed) => {
        face[key] += (to - face[key]) * (still ? 1 : 1 - Math.exp(-speed * dt));
      };
      follow("gazeX", asleep ? 0 : target.gazeX, 14);
      follow("gazeY", asleep ? 0 : target.gazeY, 14);
      follow("turn", face.gazeX * 0.5, 4);
      follow("look", face.gazeY * 0.4, 4);

      // A blink every few seconds: shut in 75 ms, open in 95 ms.
      if (!asleep && !still && now >= blinkAt) {
        blinking = now;
        blinkAt = now + 2500 + Math.random() * 4000;
      }
      const b = now - blinking;
      const blink = b < 75 ? (b / 75) * 0.98 : b < 170 ? 0.98 * (1 - (b - 75) / 95) : 0;
      // Falling asleep, the lids come down over 0.7 s; waking, they open in 0.15 s.
      if (asleep !== sleep.on) Object.assign(sleep, { on: asleep, at: now, from: face.lid });
      const settle = still ? 1 : ease(Math.min(1, (now - sleep.at) / (asleep ? 700 : 150)));
      face.lid = asleep ? sleep.from + (1 - sleep.from) * settle : Math.max(blink, sleep.from * (1 - settle));

      // A jump: its eyes smile and its ears perk up.
      const j = (now - jumpedAt) / 1000;
      face.happy = still ? 0 : bump(j, 0.2, 0.5, 0.35);
      face.perk = still ? 0 : bump(j - 0.05, 0.26, 0.4, 0.4);

      const scheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
      c.clear(CK.TRANSPARENT);
      c.save();
      const scale = (canvas.width / 512) * 0.88;
      c.translate(canvas.width / 2, canvas.height / 2);
      c.scale(scale, scale);
      c.translate(-256, -256);
      drawKoala(c, face, scheme);
      c.restore();

      if (!koala.classList.contains("skia")) koala.classList.add("skia");
      surface.requestAnimationFrame(frame);
    }
    surface.requestAnimationFrame(frame);
  }
})();
