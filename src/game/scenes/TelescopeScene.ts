// ============================================================
// TelescopeScene — Photorealistic JWST / Hubble Space Observatory Calibration
// Built with Phaser 3 for NASA Space Apps Challenge 2026
// Deep-Field Galaxy Imagery · 18 Hex Beryllium Mirrors · 6-Point Diffraction Spikes
// ============================================================
import Phaser from 'phaser';
import type { TelescopeParams } from '../missionGameData';

export interface TelescopeSceneConfig {
  missionId: string;
  missionName: string;
  params: TelescopeParams;
  onSuccess: (score: number) => void;
  onFailure: (reason: string) => void;
}

interface CelestialTarget {
  x: number;
  y: number;
  name: string;
  type: string;
  magnitude: number;
  solved: boolean;
  color: number;
}

export class TelescopeScene extends Phaser.Scene {
  private cfg!: TelescopeSceneConfig;

  // Backgrounds & Overlays
  private galaxyImage!: Phaser.GameObjects.Image;
  private jwstHexGfx!: Phaser.GameObjects.Graphics;
  private diffractionSpikesGfx!: Phaser.GameObjects.Graphics;

  // Visuals & Objects
  private reticleX = 400;
  private reticleY = 300;
  private targetReticleX = 400;
  private targetReticleY = 300;

  private targets: CelestialTarget[] = [];
  private currentTargetIndex = 0;
  private lockProgress = 0; // 0 to 1
  private isGameOver = false;

  private timeRemaining = 60;
  private targetsCalibrated = 0;

  // Graphics layers
  private starGfx!: Phaser.GameObjects.Graphics;
  private targetGfx!: Phaser.GameObjects.Graphics;
  private reticleGfx!: Phaser.GameObjects.Graphics;
  private hudGfx!: Phaser.GameObjects.Graphics;

  // HUD text
  private timerText!: Phaser.GameObjects.Text;
  private targetInfoText!: Phaser.GameObjects.Text;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  // Shimmer noise simulation
  private noiseOffset = 0;

  constructor() {
    super({ key: 'TelescopeScene' });
  }

  preload() {
    // NASA Hubble / JWST Arp Galaxy Merger Image
    this.load.image('galaxy_deep_field', '/assets/nasa/ugc-1810-and-ugc-1813-in-arp.jpg');
  }

  init(data: TelescopeSceneConfig) {
    this.cfg = data;
    this.timeRemaining = data.params.timeLimitSec || 45;
    this.lockProgress = 0;
    this.targetsCalibrated = 0;
    this.isGameOver = false;
    this.reticleX = 400;
    this.reticleY = 300;
    this.targetReticleX = 400;
    this.targetReticleY = 300;
    this.noiseOffset = Math.random() * 1000;

    const targetPool = [
      { name: 'Arp 273 (UGC 1810 Rose Spiral)', type: 'Interacting Galaxy System', color: 0x38bdf8 },
      { name: 'Kepler-452b Primary Exoplanet', type: 'G2V Habitable Candidate', color: 0xfde047 },
      { name: 'Pillars of Creation (M16 Core)', type: 'Stellar Nursery Proplyds', color: 0xf97316 },
      { name: 'Sagittarius A* Accretion Ring', type: 'Supermassive Event Horizon', color: 0xa855f7 },
      { name: 'TRAPPIST-1 Ultracool Dwarf', type: '7 Terrestrial Worlds', color: 0xef4444 },
      { name: 'Carina Nebula Mystic Mountain', type: 'High-Mass Star Genesis', color: 0x06b6d4 },
    ];

    Phaser.Utils.Array.Shuffle(targetPool);
    const count = Math.min(this.cfg.params.numTargets || 3, targetPool.length);

    this.targets = [];
    for (let i = 0; i < count; i++) {
      const margin = 130;
      const x = Phaser.Math.Between(margin, 800 - margin);
      const y = Phaser.Math.Between(margin, 600 - margin);
      this.targets.push({
        x,
        y,
        name: targetPool[i].name,
        type: targetPool[i].type,
        magnitude: parseFloat((Math.random() * 8 + 4).toFixed(1)),
        solved: false,
        color: targetPool[i].color,
      });
    }
    this.currentTargetIndex = 0;
  }

