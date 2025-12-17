/**
 * Enhanced Character Animation Hook
 * Provides realistic procedural animations for character body parts
 */

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {
  BreathingAnimation,
  HeadLookAt,
  WeightShift,
  AttackAnimationPhase,
  SecondaryMotion,
  FootPlacement,
} from '@smash-heroes/engine';

export interface AnimationRefs {
  body: React.RefObject<THREE.Group>;
  head: React.RefObject<THREE.Group>;
  leftArm: React.RefObject<THREE.Group>;
  rightArm: React.RefObject<THREE.Group>;
  leftLeg: React.RefObject<THREE.Group>;
  rightLeg: React.RefObject<THREE.Group>;
}

export interface AnimationState {
  isMoving: boolean;
  isJumping: boolean;
  isAttacking: boolean;
  attackType?: 'punch' | 'kick' | 'special';
  velocityX: number;
  velocityY: number;
  facingRight: boolean;
  emotionIntensity: number;
}

export function useEnhancedAnimation(refs: AnimationRefs) {
  // Procedural animation systems
  const breathingRef = useRef(new BreathingAnimation(12, 1.0));
  const headLookAtRef = useRef(new HeadLookAt(120, 22));
  const weightShiftRef = useRef(new WeightShift());
  const attackPhaseRef = useRef<AttackAnimationPhase | null>(null);
  const secondaryMotionRef = useRef(new SecondaryMotion(3, 90, 18));
  const footPlacementRef = useRef(new FootPlacement());

  // Animation state tracking
  const prevStateRef = useRef<AnimationState>({
    isMoving: false,
    isJumping: false,
    isAttacking: false,
    velocityX: 0,
    velocityY: 0,
    facingRight: true,
    emotionIntensity: 0,
  });

  const updateAnimation = (state: AnimationState, deltaTime: number) => {
    const {
      isMoving,
      isJumping,
      isAttacking,
      attackType,
      velocityX,
      velocityY,
      facingRight,
      emotionIntensity,
    } = state;

    // Check for state transitions
    if (isAttacking && !prevStateRef.current.isAttacking && attackType) {
      // Start new attack animation
      attackPhaseRef.current = new AttackAnimationPhase(0.12, 0.18, 0.12, 0.18);
    } else if (!isAttacking && prevStateRef.current.isAttacking) {
      // Attack ended
      attackPhaseRef.current = null;
    }

    // Update procedural animations
    const breathing = breathingRef.current.update(deltaTime);
    const weightShift = weightShiftRef.current.update(deltaTime);
    const footPlacement = footPlacementRef.current.update(deltaTime, Math.abs(velocityX) * 2);

    // Update head tracking (look in direction of movement)
    const targetYaw = velocityX !== 0 ? Math.sign(velocityX) * 0.3 : 0;
    const targetPitch = velocityY > 0 ? 0.2 : velocityY < -1 ? -0.3 : 0;
    headLookAtRef.current.setTarget(targetYaw, targetPitch);
    const headRotation = headLookAtRef.current.update(deltaTime);

    // Update weight shift based on movement
    weightShiftRef.current.setDirection(velocityX !== 0 ? Math.sign(velocityX) : 0);

    // Update secondary motion (momentum carry-through)
    secondaryMotionRef.current.applyForce(velocityX * 2);
    const secondaryMotion = secondaryMotionRef.current.update(deltaTime);

    // Apply animations to refs
    if (refs.head.current) {
      // Apply head rotation with breathing
      refs.head.current.rotation.set(
        headRotation.pitch + breathing.headTilt,
        headRotation.yaw,
        headRotation.roll
      );

      // Add subtle head bob during idle
      if (!isMoving && !isAttacking && !isJumping) {
        refs.head.current.position.y = 0.6 + breathing.shoulderRise;
      }
    }

    if (refs.body.current) {
      // Apply breathing to chest
      refs.body.current.scale.setScalar(1.0 + breathing.chestExpansion);

      if (isMoving && !isAttacking) {
        // Walking/running body bob
        refs.body.current.position.y = 0.4 + footPlacement.bodyBob;
        
        // Body lean in direction of movement
        refs.body.current.rotation.z = weightShift.hipOffset;
        refs.body.current.rotation.y = -weightShift.shoulderOffset;
      } else if (!isAttacking && !isJumping) {
        // Idle breathing
        refs.body.current.position.y = 0.4 + breathing.chestExpansion * 2;
        refs.body.current.rotation.z = 0;
        refs.body.current.rotation.y = 0;
      }

      // Apply secondary motion (momentum drag)
      if (secondaryMotion.length > 0) {
        refs.body.current.rotation.y += secondaryMotion[0] * 0.1;
      }
    }

    // Handle attack animations
    if (isAttacking && attackPhaseRef.current && attackType) {
      const attackAnim = attackPhaseRef.current.update(deltaTime);
      applyAttackAnimation(refs, attackType, attackAnim, facingRight);
    } else if (isMoving && !isJumping) {
      // Walking/running animation
      applyWalkingAnimation(refs, footPlacement, deltaTime);
    } else if (isJumping) {
      // Jump animation
      applyJumpAnimation(refs, velocityY);
    } else {
      // Idle animation with breathing
      applyIdleAnimation(refs, breathing, deltaTime);
    }

    // Store state for next frame
    prevStateRef.current = state;
  };

  const reset = () => {
    breathingRef.current.reset();
    headLookAtRef.current.reset();
    weightShiftRef.current.reset();
    attackPhaseRef.current = null;
    secondaryMotionRef.current.reset();
    footPlacementRef.current.reset();
  };

  return { updateAnimation, reset };
}

