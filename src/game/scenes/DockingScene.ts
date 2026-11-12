// ============================================================
// DockingScene — Photorealistic Orbital Rendezvous & Proximity Operations Simulation
// Built with Phaser 3 for NASA Space Apps Challenge 2026
// Low Earth Orbit Backdrop · High-Detail ISS / Gateway · Dynamic RCS Cold-Gas Jets
// ============================================================
import Phaser from 'phaser';
import type { DockingParams } from '../missionGameData';

export interface DockingSceneConfig {
  missionId: string;
  missionName: string;
  params: DockingParams;
  onSuccess: (score: number) => void;
  onFailure: (reason: string) => void;
}

export class DockingScene extends Phaser.Scene {
  private cfg!: DockingSceneConfig;

  // Background
  private earthOrbitBg!: Phaser.GameObjects.Image;
  private starsGfx!: Phaser.GameObjects.Graphics;

  // Spacecraft & Station
  private probe!: Phaser.GameObjects.Container;
  private probeGfx!: Phaser.GameObjects.Graphics;
  private rcsJetsGfx!: Phaser.GameObjects.Graphics;
  private targetStation!: Phaser.GameObjects.Container;
  private targetGfx!: Phaser.GameObjects.Graphics;
  private portIndicator!: Phaser.GameObjects.Graphics;

  // Relative Orbital Physics
  private vx = 0;
  private vy = 0;
  private angularVel = 0;
  private probeAngle = 0;
  private px = 0;
  private py = 0;
  private targetX = 0;
  private targetY = 0;

  // Active RCS thruster jets
  private rcsActive = { fwd: false, aft: false, up: false, down: false, rollL: false, rollR: false };

  // State
  private distanceToPort = 0;
  private relativeSpeed = 0;
  private lockTimer = 0;
  private isDocked = false;
  private timeElapsed = 0;
  private successRegistered = false;

  // HUD & Avionics
  private hud!: Phaser.GameObjects.Container;
  private hudText!: Phaser.GameObjects.Text;
  private approachBar!: Phaser.GameObjects.Graphics;
  private speedBar!: Phaser.GameObjects.Graphics;
  private alignBar!: Phaser.GameObjects.Graphics;
  private dockRing!: Phaser.GameObjects.Graphics;
  private coasGfx!: Phaser.GameObjects.Graphics;
  private warningText!: Phaser.GameObjects.Text;

