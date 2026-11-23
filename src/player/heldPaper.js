import * as THREE from 'three';

export function createHeldPaperSystem(camera, heldPaperMat) {
  const heldPaperGroup = new THREE.Group();
  const heldPaperMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.40), heldPaperMat);
  heldPaperMesh.renderOrder = 999;
  heldPaperGroup.add(heldPaperMesh);

  heldPaperGroup.position.set(0, -0.55, -0.44);
  heldPaperGroup.rotation.x = -0.06;
  heldPaperGroup.visible = false;
  camera.add(heldPaperGroup);

  return { heldPaperGroup, heldPaperMesh };
}

export function updateHeldPaper(dt, tSec, state, heldPaperGroup) {
  if (state.holdingPaper) {
    state.paperAnim = Math.min(1, state.paperAnim + dt * 4.5);
  } else if (state.paperAnim > 0) {
    state.paperAnim = Math.max(0, state.paperAnim - dt * 5.0);
    if (state.paperAnim === 0) heldPaperGroup.visible = false;
  }
  if (heldPaperGroup.visible) {
    const pe = state.paperAnim * state.paperAnim * (3 - 2 * state.paperAnim);
    heldPaperGroup.position.set(
      Math.sin(tSec * 1.4) * 0.004,
      -0.55 + pe * 0.52 + Math.cos(tSec * 1.9) * 0.003,
      -0.44
    );
    heldPaperGroup.rotation.z = Math.sin(tSec * 1.1) * 0.012;
  }
}
