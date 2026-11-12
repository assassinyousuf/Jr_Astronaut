// ============================================================
// RoverScene — Photorealistic Mars Rover Surface Teleoperation Simulation
// Built with Phaser 3 for NASA Space Apps Challenge 2026
// HiRISE Jezero Terrain · 6-Wheel Rocker-Bogie · Tire Tracks · Dynamic Headlights
// ============================================================
import Phaser from 'phaser';
import type { RoverParams } from '../missionGameData';

export interface RoverSceneConfig {
  missionId: string;
  missionName: string;
  params: RoverParams;
  onSuccess: (score: number) => void;
  onFailure: (reason: string) => void;
}

type TileType = 'clear' | 'crater' | 'rock' | 'sand' | 'waypoint' | 'collected';

export class RoverScene extends Phaser.Scene {
  private cfg!: RoverSceneConfig;

  // Background
  private marsBackdrop!: Phaser.GameObjects.Image;

  // Grid
  private grid: TileType[][] = [];
  private tileSize = 52;
  private offsetX = 0;
  private offsetY = 0;

  // Rover state
  private roverX = 0;
  private roverY = 0;
  private roverAngle = 0;
  private roverContainer!: Phaser.GameObjects.Container;
  private roverGfx!: Phaser.GameObjects.Graphics;
  private headlightGfx!: Phaser.GameObjects.Graphics;
  private isMoving = false;
  private moveQueue: { tx: number; ty: number }[] = [];
  private moveProgress = 0;
  private fromX = 0;
  private fromY = 0;

  // Dynamic Tire Tracks
  private tracksGfx!: Phaser.GameObjects.Graphics;
  private wheelTracks: { x: number; y: number; angle: number }[] = [];

  // Waypoints
  private waypoints: { gx: number; gy: number; collected: boolean }[] = [];
  private waypointsCollected = 0;

  // Resources
  private battery = 100;
  private timeElapsed = 0;
  private done = false;
  private sandstormActive = false;
  private sandstormTimer = 0;
  private dustAlpha = 0;

