// =====================================================================
//  ID-kort i snor — 3D (Three.js) med verlet-fysik
//  Falder ned og dingler ved indlæsning · træk for at svinge · klik for at vende
// =====================================================================
import * as THREE from 'three';

// ---------- Ret dit indhold her ----------
const CONFIG = {
  firstName: 'Silinda',
  lastName: 'Baftijari',
  role: 'KREATIV UDVIKLER & DESIGNER',
  org: 'SILINDA STUDIO',
  badge: 'STAFF',
  idLines: ['ID · 2017-0001', 'ADGANG · ALLE OMRÅDER'],
  email: 'silindabaftijari@gmail.com',
  skills: ['UI/UX & Figma', 'HTML · CSS · JavaScript', 'WordPress & PHP', 'GSAP-animationer'],
  photo: null,    // fx 'image/silinda.jpg'  (portræt, beskæres automatisk)
  qrImage: null,  // fx 'image/qr-cv.png'    (QR-kode til dit CV)
  colors: {
    paper: '#FFFDF8',
    ink: '#2D3332',
    muted: '#5E6663',
    accent: '#3B5A40',      // kortets grønne detaljer
    accentSoft: '#DCE4D3',
    accentLight: '#B7C9A4',
    back: '#25302A',
    edge: '#E6E1D6',
    strap: '#2C4732',       // mørk skovgrøn strop
    strapEdge: '#22392A',
    dot: '#F3EBD7'          // cremefarvede prikker
  }
};

// ---------- Mål (verdensenheder) ----------
const CARD_W = 2.0, CARD_H = 3.1, CARD_D = 0.035, CARD_R = 0.16;
const SLOT_W = 0.46, SLOT_H = 0.09, SLOT_Y = CARD_H / 2 - 0.2;
const CLIP_OFF = 0.36;                       // kortets top -> ringen
const AB = CLIP_OFF + CARD_H;                // ring -> kortets bund
const CENTER_F = (CLIP_OFF + CARD_H / 2) / AB;
const BAND_W = 0.36;                         // bredere strop
let BAND_TILE = 0.72;                        // sættes i drawBand()

// ---------- Fysik ----------
const SEGMENTS = 22;
const GRAVITY = -36;
const DAMPING = 0.994;
const INTRO_DAMPING = 0.9978;                // mindre dæmpning under intro = længere dingel
const INTRO_MS = 3200;
const ITER = 28;
const SUB_DT = 1 / 120;
const INV_ROPE = 6, INV_CARD = 0.6;

const host = document.getElementById('id-pass');
if (host) init(host);

