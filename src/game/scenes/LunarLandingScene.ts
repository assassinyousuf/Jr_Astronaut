// ============================================================
// LunarLandingScene — Photorealistic Apollo / Artemis Terminal Landing Simulation
// Built with Phaser 3 for NASA Space Apps Challenge 2026
// Earthrise Backdrop · Apollo Lunar Module Foil · Regolith Dust Kick-Up
// ============================================================
import Phaser from 'phaser';
import type { LunarLandingParams } from '../missionGameData';

export interface LunarLandingSceneConfig {
  missionId: string;
  missionName: string;
  params: LunarLandingParams;
  onSuccess: (score: number) => void;
  onFailure: (reason: string) => void;
}

export class LunarLandingScene extends Phaser.Scene {
  private cfg!: LunarLandingSceneConfig;

  // Backgrounds
  private earthriseSprite!: Phaser.GameObjects.Image;
  private lunarSurfaceTile!: Phaser.GameObjects.TileSprite;
  private starsGfx!: Phaser.GameObjects.Graphics;

  // Lander state
  private lx = 0;
  private ly = 0;
  private vx = 0;
  private vy = 0;
  private fuel = 100;
  private angle = 0; // degrees
  private angularVel = 0;
  private isThrusting = false;
  private timeElapsed = 0;
  private done = false;

  // Terrain & Hazards
  private terrainPoints: { x: number; y: number }[] = [];
  private targetX = 0;
  private groundY = 0;
  private hazardZones: { x: number; w: number }[] = [];

