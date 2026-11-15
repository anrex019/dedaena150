import { debugGame } from './debug';
import Phaser from 'phaser';
import { levels, requiredItems, type LevelData, type LevelQuestion, type Platform } from '../data/levels';
import { getState, noteLevelClear, patch } from '../lib/store';
import { sound } from '../lib/sound';
import { collectTexture, gameFiles, textureForArt, type GameTexture } from './assets';
import { GameBridge } from './bridge';

const VIEW_W = 960;
const VIEW_H = 540;
const HERO_W = 200;
const HERO_H = 260;
const HERO_DRAW = 150;
const MAX_SPEED = 240;
const ACCEL = 1500;
const DECEL = 2100;
const JUMP = -560;
const JUMP_CUT = -220;
const PLATFORM_H = 68;

interface Boot {
  levelIndex: number;
  bridge: GameBridge;
  reduced: boolean;
}

interface Pickup {
  sprite: Phaser.GameObjects.Image;
  id: string;
  bonus: boolean;
  secret: boolean;
  taken: boolean;
  baseY: number;
  ride: Phaser.GameObjects.Image | null;
  localX: number;
  glow: Phaser.GameObjects.Image | null;
}

interface Mover {
  sprite: Phaser.Physics.Arcade.Image;
  axis: 'x' | 'y';
  origin: number;
  distance: number;
  period: number;
  dx: number;
  dy: number;
}

interface Gate {
  x: number;
  y: number;
  used: boolean;
  question?: LevelQuestion;
  sprite: Phaser.GameObjects.Image;
}

type Pose = 'idle' | 'run' | 'jump' | 'fall' | 'land' | 'collect' | 'win';

export class LevelScene extends Phaser.Scene {
  private boot: Boot | null = null;
  private level!: LevelData;
  private bridge!: GameBridge;
  private reduced = false;
  private player!: Phaser.Physics.Arcade.Sprite;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private items: Pickup[] = [];
  private movers: Mover[] = [];
  private hosts: Phaser.GameObjects.Image[] = [];
  private checkpoints: Gate[] = [];
  private hazards: { x: number; y: number; w: number; sprite: Phaser.GameObjects.Image }[] = [];
  private goal!: { x: number; y: number; sprite: Phaser.GameObjects.Image; opened: boolean };
  private spawn = { x: 80, y: 400 };
  private required = 0;
  private collected = 0;
  private found: string[] = [];
  private lives = 3;
  private coyote = 0;
  private jumpBuffer = 0;
  private jumpPrev = false;
  private jumping = false;
  private invuln = false;
  private ended = false;
  private asking = false;
  private pending: LevelQuestion | null = null;
  private goalWaiting = false;
  private hazardUntil = 0;
  private held = false;
  private pose: Pose = 'idle';
  private poseUntil = 0;
  private wordToken = 0;
  private escHandler?: () => void;

  constructor() {
    super('level');
  }

  init(data?: Boot) {
    this.boot = data?.bridge ? data : null;
  }

  preload() {
    const base = `${import.meta.env.BASE_URL}art/game/`;
    (Object.entries(gameFiles) as [GameTexture, string][]).forEach(([key, file]) => {
      if (!this.textures.exists(key)) this.load.image(key, base + file);
    });
  }