  create() {
    const { width, height } = this.scale;

    // 1. Deep Space Void Background
    this.cameras.main.setBackgroundColor('#020617');

    // 2. High-Resolution Photographic Hubble / JWST Galaxy Backdrop
    if (this.textures.exists('galaxy_deep_field')) {
      this.galaxyImage = this.add.image(width / 2, height / 2, 'galaxy_deep_field')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(width * 1.05, height * 1.05)
        .setAlpha(0.68)
        .setDepth(1);
    }

    // 3. JWST 18-Hexagonal Gold-Coated Beryllium Primary Mirror Aperture Overlay
    this.jwstHexGfx = this.add.graphics().setDepth(2);
    this.drawJWSTMirrorHexagons(width, height);

    // 4. Stellar Field & 6-Point Diffraction Spikes
    this.starGfx = this.add.graphics().setDepth(3);
    this.diffractionSpikesGfx = this.add.graphics().setDepth(4);
    this.renderStellarSpikes(width, height);

    // 5. Target Markers
    this.targetGfx = this.add.graphics().setDepth(6);

    // 6. Fine Guidance Sensor (FGS) Optical Reticle
    this.reticleGfx = this.add.graphics().setDepth(10);
    this.hudGfx = this.add.graphics().setDepth(20);

    // 7. Glass Cockpit Observatory HUD
    this.add.text(24, 18, `${this.cfg.missionName.toUpperCase()} // WEBB NIRCam OPTICAL CALIBRATION`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#38bdf8',
      letterSpacing: 1,
    }).setDepth(21);

    this.timerText = this.add.text(width - 24, 18, `EXPOSURE: ${this.timeRemaining.toFixed(1)}S`, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#fde047',
      fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(21);

    this.targetInfoText = this.add.text(24, 46, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#cbd5e1',
      lineSpacing: 4,
    }).setDepth(21);

