import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    let frameId;
    const geometries = [];
    const materials = [];

    try {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
      camera.position.z = 26;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Master interactive group positioned smoothly behind the hero poster showcase
      const coreGroup = new THREE.Group();
      coreGroup.position.set(5.5, 0.5, 0);
      scene.add(coreGroup);

      // Outer wireframe icosahedron
      const outerGeo = new THREE.IcosahedronGeometry(7.2, 1);
      const outerMat = new THREE.MeshBasicMaterial({
        color: 0xe50914,
        wireframe: true,
        transparent: true,
        opacity: 0.14,
      });
      geometries.push(outerGeo);
      materials.push(outerMat);
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      coreGroup.add(outerMesh);

      // Inner crystal octahedron
      const innerGeo = new THREE.OctahedronGeometry(4.2, 0);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      });
      geometries.push(innerGeo);
      materials.push(innerMat);
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      coreGroup.add(innerMesh);

      // Orbital kinetic rings
      const ringGeo1 = new THREE.TorusGeometry(9.6, 0.04, 16, 120);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: 0xe50914,
        transparent: true,
        opacity: 0.28,
      });
      geometries.push(ringGeo1);
      materials.push(ringMat1);
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 3;
      ring1.rotation.y = Math.PI / 6;
      coreGroup.add(ring1);

      const ringGeo2 = new THREE.TorusGeometry(11.4, 0.03, 16, 120);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.18,
      });
      geometries.push(ringGeo2);
      materials.push(ringMat2);
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = -Math.PI / 4;
      ring2.rotation.z = Math.PI / 5;
      coreGroup.add(ring2);

      // 3D Cinema Starfield / Dust
      const starCount = 320;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const redColor = new THREE.Color(0xe50914);
      const violetColor = new THREE.Color(0x8b5cf6);
      const whiteColor = new THREE.Color(0xffffff);

      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 35;

        const c = i % 5 === 0 ? redColor : i % 3 === 0 ? violetColor : whiteColor;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const starMat = new THREE.PointsMaterial({
        size: 0.14,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
      });
      geometries.push(starGeo);
      materials.push(starMat);
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      // Responsive layout shift for smaller viewports
      const updateGroupLayout = (w) => {
        if (w < 1024) {
          coreGroup.position.set(0, 1.5, -4);
          coreGroup.scale.setScalar(0.75);
        } else {
          coreGroup.position.set(6.5, 0.5, 0);
          coreGroup.scale.setScalar(1);
        }
      };
      updateGroupLayout(width);

      let targetMouseX = 0;
      let targetMouseY = 0;
      const onPointerMove = (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });

      const onResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        updateGroupLayout(w);
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        outerMesh.rotation.y = t * 0.14;
        outerMesh.rotation.x = t * 0.08;
        innerMesh.rotation.y = -t * 0.22;
        innerMesh.rotation.z = t * 0.12;
        ring1.rotation.z = t * 0.18;
        ring2.rotation.y = -t * 0.15;

        stars.rotation.y = t * 0.025 + targetMouseX * 0.08;
        stars.rotation.x = targetMouseY * 0.06;

        coreGroup.rotation.y += (targetMouseX * 0.35 - coreGroup.rotation.y) * 0.04;
        coreGroup.rotation.x += (targetMouseY * 0.25 - coreGroup.rotation.x) * 0.04;
        coreGroup.position.y = (window.innerWidth < 1024 ? 1.5 : 0.5) + Math.sin(t * 0.9) * 0.35;

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', onResize);
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch {
      return undefined;
    }
  }, []);

  return <div ref={mountRef} aria-hidden="true" className="absolute inset-0 z-[1] pointer-events-none overflow-hidden" />;
}