async function init(host) {
  const stage = host.querySelector('.id-pass-stage');
  const flipBtn = host.querySelector('.id-pass-flip');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    host.classList.add('id-pass--fallback');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(16, 1, 0.1, 400);
  scene.add(new THREE.AmbientLight(0xffffff, 2.1));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
  keyLight.position.set(3, 4, 8);
  scene.add(keyLight);

  // Vent på skrifttyper og billeder, før teksturerne tegnes
  try {
    await Promise.all([
      document.fonts.load('500 100px Fraunces'),
      document.fonts.load('italic 300 100px Fraunces'),
      document.fonts.load('600 40px Inter'),
      document.fonts.load('500 40px Inter'),
      document.fonts.load('400 40px Inter')
    ]);
  } catch (err) { /* fortsæt med fallback-skrift */ }
  const [photoImg, qrImg] = await Promise.all([loadImage(CONFIG.photo), loadImage(CONFIG.qrImage)]);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  // ================= KORT =================
  const shape = roundedRect(new THREE.Shape(), CARD_W, CARD_H, CARD_R);
  shape.holes.push(roundedRect(new THREE.Path(), SLOT_W, SLOT_H, SLOT_H / 2, 0, SLOT_Y));

  const frontTex = toTexture(drawFront(photoImg), maxAniso);
  const backTex = toTexture(drawBack(qrImg), maxAniso);

  const frontGeo = new THREE.ShapeGeometry(shape, 12);
  setCardUV(frontGeo, false);
  frontGeo.translate(0, 0, CARD_D / 2 + 0.0005);

  const backGeo = new THREE.ShapeGeometry(shape, 12);
  setCardUV(backGeo, false);
  backGeo.rotateY(Math.PI);
  backGeo.translate(0, 0, -CARD_D / 2 - 0.0005);

  const edgeGeo = new THREE.ExtrudeGeometry(shape, { depth: CARD_D, bevelEnabled: false, curveSegments: 12 });
  edgeGeo.translate(0, 0, -CARD_D / 2);

  const front = new THREE.Mesh(frontGeo, new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.62 }));
  const back = new THREE.Mesh(backGeo, new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.62 }));
  const edge = new THREE.Mesh(edgeGeo, [
    new THREE.MeshBasicMaterial({ visible: false }),
    new THREE.MeshStandardMaterial({ color: CONFIG.colors.edge, roughness: 0.5 })
  ]);

  const card = new THREE.Group();
  card.add(front, back, edge);

  // Klips + ring
  const metal = new THREE.MeshStandardMaterial({ color: 0xc9ccc6, metalness: 0.45, roughness: 0.28 });
  const plastic = new THREE.MeshStandardMaterial({ color: 0xd9ddd8, roughness: 0.3, transparent: true, opacity: 0.85 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 12, 32), metal);
  ring.position.set(0, CARD_H / 2 + CLIP_OFF - 0.02, 0);
  const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.07), metal);
  clamp.position.set(0, CARD_H / 2 + 0.17, 0);
  const tongueF = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.01), plastic);
  tongueF.position.set(0, CARD_H / 2 + 0.01, CARD_D / 2 + 0.01);
  const tongueB = tongueF.clone();
  tongueB.position.z = -(CARD_D / 2 + 0.01);
  card.add(ring, clamp, tongueF, tongueB);
  scene.add(card);

  const hitTargets = [front, back, edge, tongueF, tongueB, clamp];

  // ================= SNOR (bånd) =================
  const SAMPLES = 90;
  const bandPos = new Float32Array((SAMPLES + 1) * 2 * 3);
  const bandUV = new Float32Array((SAMPLES + 1) * 2 * 2);
  const bandIdx = [];
  for (let i = 0; i < SAMPLES; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    bandIdx.push(a, b, c, b, d, c);
  }
  const bandGeo = new THREE.BufferGeometry();
  bandGeo.setAttribute('position', new THREE.BufferAttribute(bandPos, 3));
  bandGeo.setAttribute('uv', new THREE.BufferAttribute(bandUV, 2));
  bandGeo.setIndex(bandIdx);
  const bandTex = toTexture(drawBand(), maxAniso);
  bandTex.wrapT = THREE.RepeatWrapping;
  const band = new THREE.Mesh(bandGeo, new THREE.MeshStandardMaterial({ map: bandTex, side: THREE.DoubleSide, roughness: 0.85 }));
  band.frustumCulled = false;
  scene.add(band);

  // skjult indtil intro-faldet starter
  card.visible = false;
  band.visible = false;

  // ================= FYSIK =================
  const N = SEGMENTS;          // pts[N] = ringen (A), pts[N+1] = kortets bund (B)
  let pts = [], prev = [], inv = [];
  const anchor = new THREE.Vector3();
  let segLen = 0.2;
  let P = 130;                 // pixels pr. verdensenhed
  let stageW = 1, stageH = 1;
  let theta = 0, thetaTarget = 0, omega = 0;
  let dragging = false, moved = false, downX = 0, downY = 0;
  let introUntil = 0;
  const target = new THREE.Vector3();
  const grabOffset = new THREE.Vector3();
  const curve = new THREE.CatmullRomCurve3([], false, 'centripetal');

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpC = new THREE.Vector3();
  const up = new THREE.Vector3(), right = new THREE.Vector3(), fwd = new THREE.Vector3();
  const right0 = new THREE.Vector3(), fwd0 = new THREE.Vector3();
  const Z = new THREE.Vector3(0, 0, 1);
  const basis = new THREE.Matrix4();
  const center = new THREE.Vector3();

  function layout() {
    const rect = host.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const desktop = window.innerWidth >= 768;
    const reach = desktop ? rect.top + window.scrollY : 80; // hvor langt op snoren går
    stageW = vw;
    stageH = Math.round(reach + rect.height);
    stage.style.left = (-rect.left) + 'px';
    stage.style.top = (-reach) + 'px';
    stage.style.width = stageW + 'px';
    stage.style.height = stageH + 'px';
    renderer.setSize(stageW, stageH);

    P = Math.max(70, Math.min(135, rect.width / 2.6, (rect.height - 70) / (CARD_H + 0.8)));
    const visH = stageH / P;
    camera.aspect = stageW / stageH;
    camera.position.set(0, 0, (visH / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.far = camera.position.z * 3;
    camera.updateProjectionMatrix();

    const toWX = (px) => (px - stageW / 2) / P;
    const toWY = (py) => (stageH / 2 - py) / P;
    const cxPx = rect.left + rect.width / 2;
    anchor.set(toWX(cxPx), toWY(-40), 0);
    const cardPx = CARD_H * P;
    const free = rect.height - 50 - cardPx;
    const ringPx = reach + Math.max(10 + CLIP_OFF * P, free * 0.45) - CLIP_OFF * P;
    const ringY = toWY(ringPx);
    segLen = Math.max(0.05, (anchor.y - ringY) / N);
    resetRope();
  }

  function resetRope() {
    pts = []; prev = []; inv = [];
    for (let i = 0; i <= N; i++) {
      const p = new THREE.Vector3(anchor.x, anchor.y - segLen * i, 0);
      pts.push(p); prev.push(p.clone()); inv.push(i === 0 ? 0 : INV_ROPE);
    }
    inv[N] = INV_CARD;
    const b = new THREE.Vector3(pts[N].x, pts[N].y - AB, 0);
    pts.push(b); prev.push(b.clone()); inv.push(INV_CARD);
    curve.points = pts.slice(0, N + 1);
  }

  // Kortet starter oppe og ude til siden, falder, fanges af snoren og dingler
  function dropIn() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resetRope();
    if (!reduce) {
      const ang = -0.6;                      // svinger ind fra venstre
      const dx = Math.sin(ang), dy = -Math.cos(ang);
      for (let i = 1; i <= N; i++) {
        pts[i].set(anchor.x + dx * segLen * i * 0.55, anchor.y + dy * segLen * i * 0.55, 0);
        prev[i].copy(pts[i]);
      }
      pts[N + 1].set(pts[N].x + dx * AB, pts[N].y + dy * AB, 0);
      prev[N + 1].copy(pts[N + 1]);
      omega = 0.05;                          // lille drej i faldet
      introUntil = performance.now() + INTRO_MS;
    }
    card.visible = true;
    band.visible = true;
    host.classList.add('id-pass--ready');
  }

  function satisfy(ia, ib, len, ropeOnly) {
    const a = pts[ia], b = pts[ib];
    tmpA.subVectors(b, a);
    const d = tmpA.length();
    if (d < 1e-6 || (ropeOnly && d <= len)) return;
    const wsum = inv[ia] + inv[ib];
    if (wsum === 0) return;
    const f = (d - len) / (d * wsum);
    a.addScaledVector(tmpA, f * inv[ia]);
    b.addScaledVector(tmpA, -f * inv[ib]);
  }

  function cardCenter(out) {
    return out.copy(pts[N]).lerp(pts[N + 1], CENTER_F);
  }

  function substep() {
    const g = GRAVITY * SUB_DT * SUB_DT;
    const damp = performance.now() < introUntil ? INTRO_DAMPING : DAMPING;
    for (let i = 0; i < pts.length; i++) {
      if (inv[i] === 0) continue;
      const p = pts[i], pr = prev[i];
      tmpA.subVectors(p, pr).multiplyScalar(damp);
      pr.copy(p);
      p.add(tmpA);
      p.y += g;
    }
    if (dragging) {
      cardCenter(center);
      tmpB.subVectors(target, center);
      for (const i of [N, N + 1]) {
        pts[i].addScaledVector(tmpB, 0.3);
        prev[i].lerp(pts[i], 0.25);
      }
    }
    for (let k = 0; k < ITER; k++) {
      pts[0].copy(anchor);
      for (let i = 0; i < N; i++) satisfy(i, i + 1, segLen, true);
      satisfy(N, N + 1, AB, false);
    }
    // hold kortet i z ≈ 0
    for (let i = 1; i < pts.length; i++) pts[i].z *= 0.9;
  }

  function updateCard(dt) {
    const A = pts[N], B = pts[N + 1];
    up.subVectors(A, B).normalize();
    right0.crossVectors(up, Z);
    if (right0.lengthSq() < 1e-6) right0.set(1, 0, 0);
    right0.normalize();
    fwd0.crossVectors(right0, up).normalize();

    const f = dt * 60;
    const vxB = (B.x - prev[N + 1].x) / SUB_DT;
    omega += ((thetaTarget - theta) * 0.05 + vxB * 0.0025) * f;
    omega *= Math.pow(0.9, f);
    theta += omega * f;

    const c = Math.cos(theta), s = Math.sin(theta);
    right.copy(right0).multiplyScalar(c).addScaledVector(fwd0, s);
    fwd.crossVectors(right, up);
    basis.makeBasis(right, up, fwd);
    card.quaternion.setFromRotationMatrix(basis);
    cardCenter(card.position);
  }

  function updateBand() {
    let arc = 0;
    const last = tmpC.set(0, 0, 0);
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      const p = curve.getPoint(t, tmpA);
      const tan = curve.getTangent(t, tmpB);
      if (i > 0) arc += p.distanceTo(last);
      last.copy(p);
      // bredside mod kameraet, drejer med kortet nær klipsen
      const side = tan.cross(Z).normalize();
      const w = Math.pow(THREE.MathUtils.clamp((t - 0.8) / 0.2, 0, 1), 2);
      if (w > 0) {
        const sign = side.dot(right) < 0 ? -1 : 1;
        side.lerp(fwd.set(right.x * sign, right.y * sign, right.z * sign), w).normalize();
        fwd.crossVectors(right, up); // gendan
      }
      const o = i * 6;
      bandPos[o] = p.x + side.x * BAND_W / 2;
      bandPos[o + 1] = p.y + side.y * BAND_W / 2;
      bandPos[o + 2] = p.z + side.z * BAND_W / 2;
      bandPos[o + 3] = p.x - side.x * BAND_W / 2;
      bandPos[o + 4] = p.y - side.y * BAND_W / 2;
      bandPos[o + 5] = p.z - side.z * BAND_W / 2;
      const u = i * 4, v = arc / BAND_TILE;
      bandUV[u] = 1; bandUV[u + 1] = v; bandUV[u + 2] = 0; bandUV[u + 3] = v;
    }
    bandGeo.attributes.position.needsUpdate = true;
    bandGeo.attributes.uv.needsUpdate = true;
    bandGeo.computeVertexNormals();
  }

  function flip() {
    thetaTarget += Math.PI;
    flipBtn && flipBtn.setAttribute('aria-pressed', String(Math.round(thetaTarget / Math.PI) % 2 === 1));
  }

  // ================= INPUT =================
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();

  function setRay(x, y) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
  }
  function hitsCard(x, y) {
    if (!card.visible) return false;
    setRay(x, y);
    return raycaster.intersectObjects(hitTargets, false).length > 0;
  }

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!hitsCard(e.clientX, e.clientY)) return;
    e.preventDefault();
    dragging = true; moved = false;
    introUntil = 0;
    downX = e.clientX; downY = e.clientY;
    raycaster.ray.intersectPlane(plane, hit);
    cardCenter(center);
    grabOffset.subVectors(center, hit);
    target.copy(center);
    document.body.classList.add('id-pass-dragging');
  }, { passive: false });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 6) moved = true;
    setRay(e.clientX, e.clientY);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      target.addVectors(hit, grabOffset);
      const visH = stageH / P, visW = stageW / P;
      target.x = THREE.MathUtils.clamp(target.x, -visW / 2 + 1, visW / 2 - 1);
      target.y = THREE.MathUtils.clamp(target.y, -visH / 2 + 1.6, visH / 2);
    }
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    document.body.classList.remove('id-pass-dragging');
    if (!moved) flip();
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // undgå at siden scroller, når man trækker i kortet på mobil
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (t && hitsCard(t.clientX, t.clientY)) e.preventDefault();
  }, { passive: false });

  flipBtn && flipBtn.addEventListener('click', flip);

  // ================= LOOP =================
  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(host);

  layout();
  let resizeTimer;
  const relayout = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); };
  window.addEventListener('resize', relayout);

  // Start faldet lige når loader-skærmen begynder at forsvinde
  if (document.readyState === 'complete') {
    setTimeout(dropIn, 150);
  } else {
    window.addEventListener('load', () => { layout(); setTimeout(dropIn, 350); }, { once: true });
  }

  let last = performance.now(), acc = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    if (!visible) return;
    acc += dt;
    while (acc >= SUB_DT) { substep(); acc -= SUB_DT; }
    updateCard(dt);
    updateBand();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}