  // Touch / keyboard
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'DockingScene' });
  }

  preload() {
    this.load.image('earth_orbit', '/assets/earth_orbit.jpg');
  }

  init(data: DockingSceneConfig) {
    this.cfg = data;
    this.vx = 0;
    this.vy = 0;
    this.angularVel = 0;
    this.probeAngle = 0;
    this.lockTimer = 0;
    this.isDocked = false;
    this.timeElapsed = 0;
    this.successRegistered = false;
    this.rcsActive = { fwd: false, aft: false, up: false, down: false, rollL: false, rollR: false };
  }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // 1. Deep Space Vacuum
    this.cameras.main.setBackgroundColor('#020617');

    // 2. High-Resolution Rotating Earth Orbit Curvature
    if (this.textures.exists('earth_orbit')) {
      this.earthOrbitBg = this.add.image(W * 0.45, H * 0.85, 'earth_orbit')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(W * 1.3, H * 0.95)
        .setAlpha(0.72)
        .setDepth(1);
    }

    // 3. Stars (crisp distant celestial points)
    this.starsGfx = this.add.graphics().setDepth(2);
    this.drawStars();

    // 4. Target Station (International Space Station / Lunar Gateway)
    this.targetX = W * 0.72;
    this.targetY = H * 0.5;
    this.targetStation = this.add.container(this.targetX, this.targetY).setDepth(4);
    this.targetGfx = this.add.graphics();
    this.drawPhotorealisticStation(this.targetGfx);
    this.targetStation.add(this.targetGfx);

    // 5. Docking Port Optical Crosshair & Capture Petals
    this.dockRing = this.add.graphics().setDepth(5);
    this.drawDockPort();

    // 6. Player Spacecraft (Crew Dragon / Apollo CSM / Orion)
    this.px = W * 0.2;
    this.py = H * 0.5;
    this.vx = this.cfg.params.maxApproachSpeedMs * 0.28;
    this.vy = 0;

    this.probe = this.add.container(this.px, this.py).setDepth(10);
    this.rcsJetsGfx = this.add.graphics();
    this.probeGfx = this.add.graphics();
    this.drawPhotorealisticSpacecraft(this.probeGfx);
    this.probe.add([this.rcsJetsGfx, this.probeGfx]);

    // 7. Laser Alignment Guide Vector
    this.portIndicator = this.add.graphics().setDepth(6);
    this.coasGfx = this.add.graphics().setDepth(12);

    // 8. Glass Cockpit Proximity Operations HUD
    this.buildAvionicsHUD(W, H);

    // 9. Warning Annunciator Banner
    this.warningText = this.add.text(W / 2, H - 46, '', {
      fontFamily: 'monospace',
      fontSize: '12.5px',
      color: '#ef4444',
      backgroundColor: '#020617cc',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setDepth(25);

    // 10. Operational Flight Rules
    this.add.text(W / 2, H - 18, 'W/S: Surge (X)  |  A/D: Sway (Y)  |  Q/E: Roll  |  Relative Velocity Threshold: < 0.25 m/s', {
      fontFamily: 'monospace',
      fontSize: '10.5px',
      color: '#94a3b8',
      backgroundColor: '#020617d0',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5).setDepth(25);

    // 11. Keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyQ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.buildTouchControls(W, H);
  }

  private drawStars() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.starsGfx.clear();
    this.starsGfx.fillStyle(0xffffff, 1);
    for (let i = 0; i < 220; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const r = Math.random() * 1.5 + 0.3;
      const alpha = Math.random() * 0.75 + 0.25;
      this.starsGfx.fillStyle(0xffffff, alpha);
      this.starsGfx.fillCircle(x, y, r);
    }
  }

  /**
   * Photorealistic International Space Station / Gateway Module
   * Pressurized white MMOD-shielded habitat, golden photovoltaic wings,
   * heat rejection radiator panels, and NASA Docking System (NDS) capture ring.
   */
  private drawPhotorealisticStation(g: Phaser.GameObjects.Graphics) {
    g.clear();

    // ─── 1. INTEGRATED TRUSS STRUCTURE & RADIATOR PANELS ───
    // Center backbone truss
    g.fillStyle(0x334155, 1);
    g.fillRect(-15, -90, 10, 180);
    g.lineStyle(1.5, 0x64748b, 1);
    g.strokeRect(-15, -90, 10, 180);

    // Ammonia Heat Rejection Radiators (Orthogonal white thermal panels)
    g.fillStyle(0xf8fafc, 0.95);
    g.fillRect(-45, -75, 24, 40);
    g.fillRect(-45, 35, 24, 40);
    g.lineStyle(1, 0x94a3b8, 1);
    g.strokeRect(-45, -75, 24, 40);
    g.strokeRect(-45, 35, 24, 40);

    // ─── 2. GOLDEN PHOTOVOLTAIC SOLAR ARRAY WINGS ───
    const drawSolarWing = (wy: number) => {
      // Golden Silicon/Gallium-Arsenide Cells
      g.fillStyle(0xd97706, 0.95);
      g.fillRect(10, wy, 85, 30);

      // Gold Specular Reflection & Individual Cell String Grids
      g.fillStyle(0xfde68a, 0.85);
      g.fillRect(14, wy + 4, 35, 22);

      g.lineStyle(1, 0x78350f, 0.9);
      g.strokeRect(10, wy, 85, 30);
      for (let s = 0; s < 6; s++) {
        g.lineBetween(10 + s * 14, wy, 10 + s * 14, wy + 30);
      }
    };
    drawSolarWing(-85);
    drawSolarWing(55);

    // ─── 3. PRESSURIZED HABITAT MODULE (Destiny / Columbus Laboratory) ───
    // Cylindrical Module Hull (White Micrometeoroid Shield Blankets)
    g.fillStyle(0x94a3b8, 1); // Shadow side
    g.fillRect(-35, -20, 60, 40);
    g.fillStyle(0xf1f5f9, 1); // Lit top half
    g.fillRect(-35, -20, 60, 26);
    g.fillStyle(0xffffff, 1); // Specular highlight
    g.fillRect(-35, -16, 60, 5);

    // Modular waffle pattern ribs
    g.lineStyle(1.5, 0x64748b, 0.8);
    g.lineBetween(-20, -20, -20, 20);
    g.lineBetween(0, -20, 0, 20);
    g.lineBetween(15, -20, 15, 20);

    // Cupola Observation Dome with blue glass windows
    g.fillStyle(0x475569, 1);
    g.fillCircle(18, 0, 16);
    g.fillStyle(0x0284c7, 0.95);
    g.fillCircle(19, 0, 10);
    g.lineStyle(1, 0x38bdf8, 1);
    g.strokeCircle(19, 0, 10);

    // ─── 4. NASA DOCKING SYSTEM (NDS) / APAS-95 CAPTURE RING ───
    // Forward vestibule collar facing left toward approaching spacecraft
    g.fillStyle(0xd97706, 1); // Gold thermal wrap ring
    g.fillRect(-48, -10, 13, 20);

    // Hard capture latch ring
    g.fillStyle(0x1e293b, 1);
    g.fillRect(-52, -8, 5, 16);

    // 3 Soft capture alignment guide petals (triangular petals pointing outward)
    g.fillStyle(0xf59e0b, 1);
    g.fillTriangle(-52, -12, -58, -8, -52, -6);
    g.fillTriangle(-52, 12, -58, 8, -52, 6);

    // Running Navigation Beacons (Red Port / Green Starboard)
    g.fillStyle(0x22c55e, 1);
    g.fillCircle(-10, -92, 3);
    g.fillStyle(0xef4444, 1);
    g.fillCircle(-10, 92, 3);
  }

  private drawDockPort() {
    this.dockRing.clear();
    const r = this.cfg.params.portDiameterPx / 2;
    const px = this.targetX - 52;
    const py = this.targetY;

    // Glowing docking collar capture perimeter
    this.dockRing.lineStyle(2, 0x38bdf8, 0.85);
    this.dockRing.strokeCircle(px, py, r);

    // Optical COAS crosshairs
    this.dockRing.lineStyle(1, 0x38bdf8, 0.5);
    this.dockRing.lineBetween(px - r - 8, py, px + r + 8, py);
    this.dockRing.lineBetween(px, py - r - 8, px, py + r + 8);

    // Center laser alignment reflector
    this.dockRing.fillStyle(0x22c55e, 1);
    this.dockRing.fillCircle(px, py, 2.5);
  }

  /**
   * Photorealistic Approaching Spacecraft (Crew Dragon / Orion / Apollo CSM)
   * Shaded metallic capsule, heat shield, forward docking cone and hatch,
   * service module with radiators and RCS thruster quads.
   */
  private drawPhotorealisticSpacecraft(g: Phaser.GameObjects.Graphics) {
    g.clear();

    // ─── 1. SERVICE MODULE (Trunk / Propulsion Deck) ───
    g.fillStyle(0x475569, 1); // Shadow
    g.fillRect(-22, -14, 20, 28);
    g.fillStyle(0xe2e8f0, 1); // Lit hull
    g.fillRect(-22, -14, 20, 18);
    g.fillStyle(0xffffff, 1); // Highlight
    g.fillRect(-22, -11, 20, 3);

    // Black solar arrays along trunk surface
    g.fillStyle(0x1e3a8a, 0.9);
    g.fillRect(-20, -13, 8, 12);
    g.fillRect(-20, 1, 8, 12);

    // ─── 2. CREW COMMAND MODULE CAPSULE ───
    // Truncated conical aerocone
    g.fillStyle(0x94a3b8, 1);
    g.beginPath();
    g.moveTo(-2, -14);
    g.lineTo(18, -6);
    g.lineTo(18, 6);
    g.lineTo(-2, 14);
    g.closePath();
    g.fill();

    g.fillStyle(0xf8fafc, 1); // Specular lit top
    g.beginPath();
    g.moveTo(-2, -14);
    g.lineTo(18, -6);
    g.lineTo(18, 0);
    g.lineTo(-2, 2);
    g.closePath();
    g.fill();

    // NASA Insignia Red Chevron
    g.fillStyle(0xef4444, 1);
    g.fillRect(2, -4, 4, 8);

    // Cockpit Crew Windows
    g.fillStyle(0x0284c7, 1);
    g.fillCircle(8, -4, 2.5);
    g.fillCircle(8, 4, 2.5);

    // Forward Aerodynamic Nosecone Hatch & Docking Probe Tip
    g.fillStyle(0xd97706, 1);
    g.fillRect(18, -4, 8, 8);
    g.fillStyle(0x1e293b, 1);
    g.fillRect(26, -3, 3, 6);

    // Latch probe tip
    g.fillStyle(0xf59e0b, 1);
    g.fillTriangle(29, -2, 34, 0, 29, 2);

    // ─── 3. RCS COLD-GAS / HYDRAZINE THRUSTER BLOCKS ───
    g.fillStyle(0x334155, 1);
    g.fillRect(-18, -17, 6, 3);
    g.fillRect(-18, 14, 6, 3);
    g.fillRect(12, -9, 4, 3);
    g.fillRect(12, 6, 4, 3);
  }

  /**
   * Visible White Cold-Gas RCS Thruster Gas Bursts
   */
  private drawRCSThrusters() {
    this.rcsJetsGfx.clear();
    const g = this.rcsJetsGfx;

    const drawJet = (x: number, y: number, dx: number, dy: number) => {
      const fl = 12 + Math.random() * 8;
      g.fillStyle(0xffffff, 0.85);
      g.beginPath();
      g.moveTo(x - dy * 2, y + dx * 2);
      g.lineTo(x + dy * 2, y - dx * 2);
      g.lineTo(x + dx * fl, y + dy * fl);
      g.closePath();
      g.fill();

      // Expansion vapor halo
      g.fillStyle(0x38bdf8, 0.35);
      g.fillCircle(x + dx * (fl * 0.7), y + dy * (fl * 0.7), 4);
    };

    if (this.rcsActive.fwd) {
      drawJet(-22, -10, -1, 0);
      drawJet(-22, 10, -1, 0);
    }
    if (this.rcsActive.aft) {
      drawJet(26, -3, 1, 0);
      drawJet(26, 3, 1, 0);
    }
    if (this.rcsActive.up) {
      drawJet(-15, 17, 0, 1);
      drawJet(14, 9, 0, 1);
    }
    if (this.rcsActive.down) {
      drawJet(-15, -17, 0, -1);
      drawJet(14, -9, 0, -1);
    }
    if (this.rcsActive.rollL) {
      drawJet(-15, -17, 0, -1);
      drawJet(14, 9, 0, 1);
    }
    if (this.rcsActive.rollR) {
      drawJet(-15, 17, 0, 1);
      drawJet(14, -9, 0, -1);
    }
  }

  private buildAvionicsHUD(W: number, _H: number) {
    this.hud = this.add.container(0, 0).setDepth(20);

    const panel = this.add.graphics();
    panel.fillStyle(0x020617, 0.88);
    panel.fillRoundedRect(12, 12, 230, 142, 10);
    panel.lineStyle(1.5, 0x0284c7, 0.6);
    panel.strokeRoundedRect(12, 12, 230, 142, 10);
    this.hud.add(panel);

    const header = this.add.text(22, 18, 'PROXIMITY OPS // COAS DOCKING RADAR', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#38bdf8',
      letterSpacing: 1,
    });
    this.hud.add(header);

    this.hudText = this.add.text(22, 34, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#f8fafc',
      lineSpacing: 5,
    });
    this.hud.add(this.hudText);

    // Bars
    this.add.text(W - 120, 12, 'RANGE', { fontFamily: 'monospace', fontSize: '9px', color: '#64748b' }).setDepth(21);
    this.add.text(W - 120, 60, 'CLOSURE', { fontFamily: 'monospace', fontSize: '9px', color: '#64748b' }).setDepth(21);
    this.add.text(W - 120, 108, 'ROLL ALIGN', { fontFamily: 'monospace', fontSize: '9px', color: '#64748b' }).setDepth(21);

    this.approachBar = this.add.graphics().setDepth(21);
    this.speedBar = this.add.graphics().setDepth(21);
    this.alignBar = this.add.graphics().setDepth(21);
  }

  private buildTouchControls(W: number, H: number) {
    const btnStyle = { fontFamily: 'monospace', fontSize: '18px', color: '#38bdf8', fontWeight: 'bold' };

    const makeBtn = (x: number, y: number, label: string, cb: () => void) => {
      const g = this.add.graphics().setDepth(30);
      g.fillStyle(0x0f172a, 0.85);
      g.fillRoundedRect(-24, -24, 48, 48, 8);
      g.lineStyle(1.5, 0x0284c7, 0.7);
      g.strokeRoundedRect(-24, -24, 48, 48, 8);
      const t = this.add.text(0, 0, label, btnStyle).setOrigin(0.5).setDepth(31);
      const zone = this.add.zone(x, y, 48, 48).setInteractive().setDepth(32);
      zone.on('pointerdown', cb);
      g.x = x; g.y = y; t.x = x; t.y = y;
    };

    makeBtn(W - 120, H - 90, '▲', () => { this.vy -= 0.08; this.rcsActive.up = true; });
    makeBtn(W - 120, H - 35, '▼', () => { this.vy += 0.08; this.rcsActive.down = true; });
    makeBtn(W - 165, H - 62, '◄', () => { this.vx -= 0.08; this.rcsActive.aft = true; });
    makeBtn(W - 75, H - 62, '►', () => { this.vx += 0.08; this.rcsActive.fwd = true; });
  }

  update(_time: number, delta: number) {
    if (this.isDocked || this.successRegistered) return;
    const dt = delta / 1000;
    this.timeElapsed += dt;

    this.handleInput(dt);
    this.applyOrbitalPhysics(dt);
    this.checkDockingCapture(dt);
    this.updateVisuals();
    this.updateHUD();

    if (this.timeElapsed > this.cfg.params.timeLimitSec) {
      this.fail('Orbital rendezvous window closed — LOS (Loss of Signal).');
    }
  }

  private handleInput(dt: number) {
    const thrust = (this.cfg.params.thrusterStrength || 1.2) * dt * 0.65;
    const rollRate = 45 * dt;

    this.rcsActive = { fwd: false, aft: false, up: false, down: false, rollL: false, rollR: false };

    if (this.keyW.isDown || this.cursors.up!.isDown) {
      this.vy -= thrust;
      this.rcsActive.up = true;
    }
    if (this.keyS.isDown || this.cursors.down!.isDown) {
      this.vy += thrust;
      this.rcsActive.down = true;
    }
    if (this.keyD.isDown || this.cursors.right!.isDown) {
      this.vx += thrust;
      this.rcsActive.fwd = true;
    }
    if (this.keyA.isDown || this.cursors.left!.isDown) {
      this.vx -= thrust;
      this.rcsActive.aft = true;
    }

    if (this.cfg.params.hasRollAxis) {
      if (this.keyQ.isDown) {
        this.angularVel -= rollRate;
        this.rcsActive.rollL = true;
      }
      if (this.keyE.isDown) {
        this.angularVel += rollRate;
        this.rcsActive.rollR = true;
      }
      this.angularVel *= Math.pow(0.92, dt * 60);
      this.probeAngle += this.angularVel * dt;
    }

    // Micro-drag stabilization
    this.vx *= Math.pow(0.985, dt * 60);
    this.vy *= Math.pow(0.985, dt * 60);
  }

  private applyOrbitalPhysics(dt: number) {
    this.px += this.vx * dt * 60;
    this.py += this.vy * dt * 60;

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.px = Phaser.Math.Clamp(this.px, 40, W - 40);
    this.py = Phaser.Math.Clamp(this.py, 40, H - 40);

    this.probe.setPosition(this.px, this.py);
    this.probe.setAngle(this.probeAngle);
    this.drawRCSThrusters();
  }

  private checkDockingCapture(dt: number) {
    const portX = this.targetX - 52;
    const portY = this.targetY;
    const dx = portX - (this.px + 29); // probe tip distance
    const dy = portY - this.py;

    this.distanceToPort = Math.sqrt(dx * dx + dy * dy);
    this.relativeSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    const portR = this.cfg.params.portDiameterPx / 2;
    const maxSpeed = this.cfg.params.maxApproachSpeedMs;

    if (this.distanceToPort < portR) {
      if (this.relativeSpeed > maxSpeed * 2.8) {
        this.fail(`CAPTURE COLLISION: Closure rate ${this.relativeSpeed.toFixed(2)} m/s damaged docking mechanism.`);
        return;
      }

      this.lockTimer += dt;
      if (this.lockTimer > 1.4) {
        this.successRegistered = true;
        this.isDocked = true;
        const score = Math.round(100 - (this.relativeSpeed / maxSpeed) * 35 + (1 - this.timeElapsed / this.cfg.params.timeLimitSec) * 25);
        this.showResult(true, `HARD DOCK CONFIRMED ✓\nAll 12 capture latches locked. Relative closure rate: ${this.relativeSpeed.toFixed(3)} m/s | Score: ${score}`);
        this.cfg.onSuccess(Math.max(15, score));
      }
    } else {
      this.lockTimer = 0;
    }
  }

  private updateVisuals() {
    const W = this.cameras.main.width;
    const portX = this.targetX - 52;
    const portY = this.targetY;

    // Laser optical alignment beam
    this.portIndicator.clear();
    const col = this.distanceToPort < this.cfg.params.portDiameterPx ? 0x22c55e : 0x38bdf8;
    this.portIndicator.lineStyle(1.5, col, 0.45);
    this.portIndicator.lineBetween(this.px + 29, this.py, portX, portY);

    // COAS Reticle Crosshair around target port
    this.coasGfx.clear();
    const r = this.cfg.params.portDiameterPx / 2;
    if (this.distanceToPort < r * 5) {
      this.coasGfx.lineStyle(1.5, 0x22c55e, 0.6);
      this.coasGfx.strokeCircle(portX, portY, r * 2.2);
    }

    // HUD Bars
    const approachPct = Math.max(0, 1 - this.distanceToPort / 320);
    const speedPct = Math.min(1, this.relativeSpeed / (this.cfg.params.maxApproachSpeedMs * 3.5));
    const alignDeg = Math.abs(this.probeAngle % 360);
    const alignPct = Math.max(0, 1 - alignDeg / 40);

    this.drawBar(this.approachBar, W - 115, 24, 100, 14, approachPct, 0x22c55e);
    this.drawBar(this.speedBar, W - 115, 72, 100, 14, 1 - speedPct, speedPct > 0.45 ? 0xef4444 : 0x22c55e);
    this.drawBar(this.alignBar, W - 115, 120, 100, 14, alignPct, 0x38bdf8);

    if (this.relativeSpeed > this.cfg.params.maxApproachSpeedMs * 1.8) {
      this.warningText.setText('⚠️ EXCESSIVE CLOSURE VELOCITY — FIRE RETRO RCS (A / ◄)');
    } else if (this.lockTimer > 0.2) {
      this.warningText.setText('🟢 SOFT CAPTURE IN PROGRESS — HOLD CAPTURE ATTITUDE');
    } else {
      this.warningText.setText('');
    }
  }

  private drawBar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, pct: number, color: number) {
    g.clear();
    g.fillStyle(0x0f172a, 0.9);
    g.fillRoundedRect(x, y, w, h, 4);
    g.lineStyle(1, 0x334155, 1);
    g.strokeRoundedRect(x, y, w, h, 4);
    g.fillStyle(color, 1);
    g.fillRoundedRect(x + 1, y + 1, Math.max(0, (w - 2) * pct), h - 2, 3);
  }

  private updateHUD() {
    const dist = this.distanceToPort.toFixed(1);
    const speed = this.relativeSpeed.toFixed(3);
    const tLeft = Math.max(0, this.cfg.params.timeLimitSec - this.timeElapsed).toFixed(0);

    this.hudText.setText([
      `RANGE: ${dist} M (CAPTURE: <${(this.cfg.params.portDiameterPx / 2).toFixed(0)}M)`,
      `CLOSURE: ${speed} M/S (MAX: ${this.cfg.params.maxApproachSpeedMs})`,
      `RCS SURGE: ${this.vx.toFixed(3)} | SWAY: ${this.vy.toFixed(3)}`,
      this.cfg.params.hasRollAxis ? `ROLL ATTITUDE: ${this.probeAngle.toFixed(1)}°` : '',
      `TIME REMAINING: ${tLeft} S`,
      `LATCH CAPTURE: ${(this.lockTimer / 1.4 * 100).toFixed(0)}%`,
    ].filter(Boolean).join('\n'));
  }

  private fail(reason: string) {
    if (this.successRegistered) return;
    this.successRegistered = true;
    this.showResult(false, reason);
    this.cfg.onFailure(reason);
  }

  private showResult(success: boolean, msg: string) {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const bg = this.add.graphics().setDepth(50);
    bg.fillStyle(0x020617, 0.88);
    bg.fillRect(0, 0, W, H);

    this.add.text(W / 2, H / 2 - 40, success ? '🏆 HARD DOCK ACHIEVED' : '❌ DOCKING ABORT', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: success ? '#22c55e' : '#ef4444',
      stroke: success ? '#14532d' : '#7f1d1d',
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
}