  // Graphics
  private terrainGfx!: Phaser.GameObjects.Graphics;
  private landerGfx!: Phaser.GameObjects.Graphics;
  private landerContainer!: Phaser.GameObjects.Container;
  private flameGfx!: Phaser.GameObjects.Graphics;
  private rcsFlameGfx!: Phaser.GameObjects.Graphics;
  private targetMarker!: Phaser.GameObjects.Graphics;
  private dustGfx!: Phaser.GameObjects.Graphics;
  private dustParticles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; life: number }[] = [];
  private exhaustParticles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; life: number }[] = [];

  // HUD
  private hudText!: Phaser.GameObjects.Text;
  private warningText!: Phaser.GameObjects.Text;
  private contactLightGfx!: Phaser.GameObjects.Graphics;

  // Camera scroll
  private worldOffsetY = 0;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'LunarLandingScene' });
  }

  preload() {
    this.load.image('earth_from_moon', '/assets/bg/earth_from_moon.jpg');
    this.load.image('lunar_surface', '/assets/bg/lunar_surface.jpg');
  }

  init(data: LunarLandingSceneConfig) {
    this.cfg = data;
    this.fuel = this.cfg.params.fuelCapacity;
    this.vx = 0;
    this.vy = 0.6;
    this.angle = 0;
    this.angularVel = 0;
    this.timeElapsed = 0;
    this.done = false;
    this.terrainPoints = [];
    this.dustParticles = [];
    this.exhaustParticles = [];
  }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.groundY = H - 85;
    this.lx = W / 2;
    this.ly = 65;
    this.worldOffsetY = 0;

    // 1. Realistic Deep Space Vacuum Background (Pitch black with stars)
    this.cameras.main.setBackgroundColor('#020617');

    // 2. Stars
    this.starsGfx = this.add.graphics().setDepth(1);
    this.starsGfx.fillStyle(0xffffff, 1);
    for (let i = 0; i < 200; i++) {
      const a = Math.random() * 0.8 + 0.2;
      this.starsGfx.fillStyle(0xffffff, a);
      this.starsGfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.65), Math.random() * 1.5 + 0.3);
    }

    // 3. Majestic Apollo Earthrise Backdrop
    if (this.textures.exists('earth_from_moon')) {
      this.earthriseSprite = this.add.image(W * 0.78, H * 0.22, 'earth_from_moon')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(180, 120)
        .setAlpha(0.92)
        .setDepth(2);
    }

    // 4. Build Procedural Lunar Terrain with Cratering
    this.buildTerrain(W);

    // 5. Terrain Graphic Layers
    this.terrainGfx = this.add.graphics().setDepth(3);
    this.targetMarker = this.add.graphics().setDepth(4);
    this.dustGfx = this.add.graphics().setDepth(6);

    // 6. Photorealistic Apollo Lunar Module (LM)
    this.landerContainer = this.add.container(this.lx, this.ly).setDepth(10);
    this.flameGfx = this.add.graphics();
    this.rcsFlameGfx = this.add.graphics();
    this.landerGfx = this.add.graphics();
    this.drawPhotorealisticLunarModule(this.landerGfx);
    this.landerContainer.add([this.flameGfx, this.rcsFlameGfx, this.landerGfx]);

    // 7. Apollo Guidance Computer (AGC) Terminal Descent HUD
    this.buildApolloHUD(W, H);

    // 8. Warning text
    this.warningText = this.add.text(W / 2, H - 36, '', {
      fontFamily: 'monospace',
      fontSize: '12.5px',
      color: '#ef4444',
      backgroundColor: '#020617cc',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setDepth(25);

    // 9. Input & Controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.buildTouchControls(W, H);

    // Instructions
    this.add.text(W / 2, H - 16, '↑/SPACE: Descent Engine  |  A/D or ←/→: Attitude RCS  |  Max Impact: < 2.5 m/s', {
      fontFamily: 'monospace',
      fontSize: '10.5px',
      color: '#94a3b8',
      backgroundColor: '#020617d0',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5).setDepth(25);
  }

  private buildTerrain(W: number) {
    const pts: { x: number; y: number }[] = [];
    const numPts = 26;
    const segW = W / (numPts - 1);

    const tIdx = Math.floor(numPts * 0.52);
    this.targetX = tIdx * segW;

    for (let i = 0; i < numPts; i++) {
      let y = this.groundY;
      const isTarget = Math.abs(i - tIdx) <= 1;
      if (!isTarget) {
        const roughness = this.cfg.params.hasTerrainHazards ? Phaser.Math.Between(-35, 35) : Phaser.Math.Between(-14, 14);
        y += roughness;
      }
      pts.push({ x: i * segW, y });
    }
    this.terrainPoints = pts;

    // Place boulder hazards
    this.hazardZones = [];
    if (this.cfg.params.hasTerrainHazards) {
      for (let i = 0; i < 4; i++) {
        const hx = Phaser.Math.Between(30, W - 30);
        if (Math.abs(hx - this.targetX) > 75) {
          this.hazardZones.push({ x: hx, w: Phaser.Math.Between(24, 48) });
        }
      }
    }
  }

  /**
   * Authentic Apollo Lunar Module (LM)
   * Wrinkled gold Kapton foil descent stage, black Inconel panels, faceted ascent cabin,
   * 4 outrigger landing gear with footpads and contact probes.
   */
  private drawPhotorealisticLunarModule(g: Phaser.GameObjects.Graphics) {
    g.clear();

    // ─── 1. DESCENT STAGE (Octagonal wrapped in Gold Kapton & Black Inconel) ───
    // Gold aluminized Mylar foil base
    g.fillStyle(0xd97706, 1);
    g.fillRect(-16, -6, 32, 18);

    // Wrinkled foil specular highlights
    g.fillStyle(0xfde68a, 0.95);
    g.fillRect(-14, -5, 10, 8);
    g.fillRect(3, 1, 9, 7);

    // Black Inconel heat shield thermal blankets
    g.fillStyle(0x0f172a, 1);
    g.fillRect(-15, 3, 8, 8);
    g.fillRect(5, -5, 8, 5);

    // Descent Stage Equipment Bay & Modular MESA compartment
    g.lineStyle(1, 0x78350f, 0.9);
    g.strokeRect(-16, -6, 32, 18);

    // Niobium-alloy Descent Engine Bell Nozzle
    g.fillStyle(0x334155, 1);
    g.beginPath();
    g.moveTo(-6, 12);
    g.lineTo(6, 12);
    g.lineTo(9, 21);
    g.lineTo(-9, 21);
    g.closePath();
    g.fill();

    // Glowing interior throat
    g.fillStyle(0xf97316, 0.9);
    g.fillEllipse(0, 20, 10, 3);

    // ─── 2. ASCENT STAGE (Command Cabin) ───
    // Cylindrical center and faceted cockpit
    g.fillStyle(0x94a3b8, 1); // Shaded aluminum
    g.fillRect(-11, -26, 22, 20);

    g.fillStyle(0xe2e8f0, 1); // Lit cockpit hull
    g.fillRect(-11, -26, 15, 20);

    // Apollo Triangular EVA Cockpit Windows (Antireflective coated dark glass)
    g.fillStyle(0x0284c7, 0.9);
    g.beginPath();
    g.moveTo(-8, -19);
    g.lineTo(-3, -19);
    g.lineTo(-6, -13);
    g.closePath();
    g.fill();

    g.beginPath();
    g.moveTo(3, -19);
    g.lineTo(8, -19);
    g.lineTo(6, -13);
    g.closePath();
    g.fill();

    // Window frame glare
    g.lineStyle(1, 0x38bdf8, 0.9);
    g.strokeCircle(-5.5, -16, 2);
    g.strokeCircle(5.5, -16, 2);

    // Forward EVA Hatch and Porch
    g.fillStyle(0x475569, 1);
    g.fillRect(-3, -12, 6, 8);
    g.fillStyle(0xf59e0b, 1);
    g.fillRect(-4, -4, 8, 2); // EVA porch shelf

    // S-Band Steerable High Gain Antenna Dish on Roof
    g.lineStyle(1.5, 0xcbd5e1, 1);
    g.lineBetween(6, -26, 10, -33);
    g.fillStyle(0xf1f5f9, 1);
    g.fillCircle(11, -34, 3);

    // ─── 3. RCS THRUSTER CLUSTERS (4-way Quads) ───
    const drawRCSQuad = (qx: number, qy: number) => {
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(qx, qy, 2.5);
      g.fillStyle(0x64748b, 1);
      g.fillRect(qx - 4, qy - 1, 8, 2);
      g.fillRect(qx - 1, qy - 4, 2, 8);
    };
    drawRCSQuad(-14, -14);
    drawRCSQuad(14, -14);

    // ─── 4. 4-LEGGED LANDING GEAR WITH CONTACT PROBES ───
    g.lineStyle(2, 0xd97706, 1); // Gold foil strut wrapping
    // Left primary outrigger strut
    g.lineBetween(-16, 10, -26, 25);
    g.lineBetween(-8, 12, -26, 25);

    // Right primary outrigger strut
    g.lineBetween(16, 10, 26, 25);
    g.lineBetween(8, 12, 26, 25);

    // Circular Lunar Footpads
    g.fillStyle(0xd97706, 1);
    g.fillEllipse(-26, 25, 10, 4);
    g.fillEllipse(26, 25, 10, 4);
    g.lineStyle(1, 0xfde68a, 1);
    g.strokeEllipse(-26, 25, 10, 4);
    g.strokeEllipse(26, 25, 10, 4);

    // Lunar Surface Contact Sensing Probes (5-foot wire sensor extending below pads)
    g.lineStyle(1, 0x94a3b8, 0.85);
    g.lineBetween(-26, 27, -26, 38);
    g.lineBetween(26, 27, 26, 38);

    // Forward crew ladder on left strut
    g.lineStyle(1, 0x94a3b8, 1);
    g.lineBetween(-5, -4, -22, 23);
    for (let r = 0; r < 5; r++) {
      const rx = -5 - r * 3.4;
      const ry = -4 + r * 5.2;
      g.lineBetween(rx - 2, ry, rx + 2, ry);
    }
  }

  private drawTerrain() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const g = this.terrainGfx;
    g.clear();

    const pts = this.terrainPoints.map((p) => ({ x: p.x, y: p.y + this.worldOffsetY }));

    // 1. Lunar Surface Regolith Fill (Deep charcoal basalt with subtle gradients)
    g.fillStyle(0x334155, 1);
    g.beginPath();
    g.moveTo(0, H);
    for (const p of pts) {
      g.lineTo(p.x, p.y);
    }
    g.lineTo(W, H);
    g.closePath();
    g.fillPath();

    // 2. High-contrast Lunar Crater Surface Line (Sunlit rim specular)
    g.lineStyle(2.5, 0x94a3b8, 1);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.strokePath();

    // 3. Impact Craters on Surface
    for (let i = 2; i < pts.length - 2; i += 3) {
      const cx = pts[i].x;
      const cy = pts[i].y + 12;
      g.fillStyle(0x1e293b, 0.9);
      g.fillEllipse(cx, cy, 32, 10);
      g.lineStyle(1, 0x64748b, 0.7);
      g.strokeEllipse(cx, cy, 32, 10);
    }

    // 4. Hazardous Basalt Boulders
    for (const hz of this.hazardZones) {
      const groundPt = this.getGroundY(hz.x) + this.worldOffsetY;
      // Shadow
      g.fillStyle(0x0f172a, 0.95);
      g.fillEllipse(hz.x + 8, groundPt, hz.w * 1.1, 8);
      // Rock
      g.fillStyle(0x64748b, 1);
      g.fillEllipse(hz.x, groundPt - 10, hz.w, 18);
      g.fillStyle(0x94a3b8, 1);
      g.fillEllipse(hz.x - 3, groundPt - 12, hz.w * 0.5, 10);
    }

    // 5. High-Precision Landing Zone (LZ) Target Grid
    this.targetMarker.clear();
    const tGround = this.getGroundY(this.targetX) + this.worldOffsetY;
    const tw = this.cfg.params.targetZoneWidthPx;
    const altM = Math.max(0, (tGround - (this.ly + 25)));
    const isOptimal = altM < 60;

    // Glowing target pad
    this.targetMarker.fillStyle(isOptimal ? 0x22c55e : 0x0284c7, 0.25);
    this.targetMarker.fillRect(this.targetX - tw / 2, tGround - 12, tw, 16);
    this.targetMarker.lineStyle(2, isOptimal ? 0x22c55e : 0x38bdf8, 0.9);
    this.targetMarker.strokeRect(this.targetX - tw / 2, tGround - 12, tw, 16);

    // Target laser beacon line
    this.targetMarker.lineStyle(1.5, isOptimal ? 0x22c55e : 0x38bdf8, 0.6);
    this.targetMarker.lineBetween(this.targetX, tGround - 12, this.targetX, tGround - 70);

    // LZ Label
    this.targetMarker.fillStyle(isOptimal ? 0x22c55e : 0x38bdf8, 1);
    this.targetMarker.fillCircle(this.targetX, tGround - 12, 3);
  }

  private getGroundY(x: number): number {
    const pts = this.terrainPoints;
    for (let i = 0; i < pts.length - 1; i++) {
      if (x >= pts[i].x && x <= pts[i + 1].x) {
        const t = (x - pts[i].x) / (pts[i + 1].x - pts[i].x);
        return pts[i].y + t * (pts[i + 1].y - pts[i].y);
      }
    }
    return this.groundY;
  }

  private buildApolloHUD(_W: number, _H: number) {
    const panel = this.add.graphics().setDepth(20);
    panel.fillStyle(0x020617, 0.88);
    panel.fillRoundedRect(12, 12, 230, 140, 10);
    panel.lineStyle(1.5, 0x0284c7, 0.6);
    panel.strokeRoundedRect(12, 12, 230, 140, 10);

    const title = this.add.text(22, 18, 'APOLLO AGC // PROG 66 TERMINAL DESCENT', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#38bdf8',
      letterSpacing: 1,
    }).setDepth(21);

    this.hudText = this.add.text(22, 34, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#f8fafc',
      lineSpacing: 5,
    }).setDepth(21);

    this.contactLightGfx = this.add.graphics().setDepth(22);
  }

  private buildTouchControls(W: number, H: number) {
    const btnStyle = { fontFamily: 'monospace', fontSize: '20px', color: '#38bdf8', fontWeight: 'bold' };

    const makeBtn = (x: number, y: number, label: string, cb: () => void) => {
      const g = this.add.graphics().setDepth(30);
      g.fillStyle(0x0f172a, 0.85);
      g.fillRoundedRect(-26, -26, 52, 52, 10);
      g.lineStyle(1.5, 0x0284c7, 0.7);
      g.strokeRoundedRect(-26, -26, 52, 52, 10);
      const t = this.add.text(0, 0, label, btnStyle).setOrigin(0.5).setDepth(31);
      const zone = this.add.zone(x, y, 52, 52).setInteractive().setDepth(32);
      zone.on('pointerdown', cb);
      g.x = x; g.y = y; t.x = x; t.y = y;
    };

    makeBtn(W / 2, H - 45, '▲', () => { this.isThrusting = true; });
    makeBtn(W / 2 - 70, H - 45, '◄', () => { this.angularVel -= 40; });
    makeBtn(W / 2 + 70, H - 45, '►', () => { this.angularVel += 40; });
  }

  update(_time: number, delta: number) {
    if (this.done) return;
    const dt = delta / 1000;
    this.timeElapsed += dt;

    this.handleInput(dt);
    this.applyPhysics(dt);
    this.updateParticles(dt);
    this.drawTerrain();
    this.updateLander();
    this.checkLanding();
    this.updateHUD();

    if (this.timeElapsed > this.cfg.params.timeLimitSec) {
      this.fail('Mission time limit exceeded — terminal propellant exhausted.');
    }
  }

  private handleInput(dt: number) {
    this.isThrusting = false;

    if (this.cursors.up!.isDown || this.input.keyboard!.checkDown(this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), 0)) {
      this.isThrusting = true;
    }

    if (this.cursors.left!.isDown || this.keyA.isDown) {
      this.angularVel -= 55 * dt;
    }
    if (this.cursors.right!.isDown || this.keyD.isDown) {
      this.angularVel += 55 * dt;
    }

    this.angularVel *= Math.pow(0.88, dt * 60);
    this.angle += this.angularVel * dt;
  }

  private applyPhysics(dt: number) {
    const g = this.cfg.params.gravity;
    this.vy += g * dt;

    if (this.cfg.params.windDrift > 0) {
      this.vx += Math.sin(this.timeElapsed * 0.25) * this.cfg.params.windDrift * dt;
    }

    if (this.isThrusting && this.fuel > 0) {
      const thrust = 15.5; // m/s²
      const rad = Phaser.Math.DegToRad(this.angle - 90);
      this.vx += Math.cos(rad) * thrust * dt;
      this.vy += Math.sin(rad) * thrust * dt;
      this.fuel = Math.max(0, this.fuel - 11 * dt);

      // Spawn exhaust particles
      const radEx = Phaser.Math.DegToRad(this.angle + 90);
      for (let i = 0; i < 2; i++) {
        this.exhaustParticles.push({
          x: this.lx + Math.cos(radEx) * 24 + (Math.random() - 0.5) * 4,
          y: this.ly + Math.sin(radEx) * 24 + (Math.random() - 0.5) * 4,
          vx: Math.cos(radEx) * 80 + (Math.random() - 0.5) * 25,
          vy: Math.sin(radEx) * 80 + (Math.random() - 0.5) * 25,
          radius: 2 + Math.random() * 3,
          alpha: 0.9,
          life: 0.6,
        });
      }
    }

    if (this.fuel <= 0) this.isThrusting = false;

    this.lx += this.vx * dt * 48;
    this.ly += this.vy * dt * 48;

    // Scroll world camera
    const H = this.cameras.main.height;
    const targetY = H * 0.38;
    const diff = this.ly - targetY;
    if (diff > 0) {
      this.worldOffsetY -= diff * 0.06;
      this.ly -= diff * 0.06;
    }

    const W = this.cameras.main.width;
    this.lx = Phaser.Math.Clamp(this.lx, 25, W - 25);

    // Regolith Lunar Dust Ejection below 40 meters
    const groundY = this.getGroundY(this.lx) + this.worldOffsetY;
    const altAboveGround = groundY - (this.ly + 25);
    if (altAboveGround < 45 && this.isThrusting) {
      this.spawnLunarDust(this.lx, groundY, 1 - altAboveGround / 45);
    }
  }

  private spawnLunarDust(x: number, y: number, intensity: number) {
    for (let i = 0; i < 3; i++) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      this.dustParticles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y - 2,
        vx: dir * (40 + Math.random() * 80 * intensity),
        vy: -Math.random() * 20 * intensity,
        radius: 3 + Math.random() * 5,
        alpha: 0.7 * intensity,
        life: 0.8,
      });
    }
  }

  private updateParticles(dt: number) {
    this.dustGfx.clear();

    // 1. Exhaust Plume
    for (let i = this.exhaustParticles.length - 1; i >= 0; i--) {
      const p = this.exhaustParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt * 1.5;
      p.life -= dt;
      if (p.life <= 0 || p.alpha <= 0) {
        this.exhaustParticles.splice(i, 1);
        continue;
      }
      this.dustGfx.fillStyle(0xfde047, p.alpha * 0.75);
      this.dustGfx.fillCircle(p.x, p.y + this.worldOffsetY * 0.1, p.radius);
    }

    // 2. Lunar Regolith Dust Sheets (Realistic vacuum high-velocity sheets)
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const p = this.dustParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.radius += 8 * dt;
      p.alpha -= dt * 1.0;
      p.life -= dt;
      if (p.life <= 0 || p.alpha <= 0) {
        this.dustParticles.splice(i, 1);
        continue;
      }
      this.dustGfx.fillStyle(0x94a3b8, p.alpha * 0.65);
      this.dustGfx.fillCircle(p.x, p.y, p.radius);
    }
  }

  private updateLander() {
    this.landerContainer.setPosition(this.lx, this.ly);
    this.landerContainer.setAngle(this.angle);

    this.flameGfx.clear();
    this.rcsFlameGfx.clear();

    if (this.isThrusting) {
      const fl = 18 + Math.random() * 14;
      // Hypergolic Transparent Aerozine Flame
      this.flameGfx.fillStyle(0xfde047, 0.85);
      this.flameGfx.fillTriangle(-5, 20, 5, 20, 0, 20 + fl);

      this.flameGfx.fillStyle(0xf97316, 0.6);
      this.flameGfx.fillTriangle(-8, 20, 8, 20, 0, 20 + fl * 1.4);

      this.flameGfx.fillStyle(0xffffff, 0.95);
      this.flameGfx.fillTriangle(-2, 20, 2, 20, 0, 20 + fl * 0.4);
    }

    // RCS thruster firing puffs when rotating
    if (Math.abs(this.angularVel) > 10) {
      const isRight = this.angularVel > 0;
      this.rcsFlameGfx.fillStyle(0xffffff, 0.9);
      this.rcsFlameGfx.fillTriangle(isRight ? -14 : 14, -14, isRight ? -22 : 22, -18, isRight ? -14 : 14, -10);
    }
  }

  private checkLanding() {
    const groundY = this.getGroundY(this.lx) + this.worldOffsetY;
    const landerBottom = this.ly + 25; // Contact probe point

    if (landerBottom >= groundY) {
      this.done = true;
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const inZone = Math.abs(this.lx - this.targetX) < this.cfg.params.targetZoneWidthPx / 2;
      const angleSafe = Math.abs(this.angle % 360) < 18 || Math.abs(this.angle % 360) > 342;
      const crashSpeed = 2.8;

      if (speed > crashSpeed || !angleSafe) {
        this.fail(`HARD IMPACT: Touchdown velocity ${speed.toFixed(2)} m/s exceeded 2.5 m/s structural threshold.`);
      } else if (!inZone && this.cfg.params.targetZoneWidthPx > 0) {
        const offBy = Math.abs(this.lx - this.targetX).toFixed(0);
        this.fail(`Landed ${offBy}m off designated Artemis landing zone.`);
      } else {
        for (const hz of this.hazardZones) {
          if (Math.abs(this.lx - hz.x) < hz.w / 2 + 18) {
            this.fail('Landed on a boulder hazard — descent stage structural breach.');
            return;
          }
        }
        const score = Math.round(
          85 - speed * 10 +
          (this.fuel / this.cfg.params.fuelCapacity) * 20 -
          (Math.abs(this.lx - this.targetX) / (this.cfg.params.targetZoneWidthPx || 200)) * 10
        );
        this.success(Math.max(15, Math.min(100, score)));
      }
    }
  }

  private fail(reason: string) {
    this.done = true;
    this.cameras.main.shake(350, 0.03);
    this.showResult(false, reason);
    this.cfg.onFailure(reason);
  }

  private success(score: number) {
    this.showResult(true, `HOUSTON, TRANQUILITY BASE HERE. THE EAGLE HAS LANDED!\nScore: ${score} | Propellant Remaining: ${this.fuel.toFixed(1)}%`);
    this.cfg.onSuccess(score);
  }

  private showResult(ok: boolean, msg: string) {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const bg = this.add.graphics().setDepth(50);
    bg.fillStyle(0x020617, 0.88);
    bg.fillRect(0, 0, W, H);

    this.add.text(W / 2, H / 2 - 40, ok ? '🌕 LUNAR TOUCHDOWN' : '💥 TOUCHDOWN ABORT', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: ok ? '#22c55e' : '#ef4444',
      stroke: ok ? '#14532d' : '#7f1d1d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(51);

    this.add.text(W / 2, H / 2 + 20, msg, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#e2e8f0',
      wordWrap: { width: W - 100 },
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(51);
  }

  private updateHUD() {
    const groundY = this.getGroundY(this.lx) + this.worldOffsetY;
    const alt = Math.max(0, groundY - this.ly - 25);
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const tLeft = Math.max(0, this.cfg.params.timeLimitSec - this.timeElapsed).toFixed(0);
    const fuelPct = (this.fuel / this.cfg.params.fuelCapacity * 100).toFixed(0);
    const distToZone = Math.abs(this.lx - this.targetX).toFixed(0);

    const isContact = alt <= 5;

    this.hudText.setText([
      `RADAR ALT: ${alt.toFixed(1)} M`,
      `VERT RATE: ${this.vy.toFixed(2)} M/S ${this.vy > 2.5 ? '⚠️' : '✓'}`,
      `HORIZ VEL: ${this.vx.toFixed(2)} M/S`,
      `FUEL: ${fuelPct}%`,
      `ATTITUDE PITCH: ${this.angle.toFixed(1)}°`,
      `LZ RANGE: ${distToZone} M`,
      `TIME REMAINING: ${tLeft} S`,
    ].join('\n'));

    // Apollo Blue "CONTACT LIGHT"
    this.contactLightGfx.clear();
    const clX = 185;
    const clY = 120;
    this.contactLightGfx.fillStyle(isContact ? 0x38bdf8 : 0x0f172a, 1);
    this.contactLightGfx.fillRoundedRect(clX - 28, clY - 12, 56, 24, 6);
    this.contactLightGfx.lineStyle(1.5, 0x0284c7, 1);
    this.contactLightGfx.strokeRoundedRect(clX - 28, clY - 12, 56, 24, 6);

    if (speed > 2.8) {
      this.warningText.setText('⚠️ DESCENT RATE EXCEEDED (> 2.5 M/S) — THROTTLE BRAKE!');
    } else if (this.fuel < 20) {
      this.warningText.setText('⚠️ 30 SECONDS OF PROPELLANT REMAINING (60-SEC CALL)');
    } else {
      this.warningText.setText('');
    }
  }
}
