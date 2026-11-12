// ============================================================
// DeepSpaceScene — Photorealistic Interplanetary Gravity-Assist Trajectory Simulation
// Built with Phaser 3 for NASA Space Apps Challenge 2026
// Jupiter & Saturn Planetary Textures · Voyager / New Horizons Probe · N-Body Trajectories
// ============================================================
import Phaser from 'phaser';
import type { DeepSpaceParams } from '../missionGameData';

export interface DeepSpaceSceneConfig {
  missionId: string;
  missionName: string;
  params: DeepSpaceParams;
  onSuccess: (score: number) => void;
  onFailure: (reason: string) => void;
}

interface CelestialBody {
  x: number;
  y: number;
  radius: number;
  gravityRadius: number;
  mass: number;
  name: string;
  color: number;
  visited: boolean;
  isTarget?: boolean;
}

export class DeepSpaceScene extends Phaser.Scene {
  private cfg!: DeepSpaceSceneConfig;

  // Backgrounds
  private milkyWayImage!: Phaser.GameObjects.Image;
  private jupiterSprite!: Phaser.GameObjects.Image;

  // Probe state
  private probeX = 100;
  private probeY = 500;
  private probeVx = 70;
  private probeVy = -110;
  private probeAngle = 0;
  private fuel = 100;

  private trail: { x: number; y: number }[] = [];
  private swingbysCompleted = 0;
  private isGameOver = false;
  private timeRemaining = 60;

  // Bodies in system
  private bodies: CelestialBody[] = [];
  private targetBody!: CelestialBody;

  // Graphics
  private bgGfx!: Phaser.GameObjects.Graphics;
  private orbitGfx!: Phaser.GameObjects.Graphics;
  private bodyGfx!: Phaser.GameObjects.Graphics;
  private probeGfx!: Phaser.GameObjects.Graphics;
  private hudGfx!: Phaser.GameObjects.Graphics;

