import * as THREE from 'three';

/**
 * Creates a high-resolution canvas texture for Saturn with realistic atmospheric gas bands
 */
export function createSaturnTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Saturn background base (warm golden cream)
  ctx.fillStyle = '#d4be8d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw smooth horizontal atmospheric bands
  const bands = [
    { y: 0.0, height: 0.1, color: '#a39268' },
    { y: 0.1, height: 0.15, color: '#c4b183' },
    { y: 0.25, height: 0.08, color: '#e2d4ac' },
    { y: 0.33, height: 0.12, color: '#bca678' },
    { y: 0.45, height: 0.1, color: '#dfd2b0' },
    { y: 0.55, height: 0.15, color: '#c2b082' },
    { y: 0.7, height: 0.12, color: '#a8976d' },
    { y: 0.82, height: 0.18, color: '#8d7c54' },
  ];

  bands.forEach(band => {
    const grad = ctx.createLinearGradient(0, band.y * canvas.height, 0, (band.y + band.height) * canvas.height);
    grad.addColorStop(0, band.color);
    grad.addColorStop(0.5, '#e8dcba');
    grad.addColorStop(1, band.color);

    ctx.fillStyle = grad;
    ctx.fillRect(0, band.y * canvas.height, canvas.width, band.height * canvas.height);
  });

  // Add subtle horizontal noise & cloud turbulence
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * canvas.height;
    const h = 2 + Math.random() * 6;
    ctx.fillRect(0, y, canvas.width, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates realistic Saturn Ring texture with opacity transparency and Cassini division
 */
export function createSaturnRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0.0, 'rgba(0,0,0,0)'); // Inner edge transparent
  grad.addColorStop(0.1, 'rgba(160,140,100,0.2)'); // D Ring
  grad.addColorStop(0.2, 'rgba(210,190,140,0.8)'); // C Ring
  grad.addColorStop(0.4, 'rgba(230,210,160,0.95)'); // B Ring (Bright)
  grad.addColorStop(0.65, 'rgba(20,15,10,0.1)'); // Cassini Division (Dark gap)
  grad.addColorStop(0.7, 'rgba(200,180,130,0.85)'); // A Ring
  grad.addColorStop(0.9, 'rgba(180,160,110,0.4)'); // Encke division area
  grad.addColorStop(0.98, 'rgba(140,120,80,0.2)'); // Outer edge
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add micro ringlets (fine lines)
  for (let x = 0; x < canvas.width; x += 3) {
    if (Math.random() > 0.4) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.25})`;
      ctx.fillRect(x, 0, 1.5, canvas.height);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates a realistic cratered Mercury texture
 */
export function createMercuryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base metallic gray tone
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Noisy texture background
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw realistic craters
  for (let i = 0; i < 350; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const radius = 3 + Math.random() * 25;

    // Darker crater floor
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(50, 50, 50, 0.4)';
    ctx.fill();

    // Bright crater rim shadow
    ctx.beginPath();
    ctx.arc(cx - radius * 0.2, cy - radius * 0.2, radius, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(210, 210, 210, 0.5)';
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates a realistic Moon texture with maria and highlands
 */
export function createMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Bright lunar highland base
  ctx.fillStyle = '#b5b5b5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Maria (dark basaltic seas)
  const mariaLocations = [
    { x: 300, y: 200, r: 120 }, // Sea of Tranquility / Serenity
    { x: 220, y: 250, r: 140 }, // Oceanus Procellarum
    { x: 450, y: 180, r: 90 },  // Sea of Imbrium
    { x: 650, y: 300, r: 100 }, // Far side features
  ];

  mariaLocations.forEach(m => {
    const grad = ctx.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.r);
    grad.addColorStop(0, '#505050');
    grad.addColorStop(0.7, '#6e6e6e');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Bright impact craters & ray systems
  for (let i = 0; i < 400; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const r = 2 + Math.random() * 18;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(40, 40, 40, 0.4)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(235, 235, 235, 0.6)';
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates a realistic Jupiter texture with atmospheric bands & Great Red Spot
 */
export function createJupiterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Jupiter atmosphere base
  ctx.fillStyle = '#c89e6c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Atmospheric horizontal bands (alternating dark zones & bright belts)
  const jupiterBands = [
    { y: 0.0, h: 0.08, c: '#a47e53' },
    { y: 0.08, h: 0.12, c: '#d9c2a3' },
    { y: 0.20, h: 0.10, c: '#8c5e32' }, // North Equatorial Belt
    { y: 0.30, h: 0.15, c: '#e8d8c3' }, // Equatorial Zone
    { y: 0.45, h: 0.12, c: '#9a683a' }, // South Equatorial Belt
    { y: 0.57, h: 0.15, c: '#c5a782' },
    { y: 0.72, h: 0.13, c: '#84603c' },
    { y: 0.85, h: 0.15, c: '#5f462c' },
  ];

  jupiterBands.forEach(b => {
    const grad = ctx.createLinearGradient(0, b.y * canvas.height, 0, (b.y + b.h) * canvas.height);
    grad.addColorStop(0, b.c);
    grad.addColorStop(0.5, '#e4d2b8');
    grad.addColorStop(1, b.c);

    ctx.fillStyle = grad;
    ctx.fillRect(0, b.y * canvas.height, canvas.width, b.h * canvas.height);
  });

  // Turbulent swirls in bands
  for (let y = 0; y < canvas.height; y += 12) {
    ctx.fillStyle = `rgba(160, 90, 40, ${0.1 + Math.random() * 0.15})`;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.ellipse(x, y, 20 + Math.random() * 30, 4 + Math.random() * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // The Great Red Spot storm (located around S 22° latitude, i.e., y ~ 0.6 * height)
  const grsX = canvas.width * 0.65;
  const grsY = canvas.height * 0.58;
  const grsRx = 55;
  const grsRy = 35;

  const grsGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, grsRx);
  grsGrad.addColorStop(0, '#bd3f27');
  grsGrad.addColorStop(0.5, '#cf5637');
  grsGrad.addColorStop(0.8, '#a6442c');
  grsGrad.addColorStop(1.0, 'transparent');

  ctx.fillStyle = grsGrad;
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, grsRx, grsRy, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // White swirl ring around Great Red Spot
  ctx.strokeStyle = 'rgba(255, 245, 230, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, grsRx + 6, grsRy + 4, 0.05, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
