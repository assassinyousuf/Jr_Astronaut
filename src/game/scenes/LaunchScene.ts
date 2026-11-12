// ============================================================
// LaunchScene — Photorealistic NASA Rocket Ascent Simulation
// Built with Phaser 3 for NASA Space Apps Challenge 2026
// Real KSC Pad Imagery · Earth Orbit Curvature · Supersonic Mach Diamonds
// ============================================================
import Phaser from 'phaser';
import type { LaunchParams } from '../missionGameData';

export interface LaunchSceneConfig {
  missionId: string;
  missionName: string;
  params: LaunchParams;
  onSuccess: (score: number) => void;
  onFailure: (reason: string) => void;
}

export class LaunchScene extends Phaser.Scene {
  private cfg!: LaunchSceneConfig;

  // Background layers
  private padSprite!: Phaser.GameObjects.Image;
  private earthOrbitSprite!: Phaser.GameObjects.Image;
  private skyOverlay!: Phaser.GameObjects.Graphics;
  private starsGfx!: Phaser.GameObjects.Graphics;
  private stars: { x: number; y: number; size: number; speed: number; alpha: number }[] = [];

  // Rocket hierarchy
  private rocket!: Phaser.GameObjects.Container;
  private rocketBody!: Phaser.GameObjects.Graphics;
  private flameGfx!: Phaser.GameObjects.Graphics;
  private machDiamondsGfx!: Phaser.GameObjects.Graphics;
  private vaporConeGfx!: Phaser.GameObjects.Graphics;
  private smokeEmitterGfx!: Phaser.GameObjects.Graphics;
  private jettisonedStageGfx!: Phaser.GameObjects.Graphics;
  private jettisonStageActive = false;
  private jettisonStagePos = { x: 0, y: 0, vy: 0, angle: 0, rotSpeed: 0 };

