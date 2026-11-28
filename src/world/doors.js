import * as THREE from 'three';
import { TOTAL_LOOPS } from '../config/storyData.js';

export function createDoorsSystem(scene, materials, colliders, interactables, getState) {
  const doors = [];

  function createDoor(id, x, z, rotY, isFrontDoor = false) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0, z);
    pivot.rotation.y = rotY;
    scene.add(pivot);

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.5, 0.12), materials.doorMat);
    mesh.position.set(0.825, 1.25, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    pivot.add(mesh);

    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.15), materials.brassMat);
    plate.position.set(1.45, 1.12, 0);
    pivot.add(plate);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), materials.brassMat);
    knob.position.set(1.45, 1.12, 0.1);
    pivot.add(knob);

    const knob2 = knob.clone();
    knob2.position.z = -0.1;
    pivot.add(knob2);

    const isZAligned = Math.abs(rotY) > 0.5;
    const worldCenter = isZAligned
      ? new THREE.Vector3(x, 1.25, z - 0.825)
      : new THREE.Vector3(x + 0.825, 1.25, z);

    const collider = isZAligned
      ? { minX: x - 0.18, maxX: x + 0.18, minZ: z - 1.65, maxZ: z, active: true }
      : { minX: x, maxX: x + 1.65, minZ: z - 0.18, maxZ: z + 0.18, active: true };
    colliders.push(collider);

    const d = {
      type: 'door',
      id,
      pivot,
      baseRotY: rotY,
      worldPos: worldCenter,
      isFrontDoor,
      isOpen: false,
      targetOffset: 0,
      currentOffset: 0,
      angVel: 0,
      rattleTime: 0,
      collider,
      label: () => {
        const state = getState();
        if (d.isFrontDoor) {
          if (!state.loopClueFound) return 'Cửa chính (Chốt khóa — kiểm tra bàn làm việc)';
          return state.loop === TOTAL_LOOPS
            ? 'Nhấn [E] mở cửa chính chạy ra ngoài!'
            : 'Nhấn [E] mở cửa chính';
        }
        if (d.id === 'door_study' && state.loop === 1 && !state.studyKeyFound) {
          return 'Cửa phòng làm việc (Khóa — tìm chìa khóa trước)';
        }
        if (d.id === 'door_bathroom' && state.loop === 3 && !state.bathEscaped) {
          return 'Cửa phòng tắm bị kẹt (Khóa vòi nước & soi gương trước)';
        }
        if (d.id === 'door_study' && state.loop === 4 && !state.tvTurnedOff) {
          return 'Cửa phòng làm việc bị kẹt (Tắt TV nhiễu hạt trước)';
        }
        return d.isOpen ? 'Nhấn [E] đóng cửa' : 'Nhấn [E] mở cửa';
      }
    };
    doors.push(d);
    interactables.push(d);
    return d;
  }

  createDoor('door_bedroom', -0.825, -1.0, 0, false);
  createDoor('door_study', 3.5, -3.62, Math.PI / 2, false);
  createDoor('door_kitchen', -4.0, -1.35, Math.PI / 2, false);
  createDoor('door_bathroom', 3.5, 1.25, Math.PI / 2, false);
  createDoor('door_front', -0.825, -10.5, 0, true);

  return { doors, createDoor };
}