  create() {
    if (!this.boot) return;
    const { levelIndex, bridge, reduced } = this.boot;
    debugGame('scene:create', { levelIndex });
    this.bridge = bridge;
    this.reduced = reduced;
    this.level = levels[levelIndex];
    this.required = requiredItems(this.level).length;
    this.collected = 0;
    this.found = [];
    this.lives = 3;
    this.ended = false;
    this.asking = false;
    this.pending = null;
    this.goalWaiting = false;
    this.hazardUntil = 0;
    this.held = false;
    this.invuln = false;
    this.jumping = false;
    this.pose = 'idle';
    this.poseUntil = 0;
    this.items = [];
    this.movers = [];
    this.hosts = [];
    this.checkpoints = [];
    this.hazards = [];
    this.wordToken = 0;

    if (!this.textures.exists('spark')) {
      const canvas = this.textures.createCanvas('spark', 12, 12);
      const ctx = canvas?.getContext();
      if (canvas && ctx) {
        const glow = ctx.createRadialGradient(6, 6, 0, 6, 6, 6);
        glow.addColorStop(0, 'rgba(255,236,180,1)');
        glow.addColorStop(1, 'rgba(255,236,180,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 12, 12);
        canvas.refresh();
      }
    }
    if (!this.textures.exists('dust')) {
      const canvas = this.textures.createCanvas('dust', 10, 10);
      const ctx = canvas?.getContext();
      if (canvas && ctx) {
        const puff = ctx.createRadialGradient(5, 5, 0, 5, 5, 5);
        puff.addColorStop(0, 'rgba(214,184,140,0.9)');
        puff.addColorStop(1, 'rgba(214,184,140,0)');
        ctx.fillStyle = puff;
        ctx.fillRect(0, 0, 10, 10);
        canvas.refresh();
      }
    }
    if (!this.anims.exists('run')) {
      this.anims.create({
        key: 'run',
        frames: [{ key: 'hero-run1' }, { key: 'hero-run2' }],
        frameRate: 10,
        repeat: -1,
      });
    }

    const level = this.level;
    const sky = level.theme === 'cave' ? '#1a1438' : level.theme === 'temple' ? '#2a1c14' : '#8ec6ef';
    this.cameras.main.setBackgroundColor(sky);
    this.cameras.main.setBounds(0, 0, level.width, VIEW_H);
    this.physics.world.setBounds(0, -200, level.width, 1100);
    this.physics.world.setBoundsCollision(true, true, false, false);

    const bgKey = level.theme === 'cave' ? 'bg-cave' : level.theme === 'temple' ? 'bg-temple' : 'bg-forest';
    const backdrop = this.add.image(0, VIEW_H / 2, bgKey).setOrigin(0, 0.5).setScrollFactor(0.2).setDepth(-20);
    backdrop.displayWidth = VIEW_W + (level.width - VIEW_W) * 0.2;
    backdrop.displayHeight = VIEW_H;

    if (!reduced) {
      for (let i = 0; i < 10; i += 1) {
        const spark = this.add.image(80 + i * 90, 40 + (i % 4) * 28, 'spark').setScrollFactor(0.35).setDepth(-6).setAlpha(0.8);
        this.tweens.add({
          targets: spark,
          y: spark.y - 18,
          alpha: 0.25,
          duration: 1600 + i * 120,
          yoyo: true,
          repeat: -1,
        });
      }
    }

    this.solids = this.physics.add.staticGroup();
    const tint = level.theme === 'cave' ? 0xb7c6ea : level.theme === 'temple' ? 0xf0d8b4 : 0xffffff;
    level.platforms.forEach((platform, index) => {
      if (platform.move) {
        this.hosts[index] = this.addMover(platform, tint);
        return;
      }
      const solid = this.solids.create(platform.x, platform.y, 'platform-grass') as Phaser.Physics.Arcade.Image;
      solid.setOrigin(0, 0).setDisplaySize(platform.w, PLATFORM_H).setTint(tint).setDepth(2);
      solid.refreshBody();
      this.hosts[index] = solid;
      if (index % 2 === 0) {
        const lantern = this.add.image(platform.x + 28, platform.y - 6, 'prop-lantern').setOrigin(0.5, 1).setDisplaySize(28, 36).setDepth(1);
        if (!reduced) this.tweens.add({ targets: lantern, y: lantern.y - 5, duration: 1400, yoyo: true, repeat: -1 });
      } else if (level.theme === 'forest') {
        this.add.image(platform.x + platform.w - 36, platform.y - 4, 'item-violet').setOrigin(0.5, 1).setDisplaySize(34, 40).setDepth(1);
      }
    });

    const surface = (spot: { x: number; platform: number }) => level.platforms[spot.platform].y;
    level.items.forEach((item) => {
      const y = surface(item) - 6;
      const platform = level.platforms[item.platform];
      const sprite = this.add.image(item.x, y, textureForArt(item.art)).setOrigin(0.5, 1).setDisplaySize(46, 46).setDepth(3);
      const glow = reduced
        ? null
        : this.add.image(item.x, y - 18, 'spark').setDepth(2).setAlpha(0.55).setScale(item.secret ? 3 : 2.2);
      if (item.secret && glow) glow.setTint(0xffd56a);
      this.items.push({
        sprite,
        id: item.id,
        bonus: Boolean(item.bonus || item.secret),
        secret: Boolean(item.secret),
        taken: false,
        baseY: y,
        ride: platform.move ? this.hosts[item.platform] : null,
        localX: item.x - platform.x,
        glow,
      });
    });

    this.checkpoints = level.checkpoints.map((spot) => {
      const sprite = this.add.image(spot.x, surface(spot) - 4, 'prop-lantern').setOrigin(0.5, 1).setDisplaySize(36, 48).setDepth(3);
        if (!reduced) this.tweens.add({ targets: sprite, y: sprite.y - 7, duration: 700, yoyo: true, repeat: -1 });
      return { x: spot.x, y: surface(spot), used: false, question: spot.question, sprite };
    });
    this.hazards = (level.hazards ?? []).map((hazard) => ({
      ...hazard,
      sprite: this.add.image(hazard.x + hazard.w / 2, hazard.y + 18, 'item-crystal')
        .setDisplaySize(42, 50)
        .setDepth(2)
        .setAlpha(0.92),
    }));

    const goalY = surface(level.goal);
    const portal = this.add.image(level.goal.x, goalY, 'portal').setOrigin(0.5, 1).setDisplaySize(92, 128).setDepth(3);
    this.goal = { x: level.goal.x, y: goalY, sprite: portal, opened: false };
    if (!reduced) {
      this.tweens.add({ targets: portal, scaleX: portal.scaleX * 1.04, scaleY: portal.scaleY * 1.04, duration: 900, yoyo: true, repeat: -1 });
      for (let i = 0; i < 5; i += 1) {
        const mote = this.add.image(level.goal.x - 20 + i * 10, goalY - 40 - (i % 3) * 16, 'spark').setDepth(4).setAlpha(0.85);
        this.tweens.add({
          targets: mote,
          y: mote.y - 22,
          alpha: 0.2,
          duration: 900 + i * 140,
          yoyo: true,
          repeat: -1,
        });
      }
    }

    this.spawn = { x: level.spawn.x, y: surface(level.spawn) };
    this.player = this.physics.add.sprite(this.spawn.x, this.spawn.y, 'hero-idle');
    this.player.setOrigin(0.5, 1).setDepth(5).setCollideWorldBounds(true);
    this.player.setScale(HERO_DRAW / HERO_H);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(90, 96);
    body.setOffset((HERO_W - 90) / 2, HERO_H - 96);
    body.setMaxVelocity(MAX_SPEED, 760);
    this.physics.add.collider(this.player, this.solids);
    this.movers.forEach((mover) => this.physics.add.collider(this.player, mover.sprite));
    // Smooth camera tracking without a deadzone: prevents the sudden catch-up
    // when the player crosses a narrow mobile viewport threshold.
    this.cameras.main.startFollow(this.player, true, 0.065, 0.09);
    const viewW = this.cameras.main.width;
    const narrowCam = viewW < 800;
    this.cameras.main.setDeadzone(0, 0);
    this.cameras.main.setFollowOffset(narrowCam ? -Math.round(viewW * 0.16) : 0, 0);
    const fitCamera = () => {
      const width = this.cameras.main.width;
      const narrow = width < 800;
      this.cameras.main.setDeadzone(0, 0);
      this.cameras.main.setFollowOffset(narrow ? -Math.round(width * 0.16) : 0, 0);
    };
    this.scale.on(Phaser.Scale.Events.RESIZE, fitCamera);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, fitCamera);
    });

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      keyboard.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE', 'W', 'A', 'D']);
      this.escHandler = () => {
        if (!this.ended && !this.asking) this.bridge.togglePause();
      };
      keyboard.on('keydown-ESC', this.escHandler);
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.escHandler) this.input.keyboard?.off('keydown-ESC', this.escHandler);
    });

    bridge.reset(level.title, this.required);
    bridge.onRestart = () => this.scene.restart({ levelIndex, bridge, reduced });
    bridge.onChoose = (index) => this.answer(index);
    bridge.onDismiss = () => {
      this.bridge.emit({ wordId: null, freshWord: false });
    };
    this.emitHud(null);
  }

  private addMover(platform: Platform, tint: number) {
    const sprite = this.physics.add.image(platform.x, platform.y, 'platform-grass');
    sprite.setOrigin(0, 0).setDisplaySize(platform.w, PLATFORM_H).setTint(tint).setDepth(2).setImmovable(true);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.moves = false;
    body.setSize(sprite.width, sprite.height, false);
    body.setOffset(0, 0);
    const move = platform.move!;
    this.movers.push({
      sprite,
      axis: move.axis,
      origin: move.axis === 'x' ? platform.x : platform.y,
      distance: move.distance,
      period: move.period,
      dx: 0,
      dy: 0,
    });
    return sprite;
  }

  update(_time: number, delta: number) {
    if (!this.player || this.ended) return;
    const touch = this.bridge.touch;
    const paused = this.bridge.isPaused() || this.asking;
    if (paused) {
      this.jumpPrev = touch.jump;
      if (!this.held) {
        this.physics.pause();
        this.player.setVelocity(0, 0);
        this.held = true;
      }
      return;
    }
    if (this.held) {
      this.physics.resume();
      this.held = false;
    }

    const dt = Math.max(0.001, delta / 1000);
    for (const mover of this.movers) {
      const body = mover.sprite.body as Phaser.Physics.Arcade.Body;
      const phase = (this.time.now / mover.period) * Math.PI * 2;
      const desired = mover.origin + Math.sin(phase) * mover.distance;
      const previousX = mover.sprite.x;
      const previousY = mover.sprite.y;
      if (mover.axis === 'x') mover.sprite.x = desired;
      else mover.sprite.y = desired;
      mover.dx = mover.sprite.x - previousX;
      mover.dy = mover.sprite.y - previousY;
      body.updateFromGameObject();
      body.setVelocity(mover.dx / dt, mover.dy / dt);
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const left = Boolean(this.cursors?.left.isDown || this.keyA?.isDown || touch.left);
    const right = Boolean(this.cursors?.right.isDown || this.keyD?.isDown || touch.right);
    let vx = body.velocity.x;
    if (left && !right) {
      vx = Math.max(-MAX_SPEED, vx - ACCEL * dt);
      this.player.setFlipX(true);
    } else if (right && !left) {
      vx = Math.min(MAX_SPEED, vx + ACCEL * dt);
      this.player.setFlipX(false);
    } else {
      const sign = Math.sign(vx);
      const slowed = Math.abs(vx) - DECEL * dt;
      vx = slowed > 0 ? sign * slowed : 0;
    }
    body.setVelocityX(vx);

    const grounded = body.blocked.down || body.touching.down;
    this.coyote = grounded ? 150 : Math.max(0, this.coyote - delta);
    const jumpHeld = Boolean(
      touch.jump || this.cursors?.up.isDown || this.cursors?.space.isDown || this.keyW?.isDown,
    );
    const pressed =
      (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.space)) ||
      (this.keyW && Phaser.Input.Keyboard.JustDown(this.keyW)) ||
      (touch.jump && !this.jumpPrev);
    this.jumpPrev = touch.jump;
    if (pressed) this.jumpBuffer = 160;
    else this.jumpBuffer = Math.max(0, this.jumpBuffer - delta);
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      body.setVelocityY(JUMP);
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.jumping = true;
      sound.play('jump');
      this.burst(this.player.x, this.player.y, 4, 'dust');
    } else if (this.jumping && !jumpHeld && body.velocity.y < JUMP_CUT) {
      body.setVelocityY(JUMP_CUT);
      this.jumping = false;
    }
    if (body.velocity.y > 0) this.jumping = false;

    this.poseFor(grounded, body.velocity.x, body.velocity.y);
    this.animateMotion(delta, grounded, body.velocity.x);
    this.rideMovers(body);

    for (const item of this.items) {
      if (item.ride) {
        item.sprite.x = item.ride.x + item.localX;
        item.baseY = item.ride.y - 6;
      }
      if (item.glow) {
        item.glow.setPosition(item.sprite.x, item.baseY - 16);
        item.glow.setAlpha(item.taken ? 0 : 0.35 + Math.sin(this.time.now / 260) * 0.2);
      }
      if (item.taken) continue;
      if (!this.reduced) item.sprite.y = item.baseY + Math.sin(this.time.now / 280 + item.baseY) * 6;
      else item.sprite.y = item.baseY;
      if (Math.abs(this.player.x - item.sprite.x) < 42 && Math.abs(this.player.y - item.baseY) < 70) this.collect(item);
    }

    for (const checkpoint of this.checkpoints) {
      if (checkpoint.used) continue;
      if (Math.abs(this.player.x - checkpoint.x) < 46 && Math.abs(this.player.y - checkpoint.y) < 48) {
        checkpoint.used = true;
        debugGame('checkpoint:activated', { x: checkpoint.x, y: checkpoint.y, playerX: this.player.x, playerY: this.player.y, cameraX: this.cameras.main.scrollX, collected: this.collected });
        this.spawn = { x: checkpoint.x, y: checkpoint.y };
        this.tweens.killTweensOf(checkpoint.sprite);
        checkpoint.sprite.setY(checkpoint.y - 4);
        checkpoint.sprite.setTint(0xffe08a);
        sound.play('check');
        this.burst(checkpoint.x, checkpoint.y - 20, 8);
        if (checkpoint.question) this.ask(checkpoint.question, false);
        else this.flashHint('საგუშაგო შენახულია');
      }
    }

    if (this.time.now >= this.hazardUntil) {
      for (const hazard of this.hazards) {
        const over = this.player.x > hazard.x && this.player.x < hazard.x + hazard.w;
        const low = this.player.y > hazard.y - 8 && this.player.y < hazard.y + 36;
        if (!over || !low) continue;
        body.setVelocityY(-480);
        this.hazardUntil = this.time.now + 450;
        this.burst(this.player.x, hazard.y, 6);
        this.flashHint('კრისტალმა ზემოთ აგაგდო');
        break;
      }
    }

    const nearGoal = Math.abs(this.player.x - this.goal.x) < 54 && Math.abs(this.player.y - this.goal.y) < 48;
    if (nearGoal && !this.goal.opened && !this.asking) {
      if (this.collected < this.required) this.flashHint('ჯერ ყველა სიტყვა შეაგროვე');
      else if (this.level.question) this.ask(this.level.question, true);
      else this.win();
    }

    if (!this.invuln && this.player.y > 760) this.hurt();
  }

  private poseFor(grounded: boolean, vx: number, vy: number) {
    if (this.ended) return;
    const now = this.time.now;
    if (now < this.poseUntil && (this.pose === 'collect' || this.pose === 'land')) {
      this.applyPose(this.pose);
      return;
    }
    let next: Pose = 'idle';
    if (!grounded && vy < -40) next = 'jump';
    else if (!grounded) next = 'fall';
    else if (this.pose === 'fall' || this.pose === 'jump') {
      next = 'land';
      this.poseUntil = now + 160;
      this.burst(this.player.x, this.player.y, 6, 'dust');
    } else if (Math.abs(vx) > 24) next = 'run';
    this.pose = next;
    this.applyPose(next);
  }

  private applyPose(pose: Pose) {
    if (pose === 'run' && !this.reduced) {
      this.player.anims.play('run', true);
      return;
    }
    this.player.anims.stop();
    const texture: GameTexture = pose === 'run' ? 'hero-run1'
      : pose === 'jump' ? 'hero-jump'
      : pose === 'fall' ? 'hero-fall'
      : pose === 'land' ? 'hero-land'
      : pose === 'collect' ? collectTexture
      : pose === 'win' ? 'hero-win'
      : 'hero-idle';
    this.player.setTexture(texture);
  }

  /** Subtle secondary motion makes the two-frame sprite feel less rigid.
   * Rotation is visual only and does not change the Arcade physics hitbox. */
  private animateMotion(delta: number, grounded: boolean, vx: number) {
    if (this.reduced || this.ended) {
      this.player.setRotation(0);
      return;
    }
    const speed = Math.min(1, Math.abs(vx) / MAX_SPEED);
    const running = grounded && this.pose === 'run' && speed > 0.12;
    const stride = Math.sin(this.time.now * (0.012 + speed * 0.009));
    const targetTilt = running ? stride * 0.035 * speed : (!grounded ? Phaser.Math.Clamp(vx / MAX_SPEED, -1, 1) * 0.025 : 0);
    const blend = Math.min(1, delta / 90);
    this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetTilt, blend);
    if (running) this.player.anims.timeScale = 0.65 + speed * 0.65;
  }

  private rideMovers(body: Phaser.Physics.Arcade.Body) {
    if (body.velocity.y < -40) return;
    for (const mover of this.movers) {
      const top = mover.sprite.y;
      const left = mover.sprite.x + 16;
      const right = mover.sprite.x + mover.sprite.displayWidth - 16;
      const onTop = this.player.x > left && this.player.x < right
        && this.player.y >= top - 14 && this.player.y <= top + 22;
      if (!onTop) continue;
      this.player.x += mover.dx;
      this.player.y = top;
      body.updateFromGameObject();
      body.setVelocityY(Phaser.Math.Clamp(mover.dy / Math.max(0.016, this.game.loop.delta / 1000), -120, 160));
      return;
    }
  }

  private ask(question: LevelQuestion, finishes: boolean) {
    this.asking = true;
    this.pending = question;
    this.goalWaiting = finishes;
    this.bridge.emit({
      question: { prompt: question.prompt, options: question.options },
      hint: null,
    });
  }

  private burst(x: number, y: number, count = 8, texture: 'spark' | 'dust' = 'spark') {
    if (this.reduced || !this.textures.exists(texture)) return;
    const emitter = this.add.particles(x, y - 8, texture, {
      speed: { min: 20, max: 90 },
      lifespan: 360,
      quantity: count,
      scale: { start: texture === 'dust' ? 0.8 : 0.7, end: 0 },
      emitting: false,
      gravityY: 220,
    });
    emitter.explode(count);
    this.time.delayedCall(420, () => emitter.destroy());
  }

  private collect(item: Pickup) {
    debugGame('collect', { item: item.id, x: this.player.x, y: this.player.y, lives: this.lives });
    item.taken = true;
    if (item.glow) item.glow.setVisible(false);
    if (!item.bonus) this.collected += 1;
    this.found.push(item.id);
    this.pose = 'collect';
    this.poseUntil = this.time.now + 280;
    this.applyPose('collect');
    this.wordToken += 1;
    const token = this.wordToken;
    sound.play('collect');
    this.burst(item.sprite.x, item.baseY, 12);
    const fresh = !getState().seen.includes(item.id);
    if (fresh) patch({ seen: [...getState().seen, item.id] });
    this.emitHud(item.id, true);
    if (!this.reduced) {
      this.tweens.add({
        targets: item.sprite,
        y: item.baseY - 36,
        alpha: 0,
        scale: item.sprite.scale * 1.35,
        duration: 320,
        onComplete: () => item.sprite.setVisible(false),
      });
    } else item.sprite.setVisible(false);
    this.time.delayedCall(1600, () => {
      if (this.wordToken === token && !this.asking) this.bridge.emit({ wordId: null, freshWord: false });
    });
    if (this.collected >= this.required) this.goal.sprite.setTint(0xfff1c4);
  }

  private hurt() {
    debugGame('hurt:respawn-or-lose', { x: this.player.x, y: this.player.y, spawn: this.spawn, livesBefore: this.lives });
    this.lives -= 1;
    this.invuln = true;
    sound.play('hurt');
    if (!this.reduced) this.cameras.main.shake(120, 0.004);
    if (this.lives <= 0) {
      this.ended = true;
      this.physics.pause();
      this.bridge.emit({ lives: 0, status: 'lose', hint: null, wordId: null });
      return;
    }
    const fallen = this.player.body as Phaser.Physics.Arcade.Body;
    fallen.reset(this.spawn.x, this.spawn.y);
    this.bridge.emit({ lives: this.lives, hint: 'კიდევ სცადე' });
    this.time.delayedCall(700, () => {
      this.invuln = false;
    });
    this.time.delayedCall(1600, () => {
      if (this.bridge.getHud().hint === 'კიდევ სცადე') this.bridge.emit({ hint: null });
    });
  }

  private answer(index: number) {
    if (!this.asking || !this.pending) return;
    if (index !== this.pending.answer) {
      sound.play('hurt');
      this.bridge.emit({ hint: 'ეს პასუხი არ არის. კიდევ სცადე.' });
      return;
    }
    const finish = this.goalWaiting;
    this.pending = null;
    this.asking = false;
    this.goalWaiting = false;
    sound.play('check');
    this.bridge.emit({ question: null, hint: finish ? null : 'სწორია.' });
    if (!finish) {
      this.time.delayedCall(900, () => {
        if (this.bridge.getHud().hint === 'სწორია.') this.bridge.emit({ hint: null });
      });
      return;
    }
    this.win();
  }

  private win() {
    if (this.ended) return;
    this.ended = true;
    this.goal.opened = true;
    this.asking = false;
    this.pending = null;
    this.burst(this.goal.x, this.goal.y - 40, 16);
    this.pose = 'win';
    this.applyPose('win');
    this.physics.pause();
    sound.play('win');
    const bonus = this.items.filter((item) => item.bonus && item.taken).length;
    const secrets = this.items.filter((item) => item.secret && item.taken).length;
    const score = this.collected * 10 + bonus * 25;
    const stars = this.lives >= 3 ? 3 : this.lives === 2 ? 2 : 1;
    noteLevelClear(this.boot?.levelIndex ?? 0, this.level.id, score);
    this.bridge.emit({
      status: 'win',
      question: null,
      hint: null,
      wordId: null,
      score,
      collected: this.collected,
      stars,
      words: this.found,
      secrets,
    });
  }

  private flashHint(text: string) {
    if (this.bridge.getHud().hint === text) return;
    this.bridge.emit({ hint: text });
    this.time.delayedCall(1700, () => {
      if (this.bridge.getHud().hint === text) this.bridge.emit({ hint: null });
    });
  }

  private emitHud(wordId: string | null, fresh = false) {
    const bonus = this.items.filter((item) => item.bonus && item.taken).length;
    const secrets = this.items.filter((item) => item.secret && item.taken).length;
    this.bridge.emit({
      levelTitle: this.level.title,
      collected: this.collected,
      total: this.required,
      lives: this.lives,
      score: this.collected * 10 + bonus * 25,
      wordId,
      words: this.found,
      freshWord: fresh && wordId !== null,
      secrets,
      secretTotal: this.items.filter((item) => item.secret).length,
    });
  }
}