    this.add.text(width / 2, height - 18, 'MOUSE / ARROW KEYS: Slew Observatory  |  HOLD RETICLE ON TARGET TO INTEGRATE PHOTONS', {
      fontFamily: 'monospace',
      fontSize: '10.5px',
      color: '#94a3b8',
      backgroundColor: '#020617cc',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 0.5).setDepth(21);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.targetReticleX = pointer.x;
      this.targetReticleY = pointer.y;
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.targetReticleX = pointer.x;
      this.targetReticleY = pointer.y;
    });
  }

  /**
   * Authentic JWST Primary Mirror 18 Hexagonal Segments
   */
  private drawJWSTMirrorHexagons(width: number, height: number) {
    const g = this.jwstHexGfx;
    g.clear();

    const cx = width / 2;
    const cy = height / 2;
    const hexRadius = 38;

    const drawHex = (hx: number, hy: number) => {
      g.lineStyle(1.5, 0xd97706, 0.35); // Gold beryllium mirror seam
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const rad = (i * 60 * Math.PI) / 180;
        const x = hx + hexRadius * Math.cos(rad);
        const y = hy + hexRadius * Math.sin(rad);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.strokePath();

      // Subtle gold mirror specular glaze
      g.fillStyle(0xfde68a, 0.04);
      g.fillPath();
    };

    // 18 Hexagonal Segments arranged around central secondary mirror mast
    const dx = hexRadius * Math.sqrt(3);
    const dy = hexRadius * 1.5;

    const hexOffsets = [
      { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 1, r: 0 },
      { q: 0, r: 1 }, { q: -1, r: 1 }, { q: -1, r: 0 },
      { q: 0, r: -2 }, { q: 1, r: -2 }, { q: 2, r: -2 },
      { q: 2, r: -1 }, { q: 2, r: 0 }, { q: 1, r: 1 },
      { q: 0, r: 2 }, { q: -1, r: 2 }, { q: -2, r: 2 },
      { q: -2, r: 1 }, { q: -2, r: 0 }, { q: -1, r: -1 },
    ];

    for (const h of hexOffsets) {
      const px = cx + (h.q + h.r / 2) * dx * 0.85;
      const py = cy + h.r * dy * 0.85;
      drawHex(px, py);
    }
  }

  /**
   * Characteristic 6-point diffraction spikes of James Webb Space Telescope beryllium optics
   */
  private renderStellarSpikes(width: number, height: number) {
    this.starGfx.clear();
    this.diffractionSpikesGfx.clear();

    for (let i = 0; i < 180; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() < 0.88 ? 1 : 2.5;
      const alpha = Math.random() * 0.75 + 0.25;

      this.starGfx.fillStyle(0xffffff, alpha);
      this.starGfx.fillCircle(x, y, radius);

      // Brightest stars get 6-point diffraction spikes
      if (radius > 2.0 && Math.random() < 0.4) {
        this.diffractionSpikesGfx.lineStyle(1, 0x38bdf8, 0.45);
        for (let a = 0; a < 3; a++) {
          const rad = (a * 60 * Math.PI) / 180;
          const len = 22 + Math.random() * 18;
          this.diffractionSpikesGfx.lineBetween(
            x - Math.cos(rad) * len,
            y - Math.sin(rad) * len,
            x + Math.cos(rad) * len,
            y + Math.sin(rad) * len
          );
        }
      }
    }
  }

  update(_time: number, delta: number) {
    if (this.isGameOver) return;
    const dt = delta / 1000;

    this.timeRemaining -= dt;
    this.timerText.setText(`EXPOSURE CLOCK: ${Math.max(0, this.timeRemaining).toFixed(1)}S`);
    if (this.timeRemaining <= 10) {
      this.timerText.setColor('#ef4444');
    }

    if (this.timeRemaining <= 0) {
      this.isGameOver = true;
      this.cfg.onFailure('Observation window closed — Guide star lock lost.');
      return;
    }

    const speed = 340;
    if (this.cursors.left.isDown || this.keyA?.isDown) this.targetReticleX -= speed * dt;
    if (this.cursors.right.isDown || this.keyD?.isDown) this.targetReticleX += speed * dt;
    if (this.cursors.up.isDown || this.keyW?.isDown) this.targetReticleY -= speed * dt;
    if (this.cursors.down.isDown || this.keyS?.isDown) this.targetReticleY += speed * dt;

    this.targetReticleX = Phaser.Math.Clamp(this.targetReticleX, 60, 740);
    this.targetReticleY = Phaser.Math.Clamp(this.targetReticleY, 60, 540);

    this.noiseOffset += dt * 3.2;
    const shimmerAmp = (this.cfg.params.shimmerAmplitude || 0.15) * 14;
    const jitterX = Math.sin(this.noiseOffset) * shimmerAmp;
    const jitterY = Math.cos(this.noiseOffset * 1.3) * shimmerAmp;

    this.reticleX += (this.targetReticleX + jitterX - this.reticleX) * 0.2;
    this.reticleY += (this.targetReticleY + jitterY - this.reticleY) * 0.2;

    const currentTarget = this.targets[this.currentTargetIndex];
    if (!currentTarget) return;

    const dist = Phaser.Math.Distance.Between(this.reticleX, this.reticleY, currentTarget.x, currentTarget.y);
    const lockRadius = this.cfg.params.targetSizePx || 46;

    if (dist <= lockRadius) {
      const lockRate = 1 / (this.cfg.params.lockTimeSec || 2.0);
      this.lockProgress = Math.min(1, this.lockProgress + dt * lockRate);

      if (this.lockProgress >= 1) {
        currentTarget.solved = true;
        this.targetsCalibrated++;
        this.lockProgress = 0;

        this.triggerLockBurst(currentTarget.x, currentTarget.y, currentTarget.color);

        if (this.targetsCalibrated >= this.targets.length) {
          this.isGameOver = true;
          const score = Math.round(1000 + this.timeRemaining * 40);
          this.timeRemaining = 0;
          this.timerText.setText('SPECTRAL INTEGRATION COMPLETE ✓');
          this.timerText.setColor('#10b981');
          this.time.delayedCall(800, () => {
            this.cfg.onSuccess(score);
          });
          return;
        } else {
          this.currentTargetIndex++;
        }
      }
    } else {
      this.lockProgress = Math.max(0, this.lockProgress - dt * 1.6);
    }

    this.renderReticle(lockRadius, dist);
    this.renderTargets();
    this.updateHUD(currentTarget, dist);
  }

  private triggerLockBurst(x: number, y: number, color: number) {
    const flash = this.add.graphics().setDepth(15);
    flash.fillStyle(color, 0.7);
    flash.fillCircle(x, y, 45);

    // 6-Point Laser Spectrum Burst
    flash.lineStyle(2, 0xffffff, 0.9);
    for (let i = 0; i < 6; i++) {
      const rad = (i * 60 * Math.PI) / 180;
      flash.lineBetween(x, y, x + Math.cos(rad) * 60, y + Math.sin(rad) * 60);
    }

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.4,
      duration: 600,
      onComplete: () => flash.destroy(),
    });
  }

  private renderReticle(lockRadius: number, dist: number) {
    this.reticleGfx.clear();
    const rx = this.reticleX;
    const ry = this.reticleY;

    const locked = dist <= lockRadius;
    const color = locked ? (this.lockProgress > 0.8 ? 0x10b981 : 0x38bdf8) : 0x64748b;

    // Outer optical precision reticle ring
    this.reticleGfx.lineStyle(1.5, color, 0.9);
    this.reticleGfx.strokeCircle(rx, ry, lockRadius);
    this.reticleGfx.strokeCircle(rx, ry, 7);

    // Optical vernier ticks
    for (let i = 0; i < 12; i++) {
      const rad = (i * 30 * Math.PI) / 180;
      this.reticleGfx.lineBetween(
        rx + Math.cos(rad) * (lockRadius - 3),
        ry + Math.sin(rad) * (lockRadius - 3),
        rx + Math.cos(rad) * (lockRadius + 3),
        ry + Math.sin(rad) * (lockRadius + 3)
      );
    }

    // Crosshairs
    this.reticleGfx.lineBetween(rx - lockRadius - 16, ry, rx - 12, ry);
    this.reticleGfx.lineBetween(rx + 12, ry, rx + lockRadius + 16, ry);
    this.reticleGfx.lineBetween(rx, ry - lockRadius - 16, rx, ry - 12);
    this.reticleGfx.lineBetween(rx, ry + 12, rx, ry + lockRadius + 16);

    // Circular Photon Integration Progress Arc
    if (this.lockProgress > 0) {
      this.reticleGfx.lineStyle(4, 0x10b981, 0.95);
      this.reticleGfx.beginPath();
      const startAngle = Phaser.Math.DegToRad(-90);
      const endAngle = startAngle + Phaser.Math.DegToRad(360 * this.lockProgress);
      this.reticleGfx.arc(rx, ry, lockRadius + 6, startAngle, endAngle, false);
      this.reticleGfx.strokePath();
    }
  }

  private renderTargets() {
    this.targetGfx.clear();

    this.targets.forEach((t, idx) => {
      const isCurrent = idx === this.currentTargetIndex;

      if (t.solved) {
        this.targetGfx.lineStyle(2, 0x10b981, 0.8);
        this.targetGfx.strokeCircle(t.x, t.y, 16);
        this.targetGfx.fillStyle(0x10b981, 0.25);
        this.targetGfx.fillCircle(t.x, t.y, 16);
      } else if (isCurrent) {
        const pulse = 1 + Math.sin(this.time.now * 0.006) * 0.15;
        this.targetGfx.fillStyle(t.color, 0.35);
        this.targetGfx.fillCircle(t.x, t.y, 24 * pulse);

        // 6-Point JWST Diffraction Spikes around target
        this.targetGfx.lineStyle(1.5, t.color, 0.85);
        for (let a = 0; a < 3; a++) {
          const rad = (a * 60 * Math.PI) / 180;
          const len = 35 * pulse;
          this.targetGfx.lineBetween(
            t.x - Math.cos(rad) * len,
            t.y - Math.sin(rad) * len,
            t.x + Math.cos(rad) * len,
            t.y + Math.sin(rad) * len
          );
        }

        this.targetGfx.strokeCircle(t.x, t.y, 18);
        this.targetGfx.fillStyle(0xffffff, 1);
        this.targetGfx.fillCircle(t.x, t.y, 3.5);

        // Precision corner brackets
        const s = 25;
        this.targetGfx.lineStyle(1.5, t.color, 0.7);
        this.targetGfx.strokeRect(t.x - s, t.y - s, s * 2, s * 2);
      } else {
        this.targetGfx.fillStyle(0x475569, 0.6);
        this.targetGfx.fillCircle(t.x, t.y, 5);
      }
    });
  }

  private updateHUD(currentTarget: CelestialTarget, dist: number) {
    const lockPct = Math.round(this.lockProgress * 100);
    const targetStatus = dist <= (this.cfg.params.targetSizePx || 46)
      ? `[ INTEGRATING PHOTONS: ${lockPct}% | RMS JITTER: <0.02" ]`
      : `[ OFF-TARGET: Δ${Math.round(dist)}PX — SLEW FGS TO TARGET ]`;

    this.targetInfoText.setText(
      `TARGET [${this.currentTargetIndex + 1}/${this.targets.length}]: ${currentTarget.name}\n` +
      `SPECTRAL CLASS: ${currentTarget.type} | MAGNITUDE: +${currentTarget.magnitude}\n` +
      `OPTICAL STATUS: ${targetStatus}`
    );

    // Lateral Progress Bar
    this.hudGfx.clear();
    const barX = 760;
    const barY = 120;
    const barH = 200;
    this.hudGfx.fillStyle(0x020617, 0.88);
    this.hudGfx.fillRoundedRect(barX, barY, 14, barH, 4);
    this.hudGfx.lineStyle(1.5, 0x0284c7, 0.7);
    this.hudGfx.strokeRoundedRect(barX, barY, 14, barH, 4);

    const fillH = barH * this.lockProgress;
    this.hudGfx.fillStyle(this.lockProgress > 0.8 ? 0x10b981 : 0x38bdf8, 1);
    this.hudGfx.fillRoundedRect(barX + 2, barY + barH - fillH, 10, fillH, 3);
  }
}
