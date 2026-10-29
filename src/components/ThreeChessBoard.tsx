import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Board, Color, Position, PieceType } from '../engine/types';
import { RotateCw, Eye, Maximize2 } from 'lucide-react';

interface ThreeChessBoardProps {
  board: Board;
  currentTurn: Color;
  selectedSquare: Position | null;
  legalMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  isKingInCheck: boolean;
  isFlipped: boolean;
  themeMode: 'light' | 'dark';
  aiHints?: { from: Position; to: Position; color?: string }[];
  onSquareClick: (row: number, col: number) => void;
}

// Procedural 3D Piece Geometry Builders
function createPieceMesh(
  type: PieceType,
  color: Color,
  whiteMaterial: THREE.Material,
  blackMaterial: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  const mat = color === 'white' ? whiteMaterial : blackMaterial;

  const baseGeom = new THREE.CylinderGeometry(0.34, 0.38, 0.12, 24);
  const baseMesh = new THREE.Mesh(baseGeom, mat);
  baseMesh.position.y = 0.06;
  group.add(baseMesh);

  const lowerGeom = new THREE.CylinderGeometry(0.24, 0.32, 0.1, 24);
  const lowerMesh = new THREE.Mesh(lowerGeom, mat);
  lowerMesh.position.y = 0.16;
  group.add(lowerMesh);

  switch (type) {
    case 'pawn': {
      const stemGeom = new THREE.CylinderGeometry(0.14, 0.22, 0.45, 20);
      const stemMesh = new THREE.Mesh(stemGeom, mat);
      stemMesh.position.y = 0.42;
      group.add(stemMesh);

      const collarGeom = new THREE.TorusGeometry(0.18, 0.04, 12, 24);
      collarGeom.rotateX(Math.PI / 2);
      const collarMesh = new THREE.Mesh(collarGeom, mat);
      collarMesh.position.y = 0.65;
      group.add(collarMesh);

      const headGeom = new THREE.SphereGeometry(0.19, 20, 20);
      const headMesh = new THREE.Mesh(headGeom, mat);
      headMesh.position.y = 0.82;
      group.add(headMesh);
      break;
    }

    case 'rook': {
      const stemGeom = new THREE.CylinderGeometry(0.22, 0.28, 0.65, 24);
      const stemMesh = new THREE.Mesh(stemGeom, mat);
      stemMesh.position.y = 0.52;
      group.add(stemMesh);

      const rimGeom = new THREE.CylinderGeometry(0.3, 0.25, 0.18, 24);
      const rimMesh = new THREE.Mesh(rimGeom, mat);
      rimMesh.position.y = 0.92;
      group.add(rimMesh);

      // Battlements
      for (let i = 0; i < 4; i++) {
        const battleGeom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const battleMesh = new THREE.Mesh(battleGeom, mat);
        const angle = (i * Math.PI) / 2;
        battleMesh.position.set(Math.cos(angle) * 0.22, 1.05, Math.sin(angle) * 0.22);
        group.add(battleMesh);
      }
      break;
    }

    case 'knight': {
      const stemGeom = new THREE.CylinderGeometry(0.22, 0.28, 0.4, 20);
      const stemMesh = new THREE.Mesh(stemGeom, mat);
      stemMesh.position.y = 0.4;
      group.add(stemMesh);

      // Horse Head / Neck
      const headGeom = new THREE.BoxGeometry(0.24, 0.5, 0.38);
      const headMesh = new THREE.Mesh(headGeom, mat);
      headMesh.position.set(0, 0.72, 0.06);
      headMesh.rotation.x = -0.25;
      group.add(headMesh);

      // Snout
      const snoutGeom = new THREE.BoxGeometry(0.2, 0.22, 0.26);
      const snoutMesh = new THREE.Mesh(snoutGeom, mat);
      snoutMesh.position.set(0, 0.7, 0.24);
      group.add(snoutMesh);

      // Ears
      const ear1 = new THREE.ConeGeometry(0.06, 0.16, 8);
      ear1.rotateX(0.2);
      const ear1Mesh = new THREE.Mesh(ear1, mat);
      ear1Mesh.position.set(-0.08, 1.0, 0);
      group.add(ear1Mesh);

      const ear2Mesh = ear1Mesh.clone();
      ear2Mesh.position.set(0.08, 1.0, 0);
      group.add(ear2Mesh);
      break;
    }

    case 'bishop': {
      const stemGeom = new THREE.CylinderGeometry(0.16, 0.26, 0.65, 24);
      const stemMesh = new THREE.Mesh(stemGeom, mat);
      stemMesh.position.y = 0.52;
      group.add(stemMesh);

      const ringGeom = new THREE.TorusGeometry(0.22, 0.04, 12, 24);
      ringGeom.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeom, mat);
      ringMesh.position.y = 0.85;
      group.add(ringMesh);

      const mitreGeom = new THREE.SphereGeometry(0.22, 20, 20);
      mitreGeom.scale(1, 1.45, 1);
      const mitreMesh = new THREE.Mesh(mitreGeom, mat);
      mitreMesh.position.y = 1.08;
      group.add(mitreMesh);

      const topBall = new THREE.SphereGeometry(0.06, 12, 12);
      const topBallMesh = new THREE.Mesh(topBall, mat);
      topBallMesh.position.y = 1.44;
      group.add(topBallMesh);
      break;
    }

    case 'queen': {
      const stemGeom = new THREE.CylinderGeometry(0.18, 0.3, 0.85, 24);
      const stemMesh = new THREE.Mesh(stemGeom, mat);
      stemMesh.position.y = 0.62;
      group.add(stemMesh);

      const crownGeom = new THREE.CylinderGeometry(0.34, 0.2, 0.26, 24);
      const crownMesh = new THREE.Mesh(crownGeom, mat);
      crownMesh.position.y = 1.15;
      group.add(crownMesh);

      for (let i = 0; i < 6; i++) {
        const sphere = new THREE.SphereGeometry(0.05, 10, 10);
        const sphereMesh = new THREE.Mesh(sphere, mat);
        const angle = (i * Math.PI * 2) / 6;
        sphereMesh.position.set(Math.cos(angle) * 0.3, 1.28, Math.sin(angle) * 0.3);
        group.add(sphereMesh);
      }

      const centerBall = new THREE.SphereGeometry(0.09, 14, 14);
      const centerBallMesh = new THREE.Mesh(centerBall, mat);
      centerBallMesh.position.y = 1.34;
      group.add(centerBallMesh);
      break;
    }

    case 'king': {
      const stemGeom = new THREE.CylinderGeometry(0.2, 0.32, 0.95, 24);
      const stemMesh = new THREE.Mesh(stemGeom, mat);
      stemMesh.position.y = 0.68;
      group.add(stemMesh);

      const crownGeom = new THREE.CylinderGeometry(0.36, 0.24, 0.28, 24);
      const crownMesh = new THREE.Mesh(crownGeom, mat);
      crownMesh.position.y = 1.25;
      group.add(crownMesh);

      // Latin Cross on King
      const vertCross = new THREE.BoxGeometry(0.07, 0.28, 0.07);
      const vertMesh = new THREE.Mesh(vertCross, mat);
      vertMesh.position.y = 1.52;
      group.add(vertMesh);

      const horizCross = new THREE.BoxGeometry(0.22, 0.07, 0.07);
      const horizMesh = new THREE.Mesh(horizCross, mat);
      horizMesh.position.y = 1.54;
      group.add(horizMesh);
      break;
    }
  }

  // Shadow settings
  group.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}