  // Guidance & Trajectory
  private guidanceLine!: Phaser.GameObjects.Graphics;
  private guidanceAngle = -80; // degrees from horizontal (target: steep gravity turn)
  private currentAngle = -80;
  private trailPoints: { x: number; y: number; alpha: number }[] = [];
  private smokeParticles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; life: number }[] = [];

  // Physics State
  private fuel = 100;
  private altitude = 0;
  private velocity = 0;
  private throttle = 0;
  private timeElapsed = 0;
  private phase: 'countdown' | 'ascent' | 'staging' | 'orbit' | 'done' = 'countdown';
  private countdown = 3;
  private stagesSeparated = false;
  private successRegistered = false;
  private maxQTriggered = false;
  private maxQTimer = 0;

  // UI elements
  private hud!: Phaser.GameObjects.Container;
  private hudText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private countdownText!: Phaser.GameObjects.Text;
  private targetZone!: Phaser.GameObjects.Graphics;
  private navballGfx!: Phaser.GameObjects.Graphics;

  // Scroll
  private scrollY = 0;
  private groundY = 0;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'LaunchScene' });
  }

  preload() {
    // High-resolution photographic NASA launch pad & Earth orbit assets
    this.load.image('pad_bg', '/assets/pad_bg.jpg');
    this.load.image('earth_orbit', '/assets/earth_orbit.jpg');
  }

  init(data: LaunchSceneConfig) {
    this.cfg = data;
    this.fuel = this.cfg.params.fuelCapacity;
    this.altitude = 0;
    this.velocity = 0;
    this.throttle = 0;
    this.timeElapsed = 0;
    this.phase = 'countdown';
    this.countdown = 3;
    this.stagesSeparated = false;
    this.successRegistered = false;
    this.trailPoints = [];
    this.smokeParticles = [];
    this.scrollY = 0;
    this.jettisonStageActive = false;
    this.maxQTriggered = false;
    this.maxQTimer = 0;
  }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.groundY = H - 90;

    // 1. Deep Space Starfield (realistic astronomical stars with subtle twinkle)
    this.starsGfx = this.add.graphics().setDepth(1);
    this.stars = [];
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, W),
        y: Phaser.Math.Between(0, H),
        size: Math.random() * 1.8 + 0.4,
        speed: Math.random() * 0.4 + 0.1,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    // 2. Earth Orbit Curvature (photorealistic orbital backdrop)
    if (this.textures.exists('earth_orbit')) {
      this.earthOrbitSprite = this.add.image(W / 2, H + 180, 'earth_orbit')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(W * 1.25, H * 0.9)
        .setAlpha(0)
        .setDepth(2);
    }

    // 3. Dynamic Atmospheric Sky Gradient Overlay
    this.skyOverlay = this.add.graphics().setDepth(3);

    // 4. Photographic Kennedy Space Center Launchpad at Ground Level
    if (this.textures.exists('pad_bg')) {
      this.padSprite = this.add.image(W / 2, this.groundY - 120, 'pad_bg')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(W, H * 0.7)
        .setAlpha(1)
        .setDepth(4);
    }

    // 5. Target Zone Line & Orbital Window
    this.targetZone = this.add.graphics().setDepth(5);
    this.drawTargetZone();

    // 6. Guidance vector line
    this.guidanceLine = this.add.graphics().setDepth(6);

    // 7. Jettisoned booster graphics (for stage separation)
    this.jettisonedStageGfx = this.add.graphics().setDepth(7);

    // 8. Ground Smoke & Cryogenic Boil-off particle layer
    this.smokeEmitterGfx = this.add.graphics().setDepth(8);

    // 9. Rocket Container (holds fuselage, exhaust, mach diamonds, vapor cone)
    this.rocket = this.add.container(W / 2, this.groundY - 40).setDepth(10);
    this.flameGfx = this.add.graphics();
    this.machDiamondsGfx = this.add.graphics();
    this.rocketBody = this.add.graphics();
    this.vaporConeGfx = this.add.graphics();

    this.drawPhotorealisticRocket(this.rocketBody);
    this.rocket.add([this.flameGfx, this.machDiamondsGfx, this.rocketBody, this.vaporConeGfx]);

    // 10. Glass Cockpit Avionics HUD
    this.buildAerospaceHUD();

    // 11. Countdown / Liftoff Text
    this.countdownText = this.add.text(W / 2, H / 2 - 30, 'T-3', {
      fontFamily: 'monospace',
      fontSize: '56px',
      color: '#38bdf8',
      stroke: '#0369a1',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(30);

    // 12. Flight Phase Banner
    this.phaseText = this.add.text(W / 2, 22, 'KENNEDY SPACE CENTER // PAD 39A — COUNTDOWN', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#38bdf8',
      stroke: '#082f49',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(30);

    // 13. Keyboard & Touch Controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.buildTouchControls();

    // Operational Instruction Strip
    this.add.text(W / 2, H - 18, 'W/↑: Throttle Up  |  S/↓: Throttle Down  |  A/D: Pitch Steering  |  [SPACE]: Staging', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#94a3b8',
      backgroundColor: '#020617d0',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setDepth(30);
  }

  /**
   * Draws a photorealistic multi-stage aerospace launch vehicle (SLS / Saturn V style)
   * with cylindrical gradient shading, roll patterns, decals, interstage skirt, and gimbal nozzles.
   */
  private drawPhotorealisticRocket(g: Phaser.GameObjects.Graphics) {
    g.clear();

    const w = 18; // Full hull width
    const hw = w / 2;

    if (!this.stagesSeparated) {
      // ─── STAGE 1 (Core Booster + Interstage) ───
      // Lower interstage base ring (carbon composite / titanium)
      g.fillStyle(0x1e293b, 1);
      g.fillRect(-hw - 1, 14, w + 2, 16);

      // Core stage fuel tank body (insulated aerospace white / orange foam core)
      // Shaded with specular highlight on left side and shadow on right
      g.fillStyle(0x334155, 1); // Dark shadow side
      g.fillRect(-hw, -25, w, 40);

      g.fillStyle(0xe2e8f0, 1); // Main lit hull
      g.fillRect(-hw, -25, w * 0.75, 40);

      g.fillStyle(0xffffff, 1); // Specular highlight streak
      g.fillRect(-hw + 3, -25, 4, 40);

      // Roll pattern black and white aerospace markings
      g.fillStyle(0x0f172a, 1);
      g.fillRect(-hw, -15, hw, 14);
      g.fillRect(0, -1, hw, 14);

      // NASA Insignia Red Vector Stripe
      g.fillStyle(0xef4444, 1);
      g.fillRect(-hw + 3, 2, 3, 10);
      g.fillStyle(0x0284c7, 1);
      g.fillRect(-hw + 7, 2, 3, 10);

      // Booster Engine Bells (RS-25 / F-1 cluster with heat-shielded metal nozzles)
      g.fillStyle(0x475569, 1);
      g.fillTriangle(-hw, 30, -hw + 4, 30, -hw + 2, 36);
      g.fillTriangle(-2, 30, 2, 30, 0, 37);
      g.fillTriangle(hw - 4, 30, hw, 30, hw - 2, 36);

      // Glowing tungsten nozzle interiors
      g.fillStyle(0xf97316, 0.9);
      g.fillCircle(-hw + 2, 31, 2);
      g.fillCircle(0, 31, 2.5);
      g.fillCircle(hw - 2, 31, 2);

      // Aerodynamic Grid / Steering Fins at Base
      g.fillStyle(0x64748b, 1);
      g.fillTriangle(-hw, 18, -hw - 10, 28, -hw, 28);
      g.fillTriangle(hw, 18, hw + 10, 28, hw, 28);
      g.lineStyle(1, 0x94a3b8, 1);
      g.strokeTriangle(-hw, 18, -hw - 10, 28, -hw, 28);
      g.strokeTriangle(hw, 18, hw + 10, 28, hw, 28);

      // Interstage Explosive Cord Separation Line
      g.lineStyle(1.5, 0xf59e0b, 0.9);
      g.lineBetween(-hw - 1, -26, hw + 1, -26);
    }

    // ─── UPPER STAGE & PAYLOAD FAIRING ───
    const topY = this.stagesSeparated ? 10 : -26;

    // Stage 2 Cryogenic LOX/LH2 Tank
    g.fillStyle(0x475569, 1); // Shadow
    g.fillRect(-hw + 1, topY - 26, w - 2, 26);
    g.fillStyle(0xf1f5f9, 1); // Lit hull
    g.fillRect(-hw + 1, topY - 26, (w - 2) * 0.72, 26);
    g.fillStyle(0xffffff, 1); // Specular highlight
    g.fillRect(-hw + 3, topY - 26, 3, 26);

    // USA Flag Graphic on Upper Stage
    g.fillStyle(0xef4444, 1);
    g.fillRect(-3, topY - 20, 6, 2);
    g.fillStyle(0x1e3a8a, 1);
    g.fillRect(-3, topY - 18, 3, 3);
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, topY - 18, 3, 3);

    // Aerodynamic Payload Fairing / Orion Capsule Nosecone
    const fairingTop = topY - 55;
    g.fillStyle(0xe2e8f0, 1);
    g.beginPath();
    g.moveTo(-hw + 1, topY - 26);
    g.lineTo(0, fairingTop);
    g.lineTo(hw - 1, topY - 26);
    g.closePath();
    g.fill();

    // Fairing Specular Reflection & Shadow
    g.fillStyle(0xffffff, 0.85);
    g.beginPath();
    g.moveTo(-hw + 2, topY - 26);
    g.lineTo(0, fairingTop);
    g.lineTo(-1, topY - 26);
    g.closePath();
    g.fill();

    // Launch Abort System (LAS) / Pitot Air Data Tower
    g.lineStyle(1.5, 0x94a3b8, 1);
    g.lineBetween(0, fairingTop, 0, fairingTop - 12);
    g.fillStyle(0xef4444, 1);
    g.fillCircle(0, fairingTop - 13, 2);

    // Upper stage vacuum engine nozzle (if staged)
    if (this.stagesSeparated) {
      g.fillStyle(0x334155, 1);
      g.fillTriangle(-5, 10, 5, 10, 0, 18);
      g.fillStyle(0x38bdf8, 0.9);
      g.fillCircle(0, 12, 3);
    }
  }

  /**
   * Supersonic Mach Shock Diamonds & Multi-Layer High-Velocity Rocket Exhaust
   */
  private drawPhotorealisticExhaust() {
    this.flameGfx.clear();
    this.machDiamondsGfx.clear();
    this.vaporConeGfx.clear();

    if (this.throttle < 0.05 || this.phase === 'countdown') return;

    const basePosY = this.stagesSeparated ? 18 : 36;
    const flameLen = (28 + this.throttle * 80) * (this.stagesSeparated ? 0.75 : 1.0);
    const alpha = 0.7 + this.throttle * 0.3;

    if (!this.stagesSeparated) {
      // 1. Outer Translucent Atmospheric Expansion Plume (Orange-Amber gradient)
      this.flameGfx.fillStyle(0xf97316, alpha * 0.6);
      this.flameGfx.beginPath();
      this.flameGfx.moveTo(-9, basePosY);
      this.flameGfx.lineTo(9, basePosY);
      this.flameGfx.lineTo(14, basePosY + flameLen * 0.4);
      this.flameGfx.lineTo(0, basePosY + flameLen * 1.15);
      this.flameGfx.lineTo(-14, basePosY + flameLen * 0.4);
      this.flameGfx.closePath();
      this.flameGfx.fill();

      // 2. High-Temperature Inner Flame (Intense Yellow-White)
      this.flameGfx.fillStyle(0xfde047, alpha * 0.85);
      this.flameGfx.beginPath();
      this.flameGfx.moveTo(-5, basePosY);
      this.flameGfx.lineTo(5, basePosY);
      this.flameGfx.lineTo(6, basePosY + flameLen * 0.3);
      this.flameGfx.lineTo(0, basePosY + flameLen * 0.75);
      this.flameGfx.lineTo(-6, basePosY + flameLen * 0.3);
      this.flameGfx.closePath();
      this.flameGfx.fill();

      // 3. Ultra-Hot Hydrocarbon Core (Pure White)
      this.flameGfx.fillStyle(0xffffff, alpha);
      this.flameGfx.beginPath();
      this.flameGfx.moveTo(-2.5, basePosY);
      this.flameGfx.lineTo(2.5, basePosY);
      this.flameGfx.lineTo(0, basePosY + flameLen * 0.4);
      this.flameGfx.closePath();
      this.flameGfx.fill();

      // 4. Supersonic Mach Shock Diamonds (characteristic supersonic physics phenomenon)
      const numDiamonds = Math.min(4, Math.floor(1 + this.throttle * 3.5));
      const spacing = flameLen / (numDiamonds + 1);

      for (let d = 1; d <= numDiamonds; d++) {
        const dy = basePosY + d * spacing * 0.8;
        const dw = Math.max(2, 5 - d * 0.9);
        const dh = Math.max(3, 7 - d * 1.1);

        // Radiant diamond flare
        this.machDiamondsGfx.fillStyle(0xffffff, 0.95);
        this.machDiamondsGfx.beginPath();
        this.machDiamondsGfx.moveTo(0, dy - dh);
        this.machDiamondsGfx.lineTo(dw, dy);
        this.machDiamondsGfx.lineTo(0, dy + dh);
        this.machDiamondsGfx.lineTo(-dw, dy);
        this.machDiamondsGfx.closePath();
        this.machDiamondsGfx.fill();

        // Shock disc amber glow ring
        this.machDiamondsGfx.lineStyle(1.5, 0x38bdf8, 0.8);
        this.machDiamondsGfx.strokeEllipse(0, dy, dw * 1.6, dh * 0.8);
      }
    } else {
      // Upper stage: Vacuum-expanded Hydrolox Blue/Violet Plume (RL-10 / J-2X physics)
      this.flameGfx.fillStyle(0x0284c7, alpha * 0.55);
      this.flameGfx.beginPath();
      this.flameGfx.moveTo(-4, basePosY);
      this.flameGfx.lineTo(4, basePosY);
      this.flameGfx.lineTo(16, basePosY + flameLen * 0.6);
      this.flameGfx.lineTo(0, basePosY + flameLen * 1.2);
      this.flameGfx.lineTo(-16, basePosY + flameLen * 0.6);
      this.flameGfx.closePath();
      this.flameGfx.fill();

      this.flameGfx.fillStyle(0xa5f3fc, alpha * 0.9);
      this.flameGfx.beginPath();
      this.flameGfx.moveTo(-2, basePosY);
      this.flameGfx.lineTo(2, basePosY);
      this.flameGfx.lineTo(0, basePosY + flameLen * 0.55);
      this.flameGfx.closePath();
      this.flameGfx.fill();
    }

    // 5. Transonic Vapor Cone / Max-Q Condensation Collar (Prandtl-Glauert Singularity)
    if (this.velocity >= 0.8 && this.velocity <= 1.3 && this.altitude < 40) {
      const pulse = 0.5 + Math.sin(this.timeElapsed * 18) * 0.35;
      this.vaporConeGfx.fillStyle(0xffffff, pulse * 0.65);
      this.vaporConeGfx.beginPath();
      this.vaporConeGfx.moveTo(-22, -35);
      this.vaporConeGfx.lineTo(0, -60);
      this.vaporConeGfx.lineTo(22, -35);
      this.vaporConeGfx.lineTo(0, -42);
      this.vaporConeGfx.closePath();
      this.vaporConeGfx.fill();
    }
  }

  private drawTargetZone() {
    this.targetZone.clear();
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const targetNorm = Math.min(this.cfg.params.targetAltitudeKm / 400, 1);
    const y = H - 80 - targetNorm * (H - 120);

    // Glowing orbital insertion zone
    this.targetZone.lineStyle(2, 0x38bdf8, 0.8);
    this.targetZone.lineBetween(0, y, W, y);
    this.targetZone.fillStyle(0x0284c7, 0.18);
    this.targetZone.fillRect(0, y - 24, W, 48);

    // Orbit insertion text
    const textX = W - 150;
    this.add.text(textX, y - 20, `TARGET ORBIT: ${this.cfg.params.targetAltitudeKm} KM`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#38bdf8',
    }).setDepth(5);
  }

  private buildAerospaceHUD() {
    this.hud = this.add.container(0, 0).setDepth(25);

    // Glass Cockpit Multi-Function Display (MFD)
    const panel = this.add.graphics();
    panel.fillStyle(0x020617, 0.88);
    panel.fillRoundedRect(12, 12, 230, 146, 10);
    panel.lineStyle(1.5, 0x0284c7, 0.6);
    panel.strokeRoundedRect(12, 12, 230, 146, 10);
    this.hud.add(panel);

    // Header label
    const header = this.add.text(22, 18, 'ORBITAL ASCENT // FLIGHT AVIONICS', {
      fontFamily: 'monospace',
      fontSize: '9.5px',
      color: '#38bdf8',
      letterSpacing: 1,
    });
    this.hud.add(header);

    // Digital telemetry readouts
    this.hudText = this.add.text(22, 34, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#f8fafc',
      lineSpacing: 5,
    });
    this.hud.add(this.hudText);

    // Attitude Navball & Trajectory Deviation Widget
    this.navballGfx = this.add.graphics();
    this.hud.add(this.navballGfx);
  }

  private buildTouchControls() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const btnStyle = { fontFamily: 'monospace', fontSize: '20px', color: '#38bdf8', fontWeight: 'bold' };

    const makeBtn = (x: number, y: number, label: string, cb: () => void) => {
      const g = this.add.graphics().setDepth(32);
      g.fillStyle(0x0f172a, 0.85);
      g.fillRoundedRect(-26, -26, 52, 52, 10);
      g.lineStyle(1.5, 0x0284c7, 0.7);
      g.strokeRoundedRect(-26, -26, 52, 52, 10);
      const t = this.add.text(0, 0, label, btnStyle).setOrigin(0.5).setDepth(33);
      const zone = this.add.zone(x, y, 52, 52).setInteractive().setDepth(34);
      zone.on('pointerdown', cb);
      g.x = x; g.y = y; t.x = x; t.y = y;
    };

    makeBtn(W - 50, H - 110, '▲', () => { this.throttle = Math.min(1, this.throttle + 0.25); });
    makeBtn(W - 50, H - 45, '▼', () => { this.throttle = Math.max(0, this.throttle - 0.25); });
    makeBtn(W - 115, H - 75, '◄', () => { this.currentAngle -= 3.5; });
    makeBtn(W - 115 + 130, H - 75, '►', () => { this.currentAngle += 3.5; });
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000;
    this.timeElapsed += dt;

    if (this.phase === 'countdown') {
      this.updateCountdown(dt);
      return;
    }

    if (this.phase === 'done') return;

    this.handleInput(dt);
    this.updatePhysics(dt);
    this.updateVisuals(dt);
    this.checkWinLose();
    this.updateHUD();
  }

  private updateCountdown(dt: number) {
    this.countdown -= dt;
    const n = Math.ceil(this.countdown);
    if (this.countdown > 0) {
      this.countdownText.setText(n <= 0 ? 'IGNITION' : `T-${n}`);
      // Launch pad steam boil-off during countdown
      this.spawnLaunchSmoke(this.rocket.x, this.groundY - 10, 0.2);
      this.updateSmokeParticles(dt);
    } else {
      this.countdownText.setText('🚀 LIFTOFF!');
      this.countdownText.setColor('#22c55e');
      this.time.delayedCall(700, () => {
        this.countdownText.setVisible(false);
        this.phase = 'ascent';
        this.phaseText.setText('MAIN ENGINE CUTOFF (MECO) IN PROGRESS — ACCELERATE TO 7.8 KM/S');
      });
    }
  }

  private handleInput(dt: number) {
    const steerRate = 28 * dt;

    if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.throttle = Math.min(1, this.throttle + 0.15);
    }
    if (this.keyW.isDown || this.cursors.up!.isDown) {
      this.throttle = Math.min(1, this.throttle + 0.6 * dt);
    }
    if (this.keyS.isDown || this.cursors.down!.isDown) {
      this.throttle = Math.max(0, this.throttle - 0.9 * dt);
    }
    if (this.keyA.isDown || this.cursors.left!.isDown) {
      this.currentAngle = Math.max(-88, this.currentAngle - steerRate);
    }
    if (this.keyD.isDown || this.cursors.right!.isDown) {
      this.currentAngle = Math.min(-10, this.currentAngle + steerRate);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      if (this.cfg.params.hasStageSeparation && !this.stagesSeparated && this.altitude > this.cfg.params.targetAltitudeKm * 0.25) {
        this.triggerStageSeparation();
      }
    }
  }

  private triggerStageSeparation() {
    this.stagesSeparated = true;
    this.fuel = Math.min(this.fuel + 35, this.cfg.params.fuelCapacity);
    this.phaseText.setText('STAGE 1 SEPARATION CONFIRMED ✓ — STAGE 2 HYDROLOX IGNITION');
    this.drawPhotorealisticRocket(this.rocketBody);

    // Initialize jettisoned booster falling physics
    this.jettisonStageActive = true;
    this.jettisonStagePos = {
      x: this.rocket.x,
      y: this.rocket.y + 20,
      vy: 40,
      angle: this.rocket.angle,
      rotSpeed: 35,
    };

    // Camera flash effect
    this.cameras.main.flash(350, 255, 220, 150);
  }

  private updatePhysics(dt: number) {
    const thrustAccel = this.throttle * 135; // km/s²-ish scaled
    const gravity = 9.8 * 0.055;
    const drag = this.velocity * 0.018;

    // Atmospheric dynamic pressure (q = 1/2 * rho * v^2)
    const airDensity = Math.max(0, 1 - this.altitude / 80);
    const dynPressure = 0.5 * airDensity * Math.pow(this.velocity, 2);

    if (dynPressure > 0.8 && !this.maxQTriggered && this.altitude > 10 && this.altitude < 45) {
      this.maxQTriggered = true;
      this.maxQTimer = 2.5;
    }
    if (this.maxQTimer > 0) {
      this.maxQTimer -= dt;
    }

    // Trajectory wind shear
    if (this.cfg.params.windEnabled) {
      const windForce = Math.sin(this.timeElapsed * 0.4) * 2.5;
      this.currentAngle += windForce * dt;
    }

    // Velocity update
    this.velocity = Math.max(0, this.velocity + (thrustAccel - gravity - drag) * dt);
    this.altitude += this.velocity * dt;

    // Fuel consumption rate
    if (this.throttle > 0) {
      this.fuel = Math.max(0, this.fuel - this.throttle * 7.5 * dt);
    }
    if (this.fuel <= 0) {
      this.throttle = 0;
    }

    // Vertical world scrolling
    this.scrollY = (this.altitude / this.cfg.params.targetAltitudeKm) * (this.cameras.main.height - 120);

    // Staging prompt
    if (this.cfg.params.hasStageSeparation && !this.stagesSeparated &&
      this.altitude > this.cfg.params.targetAltitudeKm * 0.38) {
      this.phaseText.setText('⚠️ PRESS [SPACE] TO EXECUTE STAGE 1 BOOSTER SEPARATION!');
    }
  }

  private updateVisuals(dt: number) {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // ─── 1. Atmospheric Sky Gradient Transition ───
    const altRatio = Math.min(this.altitude / (this.cfg.params.targetAltitudeKm * 0.6), 1);
    this.skyOverlay.clear();

    // From Florida Sea-Level Light Cyan/Blue to Deep Mesosphere Indigo to Black Void
    const colDay = new Phaser.Display.Color(56, 189, 248);
    const colSpace = new Phaser.Display.Color(2, 6, 23);
    const currentSky = Phaser.Display.Color.Interpolate.ColorWithColor(colDay, colSpace, 100, Math.floor(altRatio * 100));
    this.cameras.main.setBackgroundColor(`rgb(${currentSky.r},${currentSky.g},${currentSky.b})`);

    // ─── 2. Starfield Parallax & Twinkle in Vacuum ───
    this.starsGfx.clear();
    const spaceVisibility = Math.min(Math.max((this.altitude - 15) / 50, 0), 1);
    for (const s of this.stars) {
      const sy = (s.y - this.scrollY * s.speed * 0.25) % H;
      const py = (sy + H) % H;
      this.starsGfx.fillStyle(0xffffff, s.alpha * spaceVisibility);
      this.starsGfx.fillCircle(s.x, py, s.size);
    }

    // ─── 3. Kennedy Space Center Pad Scrolling ───
    if (this.padSprite) {
      const padY = this.groundY - 100 + this.scrollY * 1.2;
      this.padSprite.y = padY;
      const padAlpha = Math.max(0, 1 - this.altitude / 30);
      this.padSprite.setAlpha(padAlpha);
      this.padSprite.setVisible(padAlpha > 0.01);
    }

    // ─── 4. Photorealistic Earth Orbit Curvature Horizon Fade-In ───
    if (this.earthOrbitSprite) {
      const orbitAlpha = Math.min(Math.max((this.altitude - 35) / 80, 0), 1);
      this.earthOrbitSprite.setAlpha(orbitAlpha);
      this.earthOrbitSprite.y = H + 180 - (this.altitude / this.cfg.params.targetAltitudeKm) * 110;
    }

    // ─── 5. Rocket Attitude Steering & Exhaust ───
    this.rocket.y = H * 0.58;
    this.rocket.angle = this.currentAngle + 90;
    this.drawPhotorealisticExhaust();

    // ─── 6. Launch Smoke Billows at Pad ───
    if (this.altitude < 12 && this.throttle > 0.1) {
      this.spawnLaunchSmoke(this.rocket.x, this.rocket.y + 40, this.throttle);
    }
    this.updateSmokeParticles(dt);

    // ─── 7. Jettisoned Stage Falling Visual ───
    if (this.jettisonStageActive) {
      this.jettisonStagePos.y += this.jettisonStagePos.vy * dt;
      this.jettisonStagePos.vy += 80 * dt;
      this.jettisonStagePos.angle += this.jettisonStagePos.rotSpeed * dt;

      this.jettisonedStageGfx.clear();
      this.jettisonedStageGfx.save();
      this.jettisonedStageGfx.translateCanvas(this.jettisonStagePos.x, this.jettisonStagePos.y);
      this.jettisonedStageGfx.rotateCanvas((this.jettisonStagePos.angle * Math.PI) / 180);

      // Draw spent core booster falling away with trailing smoke
      this.jettisonedStageGfx.fillStyle(0x64748b, 0.9);
      this.jettisonedStageGfx.fillRect(-9, -20, 18, 40);
      this.jettisonedStageGfx.fillStyle(0x334155, 1);
      this.jettisonedStageGfx.fillRect(-9, 20, 18, 12);
      this.jettisonedStageGfx.restore();

      if (this.jettisonStagePos.y > H + 100) {
        this.jettisonStageActive = false;
        this.jettisonedStageGfx.clear();
      }
    }

    // ─── 8. Guidance Trajectory Overlay ───
    this.guidanceLine.clear();
    const rx = this.rocket.x;
    const ry = this.rocket.y;
    const guideRad = (this.guidanceAngle * Math.PI) / 180;
    const guideLen = 140;

    // Glowing green guidance vector
    this.guidanceLine.lineStyle(2, 0x22c55e, 0.45);
    this.guidanceLine.lineBetween(rx, ry, rx + Math.cos(guideRad) * guideLen, ry + Math.sin(guideRad) * guideLen);

    // Rocket actual heading vector
    const actRad = ((this.currentAngle) * Math.PI) / 180;
    this.guidanceLine.lineStyle(2, 0x38bdf8, 0.85);
    this.guidanceLine.lineBetween(rx, ry, rx + Math.cos(actRad) * 80, ry + Math.sin(actRad) * 80);

    // Hot Exhaust Ion Trail
    this.trailPoints.push({ x: rx, y: ry, alpha: 1.0 });
    if (this.trailPoints.length > 35) this.trailPoints.shift();
    for (let i = 0; i < this.trailPoints.length; i++) {
      const tp = this.trailPoints[i];
      const factor = (i + 1) / this.trailPoints.length;
      this.guidanceLine.fillStyle(0xf97316, factor * 0.35);
      this.guidanceLine.fillCircle(tp.x, tp.y, 1.5 + factor * 2.5);
    }
  }

  private spawnLaunchSmoke(x: number, y: number, intensity: number) {
    for (let i = 0; i < 3; i++) {
      this.smokeParticles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y,
        vx: (Math.random() - 0.5) * 60 * intensity,
        vy: 20 + Math.random() * 40 * intensity,
        radius: 12 + Math.random() * 16,
        alpha: 0.65,
        life: 1.2,
      });
    }
  }

  private updateSmokeParticles(dt: number) {
    this.smokeEmitterGfx.clear();
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.radius += 18 * dt;
      p.alpha -= dt * 0.5;
      p.life -= dt;

      if (p.life <= 0 || p.alpha <= 0) {
        this.smokeParticles.splice(i, 1);
        continue;
      }

      this.smokeEmitterGfx.fillStyle(0xe2e8f0, p.alpha * 0.35);
      this.smokeEmitterGfx.fillCircle(p.x, p.y, p.radius);
    }
  }

  private checkWinLose() {
    if (this.successRegistered) return;
    const p = this.cfg.params;

    const altOk = this.altitude >= p.targetAltitudeKm * 0.9 && this.altitude <= p.targetAltitudeKm * 1.25;
    const velOk = this.velocity >= p.targetVelocityKms * 0.8;
    const devOk = Math.abs(this.currentAngle - this.guidanceAngle) <= p.trajectoryWindowDeg;

    if (altOk && velOk && devOk) {
      this.successRegistered = true;
      this.phase = 'done';
      const score = Math.round(100 - (Math.abs(this.currentAngle - this.guidanceAngle) / p.trajectoryWindowDeg) * 30 + (this.fuel / p.fuelCapacity) * 20);
      this.showResult(true, `LOW EARTH ORBIT INSERTION CONFIRMED ✓\nAltitude: ${this.altitude.toFixed(1)} km | Velocity: ${this.velocity.toFixed(2)} km/s | Score: ${score}`);
      this.cfg.onSuccess(score);
      return;
    }

    if (this.fuel <= 0 && this.velocity < 1.0) {
      this.failAndEnd('Propellant depleted — insufficient orbital velocity to reach insertion corridor.');
      return;
    }

    if (this.timeElapsed > p.timeWindowSec * 2.2) {
      this.failAndEnd('Mission flight window expired — launch azimuth window closed.');
    }
  }

  private failAndEnd(reason: string) {
    if (this.successRegistered) return;
    this.successRegistered = true;
    this.phase = 'done';
    this.showResult(false, reason);
    this.cfg.onFailure(reason);
  }

  private showResult(success: boolean, msg: string) {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const bg = this.add.graphics().setDepth(50);
    bg.fillStyle(0x020617, 0.85);
    bg.fillRect(0, 0, W, H);

    this.add.text(W / 2, H / 2 - 45, success ? '🏆 MISSION SUCCESS' : '⚠️ MISSION ABORT', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: success ? '#22c55e' : '#ef4444',
      stroke: success ? '#14532d' : '#7f1d1d',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(51);

    this.add.text(W / 2, H / 2 + 18, msg, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#e2e8f0',
      wordWrap: { width: W - 100 },
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(51);
  }

  private updateHUD() {
    const p = this.cfg.params;
    const pctAlt = Math.min((this.altitude / p.targetAltitudeKm) * 100, 100).toFixed(1);
    const pctVel = Math.min((this.velocity / p.targetVelocityKms) * 100, 100).toFixed(1);
    const dev = (this.currentAngle - this.guidanceAngle).toFixed(1);
    const machNum = (this.velocity * 1000 / 343).toFixed(1);

    const devColor = Math.abs(this.currentAngle - this.guidanceAngle) < p.trajectoryWindowDeg ? '#22c55e' : '#ef4444';

    this.hudText.setText([
      `ALT: ${this.altitude.toFixed(1)} / ${p.targetAltitudeKm} KM (${pctAlt}%)`,
      `VEL: ${this.velocity.toFixed(2)} KM/S (MACH ${machNum})`,
      `FUEL: ${this.fuel.toFixed(1)} / ${p.fuelCapacity}`,
      `THROTTLE: ${(this.throttle * 100).toFixed(0)}%`,
      `GIMBAL PITCH: ${this.currentAngle.toFixed(1)}° (DEV: ${dev}°)`,
      `MISSION TIME: T+${this.timeElapsed.toFixed(1)}S`,
      this.maxQTimer > 0 ? '⚡ MAX-Q DYNAMIC PRESSURE PEAK' : '',
    ].filter(Boolean).join('\n'));

    // Draw Mini Attitude Navball in HUD
    this.navballGfx.clear();
    const nbX = 180;
    const nbY = 124;
    const nbR = 18;

    this.navballGfx.fillStyle(0x0f172a, 1);
    this.navballGfx.fillCircle(nbX, nbY, nbR);
    this.navballGfx.lineStyle(1.5, 0x0284c7, 0.8);
    this.navballGfx.strokeCircle(nbX, nbY, nbR);

    // Horizon line
    const rollRad = (this.currentAngle * Math.PI) / 180;
    this.navballGfx.lineStyle(1.5, 0x38bdf8, 1);
    this.navballGfx.lineBetween(
      nbX - Math.cos(rollRad) * (nbR - 2),
      nbY - Math.sin(rollRad) * (nbR - 2),
      nbX + Math.cos(rollRad) * (nbR - 2),
      nbY + Math.sin(rollRad) * (nbR - 2)
    );

    // Pitch reticle crosshair
    this.navballGfx.fillStyle(0xf59e0b, 1);
    this.navballGfx.fillCircle(nbX, nbY, 2.5);
  }
}
