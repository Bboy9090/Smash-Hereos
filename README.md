# 🎮 SMASH HEROES ULTIMATE

> **The Ultimate Fighting Game Engine** - Combining the best of Smash Bros, Marvel Ultimate Alliance, Spider-Man PS5, and Batman Arkham combat systems

[![CI](https://github.com/Bboy9090/Smash-Hereos/actions/workflows/ci.yml/badge.svg)](https://github.com/Bboy9090/Smash-Hereos/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Vision

Build the greatest looking and feeling fighting game engine with:

- **Super Smash Bros Ultimate**: Percentage-based knockback, platform fighting, satisfying hit-stop
- **Marvel Ultimate Alliance**: Hero abilities, ultimate powers, team synergy
- **Spider-Man PS5**: Fluid momentum-based movement, cinematic finishers
- **Batman Arkham Series**: Freeflow combat, counter system, rhythm-based combos

**Target Platforms**: Mobile/Tablet (primary), PC/Web (secondary)

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS or higher
- pnpm 8 or higher

### Installation

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build
```

## 📦 Project Structure

```
smash-heroes/
├── packages/
│   ├── engine/          # Core game engine
│   │   ├── core/        # Game loop, scene management
│   │   ├── physics/     # Momentum physics, collision
│   │   ├── combat/      # Combat system, knockback, combos
│   │   ├── input/       # Unified input (keyboard, gamepad, touch)
│   │   ├── animation/   # State machine, animation controller
│   │   ├── effects/     # Screen shake, hitlag, particles
│   │   └── audio/       # Audio management
│   ├── characters/      # Fighter system
│   │   ├── base/        # Base fighter class
│   │   └── heroes/      # Character implementations
│   ├── ui/              # React UI components (TODO)
│   └── shared/          # Shared types, utils, constants
├── apps/
│   ├── web/            # Web game application (TODO)
│   └── mobile/         # Capacitor mobile app (TODO)
├── assets/             # Game assets (sprites, audio, shaders)
└── docs/              # Documentation

```

## 🎯 Core Features

### ⚡ Physics System

- **60 FPS Fixed Timestep**: Rock-solid game loop
- **Momentum-Based Movement**: Spider-Man style fluid movement
- **Coyote Time**: Grace period after leaving platform (5 frames)
- **Jump Buffering**: Remember jump inputs (6 frames)
- **Variable Jump Height**: Hold for higher jumps
- **Fast Fall**: Quick descent with down input

### 💥 Combat System

#### Smash-Style Damage & Knockback

```typescript
// Knockback formula: ((((p/10 + (p*d)/20) * 200/(w+100) * 1.4) + 18) * s) + b) * r
KB = f(damage%, attack_damage, weight, growth, base, rage)
```

- **Percentage Damage**: 0% to 999%
- **Dynamic Knockback**: Scales with damage
- **DI (Directional Influence)**: Control knockback direction (±18°)
- **Rage System**: More knockback at high damage (+15% max)

#### Arkham-Style Freeflow

- **Attack Chains**: Seamless target switching
- **Counter Windows**: 8 frames to counter attacks
- **Parry System**: 3 frame perfect parry (2x damage multiplier)
- **Combo Multiplier**: Up to 2x damage at high combo count
- **Rhythm-Based Flow**: Timing-based combo extensions

### 🎮 Input System

Unified input handling for all platforms:

- **Keyboard**: WASD + IJKL/Arrow keys
- **Gamepad**: Full Xbox/PlayStation controller support
- **Touch**: Virtual joystick + action buttons
- **Gestures**: Swipe to jump, tap to attack
- **6-Frame Buffer**: Never miss an input

### 🎨 Visual Effects

- **Hitlag/Hitstop**: Freeze frames on impact (2-20 frames)
- **Screen Shake**: Intensity scales with damage
- **Slow Motion**: Dramatic slow-mo on big hits (30% speed)
- **Particle System**: Hit sparks, explosions, trails
- **Camera Effects**: Dynamic zoom and follow

## 🥊 Character System

### Striker - The All-Rounder

Balanced fighter with complete moveset:

**Ground Attacks**
- Jab Combo (3-hit)
- Tilts (Forward, Up, Down)
- Smash Attacks (Forward, Up, Down)

**Aerial Attacks**
- Neutral Air, Forward Air, Back Air
- Up Air, Down Air (Spike)

**Special Moves**
- Neutral Special: Power Shot
- Side Special: Dash Strike
- Up Special: Rising Uppercut (Recovery)
- Down Special: Counter

**Grab Game**
- Grab, Pummel, 4 Throws

## 🛠️ Development

### Monorepo Structure

This project uses a pnpm workspace + Turborepo setup:

```bash
# Build all packages
pnpm build

# Watch mode (development)
pnpm dev

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Format code
pnpm format
```

### Adding a New Character

See [CHARACTER_GUIDE.md](docs/CHARACTER_GUIDE.md) for detailed instructions.

Quick example:

```typescript
import { BaseFighter, MoveSetBuilder } from '@smash-heroes/characters';

export class MyHero extends BaseFighter {
  protected getDefaultStats() {
    return {
      weight: 100,
      walkSpeed: 1.2,
      // ... more stats
    };
  }

  protected createMoveSet() {
    return new MoveSetBuilder()
      .addAttack('jab', { damage: 3, ... })
      .build();
  }
}
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and architecture
- [Character Guide](docs/CHARACTER_GUIDE.md) - How to create new characters
- [Combat System](docs/COMBAT_SYSTEM.md) - Deep dive into combat mechanics
- [Getting Started](docs/GETTING_STARTED.md) - Detailed setup guide

## 🎯 Performance Targets

- **Frame Rate**: Stable 60 FPS on mobile devices
- **Input Latency**: < 3 frames (50ms)
- **Bundle Size**: < 500KB for core engine
- **Type Safety**: 100% TypeScript, strict mode

## 🗺️ Roadmap

### Phase 1: Core Engine ✅
- [x] Game loop (60 FPS fixed timestep)
- [x] Physics system (momentum, collision)
- [x] Combat system (damage, knockback, combos)
- [x] Input system (keyboard, gamepad, touch)
- [x] Animation & state machine
- [x] Visual & audio effects

### Phase 2: Characters ✅
- [x] Base fighter class
- [x] Fighter state machine
- [x] Striker character (complete moveset)

### Phase 3: UI & Apps (In Progress)
- [ ] React UI components
- [ ] HUD (damage display, combo counter)
- [ ] Menus (character select, stage select)
- [ ] Mobile virtual controls
- [ ] Web application (Vite + React)
- [ ] Mobile app (Capacitor)

### Phase 4: Content
- [ ] More playable characters
- [ ] Multiple stages
- [ ] Game modes (Stock, Time, Training)
- [ ] Sound effects & music
- [ ] Visual polish (shaders, particles)

### Phase 5: Online
- [ ] Rollback netcode
- [ ] Matchmaking
- [ ] Replay system
- [ ] Leaderboards

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

Inspired by:
- Super Smash Bros Ultimate
- Marvel Ultimate Alliance
- Spider-Man (PS5)
- Batman: Arkham Series

---

**Made with ❤️ for fighting game enthusiasts**