export const ThreeChessBoard: React.FC<ThreeChessBoardProps> = ({
  board,
  currentTurn: _currentTurn,
  selectedSquare,
  legalMoves,
  lastMove,
  isKingInCheck,
  isFlipped,
  themeMode,
  aiHints = [],
  onSquareClick
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const piecesGroupRef = useRef<THREE.Group | null>(null);
  const highlightsGroupRef = useRef<THREE.Group | null>(null);

  const movingAnimRef = useRef<{
    mesh: THREE.Group;
    startX: number;
    startZ: number;
    targetX: number;
    targetZ: number;
    startTime: number;
    duration: number;
  } | null>(null);
  const prevLastMoveRef = useRef<{ from: Position; to: Position } | null>(null);

  const [cameraAngle, setCameraAngle] = useState<'perspective' | 'top' | 'angled'>('perspective');

  // Convert board (row, col) to 3D world (X, Z) coordinates
  const boardToWorld = useCallback(
    (row: number, col: number) => {
      // Flipped or regular view
      const displayCol = isFlipped ? 7 - col : col;
      const displayRow = isFlipped ? 7 - row : row;

      // 8x8 grid centered at origin, each tile is 1.0 unit
      const x = (displayCol - 3.5) * 1.0;
      const z = (displayRow - 3.5) * 1.0;
      return { x, z };
    },
    [isFlipped]
  );

  // Convert 3D world (X, Z) back to board (row, col)
  const worldToBoard = useCallback(
    (x: number, z: number) => {
      const displayCol = Math.round(x + 3.5);
      const displayRow = Math.round(z + 3.5);

      if (displayCol < 0 || displayCol > 7 || displayRow < 0 || displayRow > 7) {
        return null;
      }

      const col = isFlipped ? 7 - displayCol : displayCol;
      const row = isFlipped ? 7 - displayRow : displayRow;
      return { row, col };
    },
    [isFlipped]
  );

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(themeMode === 'light' ? 0xf5f7fa : 0x111317);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 9.5, 7.8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera going below table
    controls.minDistance = 4;
    controls.maxDistance = 18;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8f0, 1.2);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xddeeff, 0.45);
    fillLight.position.set(-6, 8, -6);
    scene.add(fillLight);

    // Groups
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    const highlightsGroup = new THREE.Group();
    highlightsGroupRef.current = highlightsGroup;
    scene.add(highlightsGroup);

    const piecesGroup = new THREE.Group();
    piecesGroupRef.current = piecesGroup;
    scene.add(piecesGroup);

    // Table / Board Base
    const tableGeom = new THREE.BoxGeometry(9.6, 0.35, 9.6);
    const tableMat = new THREE.MeshStandardMaterial({
      color: themeMode === 'light' ? 0xe2e6ed : 0x1f232b,
      roughness: 0.5,
      metalness: 0.1
    });
    const tableMesh = new THREE.Mesh(tableGeom, tableMat);
    tableMesh.position.y = -0.2;
    tableMesh.receiveShadow = true;
    boardGroup.add(tableMesh);

    // 64 Board Squares
    const lightSquareMat = new THREE.MeshStandardMaterial({
      color: 0xf0d9b5,
      roughness: 0.35,
      metalness: 0.05
    });
    const darkSquareMat = new THREE.MeshStandardMaterial({
      color: 0xb58863,
      roughness: 0.45,
      metalness: 0.05
    });

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 === 0;
        const squareGeom = new THREE.BoxGeometry(0.98, 0.08, 0.98);
        const squareMesh = new THREE.Mesh(squareGeom, isLight ? lightSquareMat : darkSquareMat);
        squareMesh.position.set((c - 3.5) * 1.0, 0, (r - 3.5) * 1.0);
        squareMesh.receiveShadow = true;
        boardGroup.add(squareMesh);
      }
    }

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth Piece Animation Arc
      if (movingAnimRef.current) {
        const anim = movingAnimRef.current;
        const now = performance.now();
        const progress = Math.min(1, (now - anim.startTime) / anim.duration);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const curX = anim.startX + (anim.targetX - anim.startX) * ease;
        const curZ = anim.startZ + (anim.targetZ - anim.startZ) * ease;
        // Parabolic jump arc in Y (up to 0.65 units high)
        const arcY = Math.sin(progress * Math.PI) * 0.65;

        anim.mesh.position.set(curX, 0.04 + arcY, curZ);

        if (progress >= 1) {
          anim.mesh.position.set(anim.targetX, 0.04, anim.targetZ);
          movingAnimRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.replaceChildren();
    };
  }, [themeMode]);

  // Update Pieces in 3D Scene
  useEffect(() => {
    const piecesGroup = piecesGroupRef.current;
    if (!piecesGroup) return;

    // Clear old pieces
    while (piecesGroup.children.length > 0) {
      piecesGroup.remove(piecesGroup.children[0]);
    }

    // Materials
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.25,
      metalness: 0.08
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x222428,
      roughness: 0.35,
      metalness: 0.15
    });

    const isNewMove =
      lastMove &&
      (!prevLastMoveRef.current ||
        prevLastMoveRef.current.from.row !== lastMove.from.row ||
        prevLastMoveRef.current.from.col !== lastMove.from.col ||
        prevLastMoveRef.current.to.row !== lastMove.to.row ||
        prevLastMoveRef.current.to.col !== lastMove.to.col);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const pieceMesh = createPieceMesh(piece.type, piece.color, whiteMat, blackMat);
        const { x, z } = boardToWorld(r, c);

        const isDestinationOfMove =
          isNewMove &&
          r === lastMove.to.row &&
          c === lastMove.to.col;

        if (isDestinationOfMove) {
          const fromWorld = boardToWorld(lastMove.from.row, lastMove.from.col);
          pieceMesh.position.set(fromWorld.x, 0.04, fromWorld.z);
          movingAnimRef.current = {
            mesh: pieceMesh,
            startX: fromWorld.x,
            startZ: fromWorld.z,
            targetX: x,
            targetZ: z,
            startTime: performance.now(),
            duration: 280
          };
        } else {
          pieceMesh.position.set(x, 0.04, z);
        }

        // Turn knights to face opponent
        if (piece.type === 'knight') {
          if (piece.color === 'white') {
            pieceMesh.rotation.y = isFlipped ? 0 : Math.PI;
          } else {
            pieceMesh.rotation.y = isFlipped ? Math.PI : 0;
          }
        }

        piecesGroup.add(pieceMesh);
      }
    }

    prevLastMoveRef.current = lastMove;
  }, [board, boardToWorld, isFlipped, lastMove]);

  // Update Highlights (Selected Square, Legal Moves, Last Move, Check)
  useEffect(() => {
    const highlights = highlightsGroupRef.current;
    if (!highlights) return;

    while (highlights.children.length > 0) {
      highlights.remove(highlights.children[0]);
    }

    // Selected Square
    if (selectedSquare) {
      const { x, z } = boardToWorld(selectedSquare.row, selectedSquare.col);
      const selGeom = new THREE.BoxGeometry(0.98, 0.09, 0.98);
      const selMat = new THREE.MeshBasicMaterial({
        color: 0x4f86f7,
        transparent: true,
        opacity: 0.45
      });
      const selMesh = new THREE.Mesh(selGeom, selMat);
      selMesh.position.set(x, 0.01, z);
      highlights.add(selMesh);
    }

    // Last Move
    if (lastMove) {
      const fromPos = boardToWorld(lastMove.from.row, lastMove.from.col);
      const toPos = boardToWorld(lastMove.to.row, lastMove.to.col);
      const lastMat = new THREE.MeshBasicMaterial({
        color: 0xfaad14,
        transparent: true,
        opacity: 0.35
      });

      const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.085, 0.98), lastMat);
      m1.position.set(fromPos.x, 0.005, fromPos.z);
      highlights.add(m1);

      const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.085, 0.98), lastMat);
      m2.position.set(toPos.x, 0.005, toPos.z);
      highlights.add(m2);
    }

    // Legal Move Indicators
    legalMoves.forEach(m => {
      const { x, z } = boardToWorld(m.row, m.col);
      const isCapture = !!board[m.row][m.col];

      if (isCapture) {
        // Elegant rose capture ring
        const ringGeom = new THREE.RingGeometry(0.32, 0.44, 24);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.position.set(x, 0.06, z);
        highlights.add(ringMesh);
      } else {
        // Theme-tailored destination circle (indigo/azure accent)
        const circleGeom = new THREE.CircleGeometry(0.18, 24);
        circleGeom.rotateX(-Math.PI / 2);
        const circleMat = new THREE.MeshBasicMaterial({
          color: themeMode === 'light' ? 0x4f46e5 : 0x6366f1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const circleMesh = new THREE.Mesh(circleGeom, circleMat);
        circleMesh.position.set(x, 0.06, z);
        highlights.add(circleMesh);
      }
    });

    // 3D AI Move Assistance (Illuminated Cyan Tiles + Floating 3D Arrow)
    if (aiHints && aiHints.length > 0) {
      aiHints.forEach(hint => {
        const fromPos = boardToWorld(hint.from.row, hint.from.col);
        const toPos = boardToWorld(hint.to.row, hint.to.col);

        // From tile glowing cyan box
        const hintMat = new THREE.MeshBasicMaterial({
          color: 0x0ea5e9,
          transparent: true,
          opacity: 0.45
        });
        const fromMesh = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.088, 0.98), hintMat);
        fromMesh.position.set(fromPos.x, 0.007, fromPos.z);
        highlights.add(fromMesh);

        // To tile glowing cyan box
        const toMesh = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.088, 0.98), hintMat);
        toMesh.position.set(toPos.x, 0.007, toPos.z);
        highlights.add(toMesh);

        // 3D Directional Vector Arrow floating above board
        const dir = new THREE.Vector3(toPos.x - fromPos.x, 0, toPos.z - fromPos.z);
        const dist = dir.length();
        if (dist > 0.1) {
          dir.normalize();
          const arrowLength = Math.max(0.4, dist - 0.28);
          const arrowHelper = new THREE.ArrowHelper(
            dir,
            new THREE.Vector3(fromPos.x, 0.2, fromPos.z),
            arrowLength,
            0x0ea5e9,
            0.36,
            0.24
          );
          highlights.add(arrowHelper);
        }
      });
    }
  }, [selectedSquare, legalMoves, lastMove, isKingInCheck, board, boardToWorld, themeMode, aiHints]);

  // Click Handler with Raycaster
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Plane at board level y = 0
    const boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(boardPlane, intersection);

    if (hit) {
      const coords = worldToBoard(intersection.x, intersection.z);
      if (coords) {
        onSquareClick(coords.row, coords.col);
      }
    }
  };

  // Camera presets
  const handleSetCamera = (preset: 'perspective' | 'top' | 'angled') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraAngle(preset);

    if (preset === 'perspective') {
      cameraRef.current.position.set(0, 9.5, 7.8);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === 'top') {
      cameraRef.current.position.set(0, 12.5, 0.01);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === 'angled') {
      cameraRef.current.position.set(5.5, 8.5, 6.5);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div className="three-board-wrapper">
      <div
        ref={mountRef}
        className="three-canvas-container"
        onClick={handleCanvasClick}
      />

      {/* 3D Camera Controls Floating Pill */}
      <div className="three-camera-controls">
        <button
          type="button"
          className={`three-btn-cam ${cameraAngle === 'perspective' ? 'active' : ''}`}
          onClick={() => handleSetCamera('perspective')}
          title="Standart Açı"
        >
          <Eye size={13} />
          <span>3D</span>
        </button>
        <button
          type="button"
          className={`three-btn-cam ${cameraAngle === 'top' ? 'active' : ''}`}
          onClick={() => handleSetCamera('top')}
          title="Kuşbakışı (2.5D)"
        >
          <Maximize2 size={13} />
          <span>Üst</span>
        </button>
        <button
          type="button"
          className={`three-btn-cam ${cameraAngle === 'angled' ? 'active' : ''}`}
          onClick={() => handleSetCamera('angled')}
          title="Çapraz Açı"
        >
          <RotateCw size={13} />
          <span>Çapraz</span>
        </button>
      </div>
    </div>
  );
};