// =====================================================================
//  Hjælpefunktioner
// =====================================================================
function roundedRect(target, w, h, r, cx = 0, cy = 0) {
  const x = cx - w / 2, y = cy - h / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.quadraticCurveTo(x + w, y, x + w, y + r);
  target.lineTo(x + w, y + h - r);
  target.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  target.lineTo(x + r, y + h);
  target.quadraticCurveTo(x, y + h, x, y + h - r);
  target.lineTo(x, y + r);
  target.quadraticCurveTo(x, y, x + r, y);
  return target;
}

function setCardUV(geo, mirror) {
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + CARD_W / 2) / CARD_W;
    const v = (pos.getY(i) + CARD_H / 2) / CARD_H;
    uv.setXY(i, mirror ? 1 - u : u, v);
  }
  uv.needsUpdate = true;
}

function toTexture(canvas, aniso) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  return tex;
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, font, color, spacing = 0, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  if ('letterSpacing' in ctx) ctx.letterSpacing = spacing + 'px';
  ctx.fillText(str, x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

const TEX_W = 1000, TEX_H = 1550;
const SLOT_PX_Y = (CARD_H / 2 - SLOT_Y) / CARD_H * TEX_H;

function drawFront(photo) {
  const C = CONFIG.colors;
  const c = document.createElement('canvas');
  c.width = TEX_W; c.height = TEX_H;
  const ctx = c.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // forstærkning omkring hullet
  ctx.fillStyle = '#EFEBE2';
  rr(ctx, TEX_W / 2 - 140, SLOT_PX_Y - 38, 280, 76, 38); ctx.fill();

  // header
  text(ctx, CONFIG.org, 72, 242, '600 30px Inter', C.ink, 6);
  ctx.font = '600 24px Inter';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
  const bw = ctx.measureText(CONFIG.badge).width + 48;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.fillStyle = C.accent;
  rr(ctx, TEX_W - 72 - bw, 207, bw, 50, 25); ctx.fill();
  text(ctx, CONFIG.badge, TEX_W - 72 - bw / 2 + 2, 241, '600 24px Inter', C.paper, 4, 'center');

  // foto
  const px = 72, py = 290, pw = TEX_W - 144, ph = 600;
  ctx.save();
  rr(ctx, px, py, pw, ph, 40); ctx.clip();
  ctx.fillStyle = C.accentSoft; ctx.fillRect(px, py, pw, ph);
  if (photo) {
    const s = Math.max(pw / photo.width, ph / photo.height);
    const w = photo.width * s, h = photo.height * s;
    ctx.drawImage(photo, px + (pw - w) / 2, py + (ph - h) / 2, w, h);
  } else {
    // diskrete prikker i fotofeltet, så det matcher stroppen
    ctx.fillStyle = 'rgba(59, 90, 64, 0.08)';
    for (let y = py + 30, row = 0; y < py + ph; y += 56, row++) {
      for (let x = px + 30 + (row % 2) * 28; x < px + pw; x += 56) {
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
      }
    }
    const initials = CONFIG.firstName[0] + CONFIG.lastName[0];
    text(ctx, initials, TEX_W / 2, py + ph / 2 + 100, 'italic 300 300px Fraunces', C.accent, 0, 'center');
    text(ctx, '[DIT FOTO]', TEX_W / 2, py + ph - 50, '600 22px Inter', C.muted, 3, 'center');
  }
  ctx.restore();

  // navn + rolle
  text(ctx, CONFIG.firstName, 68, 1012, '500 124px Fraunces', C.ink, -2);
  text(ctx, CONFIG.lastName, 68, 1136, '500 124px Fraunces', C.ink, -2);
  text(ctx, CONFIG.role, 72, 1208, '600 28px Inter', C.muted, 5);

  ctx.fillStyle = '#E5E0D5';
  ctx.fillRect(72, 1262, TEX_W - 144, 3);

  // ID-linjer
  CONFIG.idLines.forEach((l, i) => text(ctx, l, 72, 1348 + i * 46, '500 26px Inter', C.muted, 3));

  // stregkode
  const bars = [2,1,3,1,1,2,1,3,2,1,1,2,3,1,2,1,1,3,1,2,1,2,3,1,1,2];
  let bx = TEX_W - 72;
  ctx.fillStyle = C.ink;
  for (let i = bars.length - 1; i >= 0; i--) {
    const w = bars[i] * 4;
    bx -= w;
    if (i % 2 === 0) ctx.fillRect(bx, 1310, w, 100);
    bx -= 3;
  }

  ctx.fillStyle = C.accent;
  ctx.fillRect(0, TEX_H - 56, TEX_W, 56);
  return c;
}

function drawBack(qr) {
  const C = CONFIG.colors;
  const c = document.createElement('canvas');
  c.width = TEX_W; c.height = TEX_H;
  const ctx = c.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = C.back;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = '#34413A';
  rr(ctx, TEX_W / 2 - 140, SLOT_PX_Y - 38, 280, 76, 38); ctx.fill();

  text(ctx, 'ADGANGSNIVEAU', 72, 242, '600 28px Inter', '#AEB6B2', 6);
  CONFIG.skills.forEach((s, i) => text(ctx, '✓  ' + s, 72, 336 + i * 74, '400 46px Inter', '#F4F1EA'));
  text(ctx, '✓  Kaffe, ubegrænset', 72, 336 + CONFIG.skills.length * 74, '400 46px Inter', '#AEB6B2');

  ctx.strokeStyle = '#55615A'; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
  ctx.beginPath(); ctx.moveTo(72, 722); ctx.lineTo(TEX_W - 72, 722); ctx.stroke();
  ctx.setLineDash([]);

  ['Fundet dette kort?', 'Send en mail, så', 'laver vi noget', 'sammen.'].forEach((l, i) =>
    text(ctx, l, 70, 830 + i * 88, 'italic 300 78px Fraunces', '#F4F1EA', -1));
  text(ctx, CONFIG.email, 72, 1184, '500 40px Inter', C.accentLight);

  if (qr) {
    ctx.fillStyle = '#F4F1EA';
    rr(ctx, 72, 1262, 190, 190, 16); ctx.fill();
    ctx.drawImage(qr, 84, 1274, 166, 166);
    text(ctx, 'SCAN FOR CV', 296, 1366, '600 26px Inter', '#AEB6B2', 4);
  } else {
    text(ctx, 'GYLDIG · ALTID', 72, 1380, '600 26px Inter', '#AEB6B2', 4);
    text(ctx, 'KØBENHAVN, DK', 72, 1426, '600 26px Inter', '#AEB6B2', 4);
  }

  ctx.fillStyle = C.accent;
  ctx.fillRect(0, TEX_H - 56, TEX_W, 56);
  return c;
}

// Mørk skovgrøn strop med cremefarvede polka dots (sømløs tekstur)
function drawBand() {
  const C = CONFIG.colors;
  const W = 128, H = 256;                    // 4 gentagelser af prikmønstret pr. flise
  BAND_TILE = H / W * BAND_W;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // stof
  ctx.fillStyle = C.strap;
  ctx.fillRect(0, 0, W, H);

  // vævet struktur
  ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let x = 0; x < W; x += 6) ctx.fillRect(x, 0, 1, H);

  // mørkere kanter
  ctx.fillStyle = C.strapEdge;
  ctx.fillRect(0, 0, 7, H);
  ctx.fillRect(W - 7, 0, 7, H);

  // syninger
  ctx.strokeStyle = 'rgba(243, 235, 215, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  [13, W - 13].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); });
  ctx.setLineDash([]);

  // polka dots — forskudt mønster, periode 64px
  const dot = (x, y) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';  // lille skygge giver dybde
    ctx.beginPath(); ctx.arc(x + 1, y + 1.5, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.dot;
    ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
  };
  for (let y = 0; y < H; y += 64) {
    dot(42, y + 16);
    dot(86, y + 16);
    dot(64, y + 48);
  }
  return c;
}