// Helper functions for different animation types

function applyWalkingAnimation(
  refs: AnimationRefs,
  footPlacement: FootPlacement,
  deltaTime: number
) {
  const { leftFoot, rightFoot } = footPlacement.update(deltaTime, 1.0);

  if (refs.leftArm.current && refs.rightArm.current) {
    // Arms swing opposite to legs
    refs.leftArm.current.rotation.z = rightFoot.forward * 0.8;
    refs.rightArm.current.rotation.z = leftFoot.forward * 0.8;
  }

  if (refs.leftLeg.current && refs.rightLeg.current) {
    // Leg rotation and lift
    refs.leftLeg.current.rotation.x = leftFoot.forward * 1.2;
    refs.leftLeg.current.position.y = -0.7 + leftFoot.lift;
    
    refs.rightLeg.current.rotation.x = rightFoot.forward * 1.2;
    refs.rightLeg.current.position.y = -0.7 + rightFoot.lift;
  }
}

function applyJumpAnimation(
  refs: AnimationRefs,
  velocityY: number
) {
  if (refs.leftArm.current && refs.rightArm.current) {
    // Arms up during jump
    refs.leftArm.current.rotation.z = 0.8;
    refs.leftArm.current.rotation.x = 0.3;
    refs.rightArm.current.rotation.z = -0.8;
    refs.rightArm.current.rotation.x = 0.3;
  }

  if (refs.leftLeg.current && refs.rightLeg.current) {
    // Legs tucked or extended based on velocity
    if (velocityY > 0) {
      // Rising - legs bent
      refs.leftLeg.current.rotation.x = -0.5;
      refs.rightLeg.current.rotation.x = -0.5;
    } else {
      // Falling - legs extended
      refs.leftLeg.current.rotation.x = -0.2;
      refs.rightLeg.current.rotation.x = -0.2;
    }
  }

  if (refs.body.current) {
    // Lean back slightly during jump
    refs.body.current.rotation.x = velocityY > 0 ? 0.2 : -0.1;
  }
}

function applyIdleAnimation(
  refs: AnimationRefs,
  breathing: { chestExpansion: number; shoulderRise: number; headTilt: number },
  deltaTime: number
) {
  if (refs.leftArm.current && refs.rightArm.current) {
    // Subtle arm sway with breathing
    refs.leftArm.current.rotation.z = 0.1 + breathing.shoulderRise * 2;
    refs.rightArm.current.rotation.z = -0.1 - breathing.shoulderRise * 2;
    refs.leftArm.current.rotation.x = 0;
    refs.rightArm.current.rotation.x = 0;
  }

  if (refs.leftLeg.current && refs.rightLeg.current) {
    // Neutral stance
    refs.leftLeg.current.rotation.x = 0;
    refs.rightLeg.current.rotation.x = 0;
    refs.leftLeg.current.position.y = -0.7;
    refs.rightLeg.current.position.y = -0.7;
  }
}