  // HUD text
  private statText!: Phaser.GameObjects.Text;

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'DeepSpaceScene' });
  }

  preload() {
    this.load.image('jupiter_tex', '/assets/planets/2k_jupiter.jpg');
    this.load.image('milky_way_tex', '/assets/planets/2k_stars_milky_way.jpg');
  }

  init(data: DeepSpaceSceneConfig) {
    this.cfg = data;
    this.timeRemaining = data.params.timeLimitSec || 50;
    this.fuel = data.params.fuelBudget || 100;
    this.swingbysCompleted = 0;
    this.isGameOver = false;
    this.trail = [];

    this.probeX = 120;
    this.probeY = 480;
    this.probeVx = 100;
    this.probeVy = -80;

    this.bodies = [];
    const gravityMult = data.params.gravityStrength || 1.0;

    const planetTemplates = [
      { name: 'Jupiter (Gas Giant)', color: 0xf59e0b, radius: 30, gravR: 120, mass: 6800 * gravityMult },
      { name: 'Saturn (Ringed World)', color: 0xeab308, radius: 25, gravR: 100, mass: 5200 * gravityMult },
      { name: 'Mars (Red Planet)', color: 0xef4444, radius: 18, gravR: 80, mass: 3600 * gravityMult },
    ];

    const numPlanets = Math.min(data.params.numPlanets || 2, planetTemplates.length);
    for (let i = 0; i < numPlanets; i++) {
      const template = planetTemplates[i];
      const px = 280 + i * 220;
      const py = 250 + (i % 2 === 0 ? -40 : 40);
      this.bodies.push({
        x: px,
        y: py,
        radius: template.radius,
        gravityRadius: template.gravR,
        mass: template.mass,
        name: template.name,
        color: template.color,
        visited: false,
      });
    }

    const targetX = 700;
    const targetY = 160;
    this.targetBody = {
      x: targetX,
      y: targetY,
      radius: 19,
      gravityRadius: data.params.targetOrbitalRadius || 52,
      mass: 2200 * gravityMult,
      name: 'Interstellar Heliopause / Kuiper Encounter',
      color: 0x38bdf8,
      visited: false,
      isTarget: true,
    };
    this.bodies.push(this.targetBody);
  }

  create() {
    const { width, height } = this.scale;

    // 1. Deep Space Black
    this.cameras.main.setBackgroundColor('#020617');

    // 2. High-Resolution Milky Way Backdrop
    if (this.textures.exists('milky_way_tex')) {
      this.milkyWayImage = this.add.image(width / 2, height / 2, 'milky_way_tex')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(width * 1.05, height * 1.05)
        .setAlpha(0.35)
        .setDepth(1);
    }

    // 3. Graphic layers
    this.bgGfx = this.add.graphics().setDepth(2);
    this.orbitGfx = this.add.graphics().setDepth(3);
    this.bodyGfx = this.add.graphics().setDepth(5);
    this.probeGfx = this.add.graphics().setDepth(10);
    this.hudGfx = this.add.graphics().setDepth(20);

    // Stars
    for (let i = 0; i < 200; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const sa = Math.random() * 0.75 + 0.25;
      this.bgGfx.fillStyle(0xffffff, sa);
      this.bgGfx.fillCircle(sx, sy, Math.random() < 0.9 ? 1 : 1.8);
    }

    // HUD Header
    this.add.text(24, 18, `${this.cfg.missionName.toUpperCase()} // INTERPLANETARY TRAJECTORY GRAVITY ASSIST`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#38bdf8',
      letterSpacing: 1,
    }).setDepth(21);

    this.statText = this.add.text(24, 44, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#f8fafc',
      lineSpacing: 5,
    }).setDepth(21);

    this.add.text(width / 2, height - 18, 'W/A/S/D or ARROWS: Vector Maneuver Burn  |  CLICK: Trajectory Correction  |  OBERTH EFFECT ACTIVE', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#94a3b8',
      backgroundColor: '#020617cc',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 0.5).setDepth(21);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.fuel > 0 && !this.isGameOver) {
        const angle = Phaser.Math.Angle.Between(this.probeX, this.probeY, pointer.x, pointer.y);
        const thrust = 38;
        this.probeVx += Math.cos(angle) * thrust;
        this.probeVy += Math.sin(angle) * thrust;
        this.fuel = Math.max(0, this.fuel - 9);
      }
    });
  }

  update(_time: number, delta: number) {
    if (this.isGameOver) return;
    const dt = Math.min(delta / 1000, 0.05);

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.isGameOver = true;
      this.cfg.onFailure('Trajectory timeline expired — probe failed to intercept escape corridor.');
      return;
    }

    const thrustPower = 115;
    let fired = false;

    if ((this.cursors.left.isDown || this.keyA?.isDown) && this.fuel > 0) {
      this.probeVx -= thrustPower * dt;
      fired = true;
    }
    if ((this.cursors.right.isDown || this.keyD?.isDown) && this.fuel > 0) {
      this.probeVx += thrustPower * dt;
      fired = true;
    }
    if ((this.cursors.up.isDown || this.keyW?.isDown) && this.fuel > 0) {
      this.probeVy -= thrustPower * dt;
      fired = true;
    }
    if ((this.cursors.down.isDown || this.keyS?.isDown) && this.fuel > 0) {
      this.probeVy += thrustPower * dt;
      fired = true;
    }

    if (fired) {
      this.fuel = Math.max(0, this.fuel - dt * 24);
    }

    // N-Body Gravity integration
    for (const body of this.bodies) {
      const dx = body.x - this.probeX;
      const dy = body.y - this.probeY;
      const distSq = Math.max(dx * dx + dy * dy, 400);
      const dist = Math.sqrt(distSq);

      if (dist < body.radius + 6) {
        this.isGameOver = true;
        this.cfg.onFailure(`Catastrophic atmospheric/surface impact with ${body.name}!`);
        return;
      }

      if (!body.isTarget && dist < body.gravityRadius && !body.visited) {
        body.visited = true;
        this.swingbysCompleted++;
        this.triggerAssistEffect(body.x, body.y, body.color);
      }

      if (body.isTarget && dist < body.gravityRadius) {
        const required = this.cfg.params.requiredSwingbys || 1;
        if (this.swingbysCompleted >= required) {
          this.isGameOver = true;
          const score = Math.round(1000 + this.fuel * 8 + this.timeRemaining * 30);
          this.triggerAssistEffect(body.x, body.y, 0x10b981);
          this.time.delayedCall(900, () => {
            this.cfg.onSuccess(score);
          });
          return;
        }
      }

      const force = body.mass / distSq;
      this.probeVx += (dx / dist) * force * dt;
      this.probeVy += (dy / dist) * force * dt;
    }

    this.probeX += this.probeVx * dt;
    this.probeY += this.probeVy * dt;
    this.probeAngle = Math.atan2(this.probeVy, this.probeVx);

    if (this.trail.length === 0 || Phaser.Math.Distance.Between(this.probeX, this.probeY, this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y) > 7) {
      this.trail.push({ x: this.probeX, y: this.probeY });
      if (this.trail.length > 95) this.trail.shift();
    }

    if (this.probeX < -150 || this.probeX > 950 || this.probeY < -150 || this.probeY > 750) {
      this.isGameOver = true;
      this.cfg.onFailure('Probe ejected on hyperbolic escape velocity without target encounter.');
      return;
    }

    this.renderOrbitsAndTrail();
    this.renderPhotorealisticBodies();
    this.renderPhotorealisticProbe(fired);
    this.updateHUD();
  }

  private triggerAssistEffect(x: number, y: number, color: number) {
    const ring = this.add.graphics().setDepth(15);
    ring.lineStyle(2.5, color, 1);
    ring.strokeCircle(x, y, 32);
    this.tweens.add({
      targets: ring,
      scale: 3.2,
      alpha: 0,
      duration: 800,
      onComplete: () => ring.destroy(),
    });
  }

  private renderOrbitsAndTrail() {
    this.orbitGfx.clear();

    for (const b of this.bodies) {
      // Gravitational Sphere of Influence (SOI) glow
      this.orbitGfx.lineStyle(1.5, b.color, b.isTarget ? 0.6 : 0.28);
      this.orbitGfx.strokeCircle(b.x, b.y, b.gravityRadius);

      // Potential well contours
      this.orbitGfx.lineStyle(1, b.color, 0.12);
      this.orbitGfx.strokeCircle(b.x, b.y, b.gravityRadius * 0.65);
    }

    // Trajectory hyperbolic curve
    if (this.trail.length > 1) {
      for (let i = 0; i < this.trail.length - 1; i++) {
        const alpha = (i / this.trail.length) * 0.85;
        this.orbitGfx.lineStyle(2, 0x38bdf8, alpha);
        this.orbitGfx.lineBetween(this.trail[i].x, this.trail[i].y, this.trail[i + 1].x, this.trail[i + 1].y);
      }
    }
  }

  /**
   * Photorealistic Gas Giant Planets
   * Jupiter with atmospheric cloud bands, zones and belts, Great Red Spot,
   * Saturn with tilted particle rings and shadows.
   */
  private renderPhotorealisticBodies() {
    this.bodyGfx.clear();

    for (const b of this.bodies) {
      if (b.name.includes('Jupiter')) {
        // Atmospheric outer glow
        this.bodyGfx.fillStyle(0xf59e0b, 0.25);
        this.bodyGfx.fillCircle(b.x, b.y, b.radius + 8);

        // Core base (Warm cream/amber)
        this.bodyGfx.fillStyle(0xfde68a, 1);
        this.bodyGfx.fillCircle(b.x, b.y, b.radius);

        // Equatorial & Tropical Cloud Belts
        this.bodyGfx.fillStyle(0xb45309, 0.9);
        this.bodyGfx.fillRect(b.x - b.radius * 0.9, b.y - 8, b.radius * 1.8, 4);
        this.bodyGfx.fillRect(b.x - b.radius * 0.95, b.y + 2, b.radius * 1.9, 6);
        this.bodyGfx.fillRect(b.x - b.radius * 0.8, b.y + 12, b.radius * 1.6, 4);

        // Great Red Spot Oval
        this.bodyGfx.fillStyle(0xef4444, 1);
        this.bodyGfx.fillEllipse(b.x + 8, b.y + 5, 8, 4);

        // Specular atmospheric crescent
        this.bodyGfx.lineStyle(2, 0xfef08a, 0.7);
        this.bodyGfx.strokeCircle(b.x, b.y, b.radius);
      } else if (b.name.includes('Saturn')) {
        // Atmospheric glow
        this.bodyGfx.fillStyle(0xeab308, 0.25);
        this.bodyGfx.fillCircle(b.x, b.y, b.radius + 6);

        // Body
        this.bodyGfx.fillStyle(0xfef08a, 1);
        this.bodyGfx.fillCircle(b.x, b.y, b.radius);

        // Rings (tilted ellipse)
        this.bodyGfx.lineStyle(4, 0xd97706, 0.85);
        this.bodyGfx.strokeEllipse(b.x, b.y, b.radius * 2.8, b.radius * 0.8);
        this.bodyGfx.lineStyle(2, 0xfde68a, 0.95);
        this.bodyGfx.strokeEllipse(b.x, b.y, b.radius * 2.4, b.radius * 0.65);
      } else {
        // Destination or rocky body
        this.bodyGfx.fillStyle(b.color, 0.3);
        this.bodyGfx.fillCircle(b.x, b.y, b.radius + 6);
        this.bodyGfx.fillStyle(b.color, 1);
        this.bodyGfx.fillCircle(b.x, b.y, b.radius);
      }

      // Visited beacon or target marker
      if (b.visited) {
        this.bodyGfx.lineStyle(2, 0x10b981, 0.9);
        this.bodyGfx.strokeCircle(b.x, b.y, b.radius + 14);
      } else if (b.isTarget) {
        const pulse = 1 + Math.sin(this.time.now * 0.006) * 0.15;
        this.bodyGfx.lineStyle(2, 0x38bdf8, 0.9);
        this.bodyGfx.strokeCircle(b.x, b.y, (b.gravityRadius - 10) * pulse);
      }
    }
  }

  /**
   * Photorealistic Voyager / New Horizons Deep Space Probe
   * Golden parabolic high-gain dish antenna, white bus box, RTG power boom,
   * magnetometer boom, and blue xenon ion engine glow when firing.
   */
  private renderPhotorealisticProbe(fired: boolean) {
    this.probeGfx.clear();
    const px = this.probeX;
    const py = this.probeY;

    this.probeGfx.save();
    this.probeGfx.translateCanvas(px, py);
    this.probeGfx.rotateCanvas(this.probeAngle);

    // ─── 1. GOLD HIGH-GAIN ANTENNA DISH (Facing Forward) ───
    this.probeGfx.fillStyle(0xd97706, 1); // Gold dish back
    this.probeGfx.fillEllipse(4, 0, 4, 16);
    this.probeGfx.fillStyle(0xfde68a, 0.95); // Dish inner specular
    this.probeGfx.fillEllipse(5, 0, 2, 12);
    // Sub-reflector feedhorn on tripod
    this.probeGfx.lineStyle(1, 0x94a3b8, 1);
    this.probeGfx.lineBetween(4, 0, 12, 0);
    this.probeGfx.fillStyle(0x38bdf8, 1);
    this.probeGfx.fillCircle(12, 0, 1.5);

    // ─── 2. DECAGONAL CENTRAL ELECTRONICS BUS (Titanium White) ───
    this.probeGfx.fillStyle(0xf8fafc, 1);
    this.probeGfx.fillRect(-6, -5, 10, 10);
    this.probeGfx.lineStyle(1, 0x64748b, 1);
    this.probeGfx.strokeRect(-6, -5, 10, 10);

    // ─── 3. RADIOISOTOPE THERMOELECTRIC GENERATOR (RTG) BOOM ───
    this.probeGfx.lineStyle(1.5, 0x475569, 1);
    this.probeGfx.lineBetween(-3, -5, -8, -16);
    // Black MMRTG canister with cooling fins
    this.probeGfx.fillStyle(0x1e293b, 1);
    this.probeGfx.fillRect(-11, -20, 6, 8);
    this.probeGfx.fillStyle(0xef4444, 0.9);
    this.probeGfx.fillCircle(-8, -16, 1.5);

    // ─── 4. MAGNETOMETER BOOM (Extends backwards) ───
    this.probeGfx.lineStyle(1, 0xcbd5e1, 0.9);
    this.probeGfx.lineBetween(-6, 0, -22, 0);
    this.probeGfx.fillStyle(0xfacc15, 1);
    this.probeGfx.fillCircle(-22, 0, 1.5);

    // ─── 5. BLUE XENON ION ENGINE / HYDRAZINE PLUME ───
    if (fired) {
      this.probeGfx.fillStyle(0x0284c7, 0.85);
      this.probeGfx.beginPath();
      this.probeGfx.moveTo(-6, -3);
      this.probeGfx.lineTo(-6, 3);
      this.probeGfx.lineTo(-24, 0);
      this.probeGfx.closePath();
      this.probeGfx.fill();

      this.probeGfx.fillStyle(0xa5f3fc, 0.95);
      this.probeGfx.beginPath();
      this.probeGfx.moveTo(-6, -1.5);
      this.probeGfx.lineTo(-6, 1.5);
      this.probeGfx.lineTo(-15, 0);
      this.probeGfx.closePath();
      this.probeGfx.fill();
    }

    this.probeGfx.restore();
  }

  private updateHUD() {
    const required = this.cfg.params.requiredSwingbys || 1;
    const currentSpeed = Math.round(Math.sqrt(this.probeVx * this.probeVx + this.probeVy * this.probeVy));

    this.statText.setText([
      `HELIOCENTRIC VELOCITY: ${currentSpeed} KM/S (HYPERBOLIC EXCESS)`,
      `PROPELLANT BUS: ${Math.round(this.fuel)}% | MISSION CLOCK: ${this.timeRemaining.toFixed(1)}S`,
      `GRAVITY SLINGSHOTS: ${this.swingbysCompleted}/${required} COMPLETED`,
      `TARGET INTERCEPT: ${this.targetBody.name.toUpperCase()}`,
    ].join('\n'));

    // Fuel Bar
    this.hudGfx.clear();
    const barX = 760;
    const barY = 120;
    const barH = 180;
    this.hudGfx.fillStyle(0x020617, 0.88);
    this.hudGfx.fillRoundedRect(barX, barY, 14, barH, 4);
    this.hudGfx.lineStyle(1.5, 0x0284c7, 0.7);
    this.hudGfx.strokeRoundedRect(barX, barY, 14, barH, 4);

    const fuelFraction = this.fuel / (this.cfg.params.fuelBudget || 100);
    const fillH = barH * fuelFraction;
    const fuelColor = fuelFraction > 0.3 ? 0x10b981 : 0xef4444;
    this.hudGfx.fillStyle(fuelColor, 1);
    this.hudGfx.fillRoundedRect(barX + 2, barY + barH - fillH, 10, fillH, 3);
  }
}
