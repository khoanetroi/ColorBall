import * as THREE from 'three';

/**
 * Procedural Texture Library for the candy wonderland theme.
 * Generates patterns on-the-fly to avoid external asset dependencies.
 */

function createCandyStripeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fff7ed';
  ctx.fillRect(0, 0, 512, 512);

  const stripeColors = ['#ffd6e7', '#c7f9ff', '#fff0b8', '#d9f99d'];
  const stripeWidth = 48;

  for (let i = -512; i < 1024; i += stripeWidth) {
    ctx.save();
    ctx.translate(i, 0);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = stripeColors[Math.floor(Math.abs(i / stripeWidth)) % stripeColors.length] ?? '#ffd6e7';
    ctx.fillRect(0, -64, 28, 768);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSprinkleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fffaf2';
  ctx.fillRect(0, 0, 256, 256);

  const sprinkles = ['#fb7185', '#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#a78bfa'];

  for (let x = 0; x < 256; x += 24) {
    for (let y = 0; y < 256; y += 24) {
      ctx.save();
      ctx.translate(x + 12, y + 12);
      ctx.rotate(((x + y) % 180) * (Math.PI / 180));
      ctx.fillStyle = sprinkles[(x / 24 + y / 24) % sprinkles.length] ?? '#fb7185';
      ctx.fillRect(-5, -1.25, 10, 2.5);
      ctx.restore();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCookieTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f6d7a7';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#f3c77a';
  ctx.lineWidth = 10;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 64 + i * 56);
    ctx.lineTo(512, 64 + i * 56);
    ctx.stroke();
  }

  const chips = ['#7c3aed', '#0ea5e9', '#f472b6', '#f59e0b', '#22c55e'];
  for (let i = 0; i < 60; i += 1) {
    ctx.save();
    ctx.translate(Math.random() * 512, Math.random() * 512);
    ctx.rotate(Math.random() * Math.PI);
    ctx.fillStyle = chips[i % chips.length] ?? '#7c3aed';
    ctx.fillRect(-8, -3, 16, 6);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const candyTextures = {
  wood: createCandyStripeTexture(),
  stitch: createSprinkleTexture(),
  stone: createCookieTexture(),
};