function applyAttackAnimation(
  refs: AnimationRefs,
  attackType: 'punch' | 'kick' | 'special',
  attackAnim: { phase: string; progress: number; intensity: number },
  facingRight: boolean
) {
  const { phase, progress, intensity } = attackAnim;
  const direction = facingRight ? 1 : -1;

  if (attackType === 'punch') {
    applyPunchAnimation(refs, phase, progress, intensity, direction);
  } else if (attackType === 'kick') {
    applyKickAnimation(refs, phase, progress, intensity, direction);
  } else if (attackType === 'special') {
    applySpecialAnimation(refs, phase, progress, intensity);
  }
}

function applyPunchAnimation(
  refs: AnimationRefs,
  phase: string,
  progress: number,
  intensity: number,
  direction: number
) {
  if (refs.rightArm.current && refs.body.current) {
    if (phase === 'anticipation') {
      // Pull back
      refs.rightArm.current.rotation.z = -Math.PI / 6 * progress * direction;
      refs.rightArm.current.position.x = -0.3 * progress * direction;
      refs.body.current.rotation.y = -0.2 * progress * direction;
    } else if (phase === 'action') {
      // Strike!
      refs.rightArm.current.rotation.z = -Math.PI / 1.5 * direction;
      refs.rightArm.current.position.x = 1.5 * direction;
      refs.rightArm.current.position.z = 0.5;
      refs.body.current.rotation.y = 0.4 * direction;
    } else {
      // Recovery
      const ease = 1.0 - progress;
      refs.rightArm.current.rotation.z = -Math.PI / 1.5 * ease * direction;
      refs.rightArm.current.position.x = 1.5 * ease * direction;
      refs.rightArm.current.position.z = 0.5 * ease;
      refs.body.current.rotation.y = 0.4 * ease * direction;
    }
  }
}

function applyKickAnimation(
  refs: AnimationRefs,
  phase: string,
  progress: number,
  intensity: number,
  direction: number
) {
  if (refs.rightLeg.current && refs.body.current) {
    if (phase === 'anticipation') {
      // Wind up
      refs.rightLeg.current.rotation.x = -Math.PI / 6 * progress;
      refs.body.current.rotation.x = 0.2 * progress;
    } else if (phase === 'action') {
      // Kick!
      refs.rightLeg.current.rotation.x = Math.PI / 2;
      refs.rightLeg.current.position.z = 1.2;
      refs.body.current.rotation.x = -0.5;
    } else {
      // Recovery
      const ease = 1.0 - progress;
      refs.rightLeg.current.rotation.x = Math.PI / 2 * ease;
      refs.rightLeg.current.position.z = 1.2 * ease;
      refs.body.current.rotation.x = -0.5 * ease;
    }
  }
}

function applySpecialAnimation(
  refs: AnimationRefs,
  phase: string,
  progress: number,
  intensity: number
) {
  if (refs.leftArm.current && refs.rightArm.current && refs.body.current) {
    if (phase === 'anticipation') {
      // Charge up
      refs.body.current.scale.setScalar(1.0 - progress * 0.1);
      refs.leftArm.current.rotation.z = progress * Math.PI / 6;
      refs.rightArm.current.rotation.z = -progress * Math.PI / 6;
    } else if (phase === 'action') {
      // Release!
      refs.leftArm.current.rotation.z = Math.PI / 1.5;
      refs.rightArm.current.rotation.z = -Math.PI / 1.5;
      refs.leftArm.current.position.y = 0.3;
      refs.rightArm.current.position.y = 0.3;
      refs.body.current.position.y = 0.5;
      refs.body.current.scale.setScalar(1.0 + intensity * 0.15);
    } else {
      // Recovery
      const ease = 1.0 - progress;
      refs.leftArm.current.rotation.z = Math.PI / 1.5 * ease;
      refs.rightArm.current.rotation.z = -Math.PI / 1.5 * ease;
      refs.body.current.position.y = 0.5 * ease;
      refs.body.current.scale.setScalar(1.0 + intensity * 0.15 * ease);
    }
  }
}
