// src/App.js

import React, { useRef, useEffect, useState } from 'react';
import './App.css'; // (See the next section for App.css)

function App() {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // ───────────────────────────────────────────────────────────
    // 1) INITIAL SETUP: PLATFORM, PATUTI, BULLETS, KEYS, GRAVITY
    // ───────────────────────────────────────────────────────────
    const platform = {
      x: 300,
      y: 250,
      width: 200,
      height: 30,
      img: new Image(),
    };
    platform.img.src = '/moves/area.png';

    const patuti = {
      x: 375,
      y: 180,
      width: 50,
      height: 70,
      speed: 4,
      img: new Image(),
      life: 100,
      isJumping: false,
      isDocking: false,
      vy: 0,
    };
    patuti.img.src = '/moves/idle-1.png';

    const bullets = [];
    const gravity = 1;
    let keys = {};

    // ───────────────────────────────────────────────────────────
    // 2) KEYBOARD HANDLING (MOVE, JUMP, DOCK, PAUSE)
    // ───────────────────────────────────────────────────────────
    const handleKey = (e) => {
      if (e.type === 'keydown') {
        keys[e.key] = true;
        if (e.key === 'p' || e.key === 'P') {
          setPaused((prev) => !prev);
        }
      } else {
        keys[e.key] = false;
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('keyup', handleKey);

    // ───────────────────────────────────────────────────────────
    // 3) SPAWN BULLET: OFF‐CANVAS + AIM AT PATUTI
    // ───────────────────────────────────────────────────────────
    const spawnBullet = () => {
      const bullet = {
        width: 20,
        height: 20,
        speed: 4,
        img: new Image(),
      };
      bullet.img.src = '/moves/bullet_h.png';

      // Randomly choose “right” or “top”
      const fromSide = Math.random() < 0.5 ? 'right' : 'top';

      if (fromSide === 'right') {
        // Place bullet just off the right edge, aligned to Patuti’s vertical center
        bullet.x = canvas.width + bullet.width;
        bullet.y = patuti.y + patuti.height / 2 - bullet.height / 2;
        bullet.vx = -bullet.speed;
        bullet.vy = 0;
      } else {
        // Place bullet just above the top edge, aligned to Patuti’s horizontal center
        bullet.x = patuti.x + patuti.width / 2 - bullet.width / 2;
        bullet.y = -bullet.height;
        bullet.vx = 0;
        bullet.vy = bullet.speed;
      }

      bullets.push(bullet);
    };

    // ───────────────────────────────────────────────────────────
    // 4) DRAW / UPDATE FUNCTIONS
    // ───────────────────────────────────────────────────────────
    const drawPlatform = () => {
      ctx.drawImage(
        platform.img,
        platform.x,
        platform.y,
        platform.width,
        platform.height
      );
    };

    const drawPatuti = () => {
      if (patuti.isJumping) patuti.img.src = '/moves/jump-4.png';
      else if (patuti.isDocking) patuti.img.src = '/moves/dock-3.png';
      else if (keys['ArrowLeft']) patuti.img.src = '/moves/left-2.png';
      else if (keys['ArrowRight']) patuti.img.src = '/moves/right-2.png';
      else patuti.img.src = '/moves/idle-1.png';

      ctx.drawImage(
        patuti.img,
        patuti.x,
        patuti.y,
        patuti.width,
        patuti.height
      );
    };

    const updatePatuti = () => {
      // LEFT / RIGHT
      if (keys['ArrowLeft'] && patuti.x > 0) patuti.x -= patuti.speed;
      if (
        keys['ArrowRight'] &&
        patuti.x + patuti.width < canvas.width
      )
        patuti.x += patuti.speed;

      // DOCK & JUMP
      patuti.isDocking = !!keys['ArrowDown'];
      if (keys['ArrowUp'] && !patuti.isJumping) {
        patuti.vy = -15;
        patuti.isJumping = true;
      }

      // APPLY GRAVITY
      patuti.y += patuti.vy;
      patuti.vy += gravity;

      // LAND ON PLATFORM (only if falling onto it)
      const onPlatform =
        patuti.y + patuti.height <= platform.y &&
        patuti.y + patuti.height + patuti.vy >= platform.y &&
        patuti.x + patuti.width > platform.x &&
        patuti.x < platform.x + platform.width;

      if (onPlatform) {
        patuti.y = platform.y - patuti.height;
        patuti.vy = 0;
        patuti.isJumping = false;
      }

      // IF PATUTI FALLS OFF BOTTOM → immediate death
      if (patuti.y > canvas.height) {
        patuti.life = 0;
      }
    };

    const drawBullets = () => {
      bullets.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        ctx.drawImage(b.img, b.x, b.y, b.width, b.height);
      });
    };

    const checkCollision = () => {
      bullets.forEach((b) => {
        // PATUTI’S HITBOX (shrinks if docking)
        const hit = {
          x: patuti.x,
          y: patuti.isDocking
            ? patuti.y + patuti.height / 2
            : patuti.y,
          width: patuti.width,
          height: patuti.isDocking
            ? patuti.height / 2
            : patuti.height,
        };

        if (
          b.x < hit.x + hit.width &&
          b.x + b.width > hit.x &&
          b.y < hit.y + hit.height &&
          b.y + b.height > hit.y
        ) {
          patuti.life -= 10;
          // Send bullet off‐screen so it can’t keep colliding
          b.x = -999;
        }
      });

      // UPDATE LIFE BAR
      document.getElementById('lifeBar').style.width =
        patuti.life + '%';

      if (patuti.life <= 0) {
        setGameOver(true);
      }
    };

    // ───────────────────────────────────────────────────────────
    // 5) MAIN GAME LOOP (1 SECOND SPAWN + PAUSE CHECK)
    // ───────────────────────────────────────────────────────────
    let lastSpawn = Date.now();

    const loop = () => {
      if (gameOver) return;

      if (!paused) {
        // CLEAR CANVAS & REDRAW EVERYTHING
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlatform();
        updatePatuti();
        drawPatuti();
        drawBullets();
        checkCollision();

        // ─── SPAWN NEW BULLET EVERY 1 SECOND (ONLY IF NOT PAUSED/GAMEOVER) ───
        if (
          Date.now() - lastSpawn > 1000 && // 1000 ms = 1 second
          !paused &&
          !gameOver
        ) {
          spawnBullet();
          lastSpawn = Date.now();
        }
      } else {
        // DRAW “PAUSED” OVERLAY WHEN PAUSED
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '32px Arial';
        ctx.fillText('PAUSED', canvas.width / 2 - 60, canvas.height / 2);
      }

      requestAnimationFrame(loop);
    };

    loop();

    // ───────────────────────────────────────────────────────────
    // 6) CLEANUP: REMOVE EVENT LISTENERS ON UNMOUNT
    // ───────────────────────────────────────────────────────────
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('keyup', handleKey);
    };
  }, [gameOver, paused]);

  // ───────────────────────────────────────────────────────────
  // 7) RESTART HANDLER (PAGE RELOAD)
  // ───────────────────────────────────────────────────────────
  const restart = () => window.location.reload();

  // ───────────────────────────────────────────────────────────
  // 8) JSX: CANVAS, LIFE BAR OVERLAY, GAME OVER SCREEN
  // ───────────────────────────────────────────────────────────
  return (
    <>
      <canvas ref={canvasRef} width={800} height={400} />

      <div id="overlay">
        <div id="lifeBar"></div>
      </div>

      <div
        id="gameOverScreen"
        style={{ display: gameOver ? 'flex' : 'none' }}
      >
        <p>Game Over</p>
        <button onClick={restart}>Play Again</button>
        <button onClick={() => window.close()}>Stop</button>
      </div>
    </>
  );
}

export default App;