  // Graphics
  private gridGfx!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;
  private waypointGfx!: Phaser.GameObjects.Graphics;
  private minimapGfx!: Phaser.GameObjects.Graphics;
  private sandstormGfx!: Phaser.GameObjects.Graphics;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'RoverScene' });
  }

  preload() {
    this.load.image('mars_jezero', '/assets/bg/mars_jezero.jpg');
    this.load.image('mars_texture', '/assets/assets/mars_texture.jpg');
  }

  init(data: RoverSceneConfig) {
    this.cfg = data;
    this.grid = [];
    this.waypoints = [];
    this.waypointsCollected = 0;
    this.battery = this.cfg.params.batteryCapacity;
    this.timeElapsed = 0;
    this.done = false;
    this.sandstormActive = false;
    this.sandstormTimer = 0;
    this.dustAlpha = 0;
    this.moveQueue = [];
    this.isMoving = false;
    this.roverAngle = 0;
    this.wheelTracks = [];
  }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // 1. Martian Atmospheric Sky Background (Butterscotch / rust sky)
    this.cameras.main.setBackgroundColor('#1c0d02');

    // 2. High-Resolution HiRISE Jezero Crater Panoramic Backdrop
    if (this.textures.exists('mars_jezero')) {
      this.marsBackdrop = this.add.image(W / 2, H / 2, 'mars_jezero')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(W * 1.05, H * 1.05)
        .setAlpha(0.28)
        .setDepth(0);
    }

    const cols = this.cfg.params.gridCols;
    const rows = this.cfg.params.gridRows;

    const maxW = W - 220;
    const maxH = H - 90;
    this.tileSize = Math.min(Math.floor(maxW / cols), Math.floor(maxH / rows), 58);
    this.offsetX = (W - this.tileSize * cols) / 2;
    this.offsetY = 46;

    // Generate grid
    this.generateGrid(cols, rows);

    // Graphic layers
    this.tracksGfx = this.add.graphics().setDepth(1);
    this.gridGfx = this.add.graphics().setDepth(2);
    this.waypointGfx = this.add.graphics().setDepth(3);
    this.sandstormGfx = this.add.graphics().setDepth(8);
    this.minimapGfx = this.add.graphics().setDepth(20);

    // Rover start position
    this.roverX = 1;
    this.roverY = 1;
    this.fromX = this.roverX;
    this.fromY = this.roverY;
    this.grid[this.roverY][this.roverX] = 'clear';

    // Rover Container (Vehicle body + Forward dual headlights)
    this.roverContainer = this.add.container(0, 0).setDepth(6);
    this.headlightGfx = this.add.graphics();
    this.roverGfx = this.add.graphics();
    this.drawPhotorealisticRover(this.roverGfx);
    this.drawHeadlights(this.headlightGfx);
    this.roverContainer.add([this.headlightGfx, this.roverGfx]);
    this.updateRoverVisual();

    // HUD
    this.buildHUD(W, H);

    // Click to navigate
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      const gx = Math.floor((ptr.x - this.offsetX) / this.tileSize);
      const gy = Math.floor((ptr.y - this.offsetY) / this.tileSize);
      if (this.isValidTile(gx, gy) && this.grid[gy][gx] !== 'crater' && this.grid[gy][gx] !== 'rock') {
        this.moveQueue = [{ tx: gx, ty: gy }];
      }
    });

    // Keyboard
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.drawGrid();

    // Instructions
    this.add.text(W / 2, H - 12, 'CLICK TILE or WASD/ARROWS: Navigate Rover  |  Collect All Science Core Samples (★)', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#fbbf24',
      backgroundColor: '#020617d0',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setDepth(25);
  }

  private generateGrid(cols: number, rows: number) {
    for (let y = 0; y < rows; y++) {
      this.grid[y] = [];
      for (let x = 0; x < cols; x++) {
        this.grid[y][x] = 'clear';
      }
    }

    const numCraters = Math.floor(cols * rows * this.cfg.params.craterDensity);
    for (let i = 0; i < numCraters; i++) {
      const cx = Phaser.Math.Between(0, cols - 1);
      const cy = Phaser.Math.Between(0, rows - 1);
      if (!(cx === 1 && cy === 1)) {
        this.grid[cy][cx] = 'crater';
      }
    }

    const numRocks = Math.floor(cols * rows * 0.12);
    for (let i = 0; i < numRocks; i++) {
      const rx = Phaser.Math.Between(0, cols - 1);
      const ry = Phaser.Math.Between(0, rows - 1);
      if (this.grid[ry][rx] === 'clear' && !(rx === 1 && ry === 1)) {
        this.grid[ry][rx] = 'rock';
      }
    }

    // Place waypoints
    this.waypoints = [];
    let placed = 0;
    let attempts = 0;
    while (placed < this.cfg.params.numWaypoints && attempts < 100) {
      attempts++;
      const wx = Phaser.Math.Between(0, cols - 1);
      const wy = Phaser.Math.Between(0, rows - 1);
      if (this.grid[wy][wx] === 'clear' && (Math.abs(wx - 1) + Math.abs(wy - 1) > 2)) {
        this.grid[wy][wx] = 'waypoint';
        this.waypoints.push({ gx: wx, gy: wy, collected: false });
        placed++;
      }
    }
  }

  private drawGrid() {
    const g = this.gridGfx;
    g.clear();
    const cols = this.cfg.params.gridCols;
    const rows = this.cfg.params.gridRows;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = this.offsetX + x * this.tileSize;
        const py = this.offsetY + y * this.tileSize;
        const t = this.tileSize;

        // Base Martian Ochre Regolith Ground
        g.fillStyle(0x7c2d12, 0.95);
        g.fillRect(px, py, t, t);

        // Subtle soil dune texture noise
        g.fillStyle(0x9a3412, 0.4);
        g.fillRect(px + 2, py + 2, t - 4, t / 2 - 2);

        switch (this.grid[y][x]) {
          case 'crater':
            // High-depth shadow
            g.fillStyle(0x271005, 1);
            g.fillCircle(px + t / 2, py + t / 2, t * 0.42);
            // Sunlit rim specular
            g.lineStyle(2, 0xc2410c, 0.85);
            g.strokeCircle(px + t / 2, py + t / 2, t * 0.42);
            // Internal basalt floor
            g.fillStyle(0x150702, 1);
            g.fillCircle(px + t / 2 - 2, py + t / 2 - 2, t * 0.28);
            break;

          case 'rock':
            // 3D Directional shadow
            g.fillStyle(0x180903, 0.85);
            g.fillEllipse(px + t * 0.45, py + t * 0.55, t * 0.55, t * 0.35);
            // Shaded basalt boulder
            g.fillStyle(0x78350f, 1);
            g.fillEllipse(px + t * 0.36, py + t * 0.4, t * 0.52, t * 0.4);
            // Specular sun highlight
            g.fillStyle(0xb45309, 1);
            g.fillEllipse(px + t * 0.32, py + t * 0.36, t * 0.28, t * 0.2);
            break;

          case 'waypoint':
          case 'collected':
          case 'clear':
          default:
            break;
        }

        // Precision tactical grid borders
        g.lineStyle(1, 0x9a3412, 0.35);
        g.strokeRect(px, py, t, t);
      }
    }

    // Draw Science Sample Waypoint Laser Beacons
    this.waypointGfx.clear();
    for (const wp of this.waypoints) {
      const px = this.offsetX + wp.gx * this.tileSize + this.tileSize / 2;
      const py = this.offsetY + wp.gy * this.tileSize + this.tileSize / 2;

      if (!wp.collected) {
        // Holographic green scanning ring
        this.waypointGfx.lineStyle(2, 0x22c55e, 0.9);
        this.waypointGfx.strokeCircle(px, py, this.tileSize * 0.38);

        // Inner glowing core
        this.waypointGfx.fillStyle(0x22c55e, 0.3);
        this.waypointGfx.fillCircle(px, py, this.tileSize * 0.38);

        // Core star marker
        this.waypointGfx.fillStyle(0xfde047, 1);
        this.waypointGfx.fillCircle(px, py, 4);

        // Target crosshair
        this.waypointGfx.lineStyle(1.5, 0x86efac, 0.8);
        this.waypointGfx.lineBetween(px - 10, py, px + 10, py);
        this.waypointGfx.lineBetween(px, py - 10, px, py + 10);
      } else {
        // Collected checkmark flag
        this.waypointGfx.fillStyle(0x059669, 0.7);
        this.waypointGfx.fillCircle(px, py, 6);
        this.waypointGfx.lineStyle(1.5, 0x10b981, 1);
        this.waypointGfx.strokeCircle(px, py, 6);
      }
    }
  }

  /**
   * Authentic NASA Perseverance / Curiosity Rover
   * 6-wheel rocker-bogie differential suspension, machined aluminum cleat treads,
   * gold MLI warm electronics box, aft MMRTG nuclear generator with black cooling fins,
   * Remote Sensing Mast with Mastcam-Z & SuperCam lenses, and robotic arm with coring drill.
   */
  private drawPhotorealisticRover(g: Phaser.GameObjects.Graphics) {
    g.clear();
    const t = this.tileSize;

    // ─── 1. ROCKER-BOGIE TITANIUM SUSPENSION TUBES ───
    g.lineStyle(2, 0x475569, 1);
    // Left side bogie linkage
    g.lineBetween(-t * 0.35, -t * 0.22, -t * 0.35, t * 0.22);
    // Right side bogie linkage
    g.lineBetween(t * 0.35, -t * 0.22, t * 0.35, t * 0.22);
    // Differential pivot bar
    g.lineBetween(-t * 0.35, 0, t * 0.35, 0);

    // ─── 2. 6 MACHINED ALUMINUM CLEATED WHEELS ───
    const drawWheel = (wx: number, wy: number) => {
      // Dark anodized rim
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(wx - t * 0.08, wy - t * 0.12, t * 0.16, t * 0.24, 3);
      // Outer aluminum tread
      g.lineStyle(1.5, 0x94a3b8, 1);
      g.strokeRoundedRect(wx - t * 0.08, wy - t * 0.12, t * 0.16, t * 0.24, 3);
      // Chevron cleat pattern
      g.fillStyle(0x64748b, 1);
      g.fillRect(wx - t * 0.06, wy - t * 0.04, t * 0.12, 2);
      g.fillRect(wx - t * 0.06, wy + t * 0.04, t * 0.12, 2);
    };

    // Front pair
    drawWheel(-t * 0.36, -t * 0.24);
    drawWheel(t * 0.36, -t * 0.24);
    // Middle pair
    drawWheel(-t * 0.38, 0);
    drawWheel(t * 0.38, 0);
    // Rear pair
    drawWheel(-t * 0.36, t * 0.24);
    drawWheel(t * 0.36, t * 0.24);

    // ─── 3. WARM ELECTRONICS BOX (WEB) HULL ───
    // Gold Multi-Layer Insulation (MLI) draped core
    g.fillStyle(0xd97706, 1);
    g.fillRoundedRect(-t * 0.25, -t * 0.22, t * 0.5, t * 0.44, 4);

    // MLI Gold Specular Reflection Wrinkles
    g.fillStyle(0xfde68a, 0.95);
    g.fillRect(-t * 0.22, -t * 0.18, t * 0.18, t * 0.14);
    g.fillRect(t * 0.04, -t * 0.1, t * 0.16, t * 0.12);

    // Top Equipment Deck (White / Silver Aerospace Composite)
    g.fillStyle(0xe2e8f0, 1);
    g.fillRoundedRect(-t * 0.2, -t * 0.16, t * 0.4, t * 0.32, 3);

    // ─── 4. AFT MMRTG NUCLEAR POWER GENERATOR ───
    // Cylindrical core
    g.fillStyle(0x334155, 1);
    g.fillRect(-t * 0.12, t * 0.18, t * 0.24, t * 0.14);
    // Black radiation cooling fins radiating backwards
    g.fillStyle(0x0f172a, 1);
    for (let f = -2; f <= 2; f++) {
      g.fillRect(f * (t * 0.05) - 1, t * 0.22, 2, t * 0.1);
    }
    // High-temperature core glow
    g.fillStyle(0xef4444, 0.85);
    g.fillCircle(0, t * 0.25, 2);

    // ─── 5. REMOTE SENSING MAST (SuperCam & Mastcam-Z) ───
    g.fillStyle(0x475569, 1);
    g.fillRect(-t * 0.04, -t * 0.28, t * 0.08, t * 0.14); // Mast riser
    // Camera head azimuth box
    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(-t * 0.1, -t * 0.38, t * 0.2, t * 0.12, 2);
    // Dual Stereo Optics (Mastcam-Z coated lenses)
    g.fillStyle(0x0284c7, 1);
    g.fillCircle(-t * 0.05, -t * 0.32, 2.5);
    g.fillCircle(t * 0.05, -t * 0.32, 2.5);
    // SuperCam Laser Aperture in Center
    g.fillStyle(0xef4444, 1);
    g.fillCircle(0, -t * 0.35, 1.5);

    // ─── 6. ROBOTIC TURRET ARM & CORING DRILL ───
    g.lineStyle(2, 0x64748b, 1);
    g.lineBetween(t * 0.12, -t * 0.14, t * 0.22, -t * 0.3);
    g.fillStyle(0x334155, 1);
    g.fillCircle(t * 0.22, -t * 0.3, 3); // Turret drill head
  }

  /**
   * Forward High-Intensity LED Light Beams
   */
  private drawHeadlights(g: Phaser.GameObjects.Graphics) {
    g.clear();
    const t = this.tileSize;

    // Translucent light cones projecting forward
    g.fillStyle(0xfef08a, 0.25);
    g.beginPath();
    g.moveTo(-t * 0.12, -t * 0.2);
    g.lineTo(-t * 0.45, -t * 0.85);
    g.lineTo(-t * 0.02, -t * 0.85);
    g.closePath();
    g.fill();

    g.beginPath();
    g.moveTo(t * 0.12, -t * 0.2);
    g.lineTo(t * 0.02, -t * 0.85);
    g.lineTo(t * 0.45, -t * 0.85);
    g.closePath();
    g.fill();

    // Hot LED bulb glares
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(-t * 0.12, -t * 0.2, 2);
    g.fillCircle(t * 0.12, -t * 0.2, 2);
  }

  private updateRoverVisual() {
    const px = this.offsetX + this.roverX * this.tileSize + this.tileSize / 2;
    const py = this.offsetY + this.roverY * this.tileSize + this.tileSize / 2;
    this.roverContainer.setPosition(px, py);
    this.roverContainer.setAngle(this.roverAngle);
  }

  update(_time: number, delta: number) {
    if (this.done) return;
    const dt = delta / 1000;
    this.timeElapsed += dt;

    this.handleKeyboardInput();
    this.updateMovement(dt);
    this.updateSandstorm(dt);
    this.updateMinimap();
    this.updateHUD();

    if (this.timeElapsed > this.cfg.params.timeLimitSec) {
      this.fail('Mission clock expired — Sol twilight reached with low battery reserves.');
    }
  }

  private handleKeyboardInput() {
    if (this.isMoving) return;

    let tx = this.roverX;
    let ty = this.roverY;

    if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up!)) ty--;
    else if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down!)) ty++;
    else if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left!)) tx--;
    else if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right!)) tx++;
    else return;

    if (this.isValidTile(tx, ty) && this.grid[ty][tx] !== 'crater' && this.grid[ty][tx] !== 'rock') {
      this.moveQueue = [{ tx, ty }];
    }
  }

  private updateMovement(dt: number) {
    if (this.isMoving) {
      this.moveProgress += dt * 4.2;

      // Imprint tire tracks during transit
      const nx = this.fromX + (((this.moveQueue[0]?.tx ?? this.roverX)) - this.fromX) * this.moveProgress;
      const ny = this.fromY + (((this.moveQueue[0]?.ty ?? this.roverY)) - this.fromY) * this.moveProgress;
      const px = this.offsetX + nx * this.tileSize + this.tileSize / 2;
      const py = this.offsetY + ny * this.tileSize + this.tileSize / 2;
      this.roverContainer.setPosition(px, py);

      if (Math.random() < 0.35) {
        this.wheelTracks.push({ x: px, y: py, angle: this.roverAngle });
        if (this.wheelTracks.length > 80) this.wheelTracks.shift();
        this.renderTireTracks();
      }

      if (this.moveProgress >= 1) {
        this.moveProgress = 1;
        this.roverX = this.moveQueue[0]?.tx ?? this.roverX;
        this.roverY = this.moveQueue[0]?.ty ?? this.roverY;
        this.fromX = this.roverX;
        this.fromY = this.roverY;
        this.moveQueue.shift();
        this.isMoving = false;
        this.moveProgress = 0;
        this.battery = Math.max(0, this.battery - (this.sandstormActive ? 2.5 : 1));
        this.checkWaypoint();
        this.drawGrid();
      }
    } else if (this.moveQueue.length > 0) {
      const next = this.moveQueue[0];
      const dx = next.tx - this.roverX;
      const dy = next.ty - this.roverY;
      if (Math.abs(dx) + Math.abs(dy) > 0) {
        this.roverAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        this.fromX = this.roverX;
        this.fromY = this.roverY;
        this.isMoving = true;
        this.moveProgress = 0;
        this.roverContainer.setAngle(this.roverAngle);
      } else {
        this.moveQueue.shift();
      }
    }
  }

  private renderTireTracks() {
    this.tracksGfx.clear();
    const t = this.tileSize;
    for (const tr of this.wheelTracks) {
      this.tracksGfx.save();
      this.tracksGfx.translateCanvas(tr.x, tr.y);
      this.tracksGfx.rotateCanvas((tr.angle * Math.PI) / 180);

      // Left & right wheel indentation tracks
      this.tracksGfx.fillStyle(0x431407, 0.65);
      this.tracksGfx.fillRect(-t * 0.32, -2, 4, 4);
      this.tracksGfx.fillRect(t * 0.32 - 4, -2, 4, 4);

      this.tracksGfx.restore();
    }
  }

  private checkWaypoint() {
    for (const wp of this.waypoints) {
      if (!wp.collected && wp.gx === this.roverX && wp.gy === this.roverY) {
        wp.collected = true;
        this.grid[wp.gy][wp.gx] = 'collected';
        this.waypointsCollected++;
        this.cameras.main.flash(250, 34, 197, 94);

        if (this.waypointsCollected >= this.cfg.params.numWaypoints) {
          this.done = true;
          const score = Math.round(
            80 + (this.battery / this.cfg.params.batteryCapacity) * 20 -
            (this.timeElapsed / this.cfg.params.timeLimitSec) * 30
          );
          this.showResult(true, `ALL JEZERO CORE SAMPLES DRILL-CACHED! Score: ${Math.max(15, score)} | Battery: ${this.battery.toFixed(1)}%`);
          this.cfg.onSuccess(Math.max(15, score));
        }
      }
    }
  }

  private updateSandstorm(dt: number) {
    this.sandstormTimer -= dt;
    if (this.sandstormTimer <= 0) {
      const prob = this.cfg.params.sandstormProbability;
      if (!this.sandstormActive && Math.random() < prob * dt * 0.3) {
        this.sandstormActive = true;
        this.sandstormTimer = Phaser.Math.Between(5, 14);
      } else {
        this.sandstormActive = false;
        this.sandstormTimer = Phaser.Math.Between(10, 24);
      }
    }

    const targetAlpha = this.sandstormActive ? 0.6 : 0;
    this.dustAlpha += (targetAlpha - this.dustAlpha) * 0.05;

    this.sandstormGfx.clear();
    if (this.dustAlpha > 0.01) {
      const W = this.cameras.main.width;
      const H = this.cameras.main.height;
      this.sandstormGfx.fillStyle(0xb45309, this.dustAlpha);
      this.sandstormGfx.fillRect(0, 0, W, H);

      this.sandstormGfx.lineStyle(1.5, 0xd97706, this.dustAlpha * 0.7);
      for (let i = 0; i < 20; i++) {
        const sx = Phaser.Math.Between(0, W);
        const sy = Phaser.Math.Between(0, H);
        this.sandstormGfx.lineBetween(sx, sy, sx + Phaser.Math.Between(30, 90), sy + Phaser.Math.Between(-6, 6));
      }
    }
  }

  private updateMinimap() {
    const W = this.cameras.main.width;
    const mmW = 95, mmH = 75;
    const mmX = W - mmW - 12, mmY = 12;
    this.minimapGfx.clear();
    this.minimapGfx.fillStyle(0x020617, 0.9);
    this.minimapGfx.fillRoundedRect(mmX, mmY, mmW, mmH, 6);
    this.minimapGfx.lineStyle(1.5, 0x0284c7, 0.6);
    this.minimapGfx.strokeRoundedRect(mmX, mmY, mmW, mmH, 6);

    const cols = this.cfg.params.gridCols;
    const rows = this.cfg.params.gridRows;
    const tw = mmW / cols;
    const th = mmH / rows;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const t = this.grid[y][x];
        const col = t === 'crater' ? 0x1c0d02 : t === 'rock' ? 0x451a03 :
          t === 'waypoint' ? 0x22c55e : t === 'collected' ? 0x059669 : 0x7c2d12;
        this.minimapGfx.fillStyle(col, 1);
        this.minimapGfx.fillRect(mmX + x * tw, mmY + y * th, tw, th);
      }
    }

    // Rover icon
    this.minimapGfx.fillStyle(0x38bdf8, 1);
    this.minimapGfx.fillCircle(mmX + this.roverX * tw + tw / 2, mmY + this.roverY * th + th / 2, 3.5);
  }

  private buildHUD(_W: number, _H: number) {
    const panel = this.add.graphics().setDepth(20);
    panel.fillStyle(0x020617, 0.88);
    panel.fillRoundedRect(12, 12, 230, 130, 10);
    panel.lineStyle(1.5, 0x0284c7, 0.6);
    panel.strokeRoundedRect(12, 12, 230, 130, 10);

    const title = this.add.text(22, 18, 'JEZERO CRATER // PERSEVERANCE TELEOPERATION', {
      fontFamily: 'monospace',
      fontSize: '8.5px',
      color: '#38bdf8',
      letterSpacing: 1,
    }).setDepth(21);

    this.hudText = this.add.text(22, 34, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#f8fafc',
      lineSpacing: 5,
    }).setDepth(21);
  }

  private updateHUD() {
    const remaining = this.cfg.params.numWaypoints - this.waypointsCollected;
    const tLeft = Math.max(0, this.cfg.params.timeLimitSec - this.timeElapsed).toFixed(0);
    const battPct = (this.battery / this.cfg.params.batteryCapacity * 100).toFixed(0);

    this.hudText.setText([
      `CACHED CORES: ${this.waypointsCollected} / ${this.cfg.params.numWaypoints} (${remaining} REMAINING)`,
      `MMRTG BATTERY: ${battPct}% ${parseInt(battPct) < 25 ? '⚠️ LOW' : '✓'}`,
      `SOL DURATION: ${tLeft} S`,
      `MOBILITY: 6-WHEEL ROCKER-BOGIE`,
      this.sandstormActive ? '🌪 REGOLITH DUST STORM (2.5× DRAW)' : 'WEATHER: ATMOSPHERE CLEAR (~610 Pa)',
    ].join('\n'));
  }

  private isValidTile(gx: number, gy: number): boolean {
    return gx >= 0 && gy >= 0 && gx < this.cfg.params.gridCols && gy < this.cfg.params.gridRows;
  }

  private fail(reason: string) {
    this.done = true;
    this.showResult(false, reason);
    this.cfg.onFailure(reason);
  }

  private showResult(ok: boolean, msg: string) {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const bg = this.add.graphics().setDepth(50);
    bg.fillStyle(0x020617, 0.88);
    bg.fillRect(0, 0, W, H);

    this.add.text(W / 2, H / 2 - 40, ok ? '🤖 SURFACE MISSION COMPLETE' : '❌ ROVER COMPROMISED', {
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
}
