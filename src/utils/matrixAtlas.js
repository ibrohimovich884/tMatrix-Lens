import * as THREE from 'three';

/**
 * Creates a high-resolution 2D Canvas texture atlas containing
 * crisp monospace glyphs '0' and '1' with anti-aliasing and core luminescence.
 */
export function createBinaryGlyphAtlas() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Clear with pure transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const halfWidth = canvas.width / 2; // 128
  const height = canvas.height; // 128

  const renderGlyph = (char, offsetX) => {
    ctx.save();
    ctx.translate(offsetX + halfWidth / 2, height / 2);

    // Font styling - crisp bold monospace
    ctx.font = 'bold 88px "Fira Code", monospace, "Courier New", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outer subtle cyber glow
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(char, 0, 0);

    // Sharp white core
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(char, 0, 0);

    ctx.restore();
  };

  // Render '0' on left half [0..128]
  renderGlyph('0', 0);

  // Render '1' on right half [128..256]
  renderGlyph('1', halfWidth);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}
