/*
React Version of Patuti Game

Setup:
1. Create a React project (e.g., using Create React App or Vite).
2. Place your images in the 'public/moves' folder so they can be accessed at '/moves/...'.
3. Replace the default App.jsx with the code below.

Features Added:
- Bullets spawn from the right or from the top randomly.
- Pause/Resume with the 'P' key.
*/
import React, { useRef, useEffect, useState } from 'react';

const App = () => {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const platform = { x: 300, y: 250, width: 200, height: 30, img: new Image() };
    platform.img.src = '/moves/area.png';

    const patuti = {
      x: 375, y: 180, width: 50, height: 70,
      speed: 5, img: new Image(), life: 100,
      isJumping: false, isDocking: false, vy: 0
    };
    patuti.img.src = '/moves/idle-1.png';

    const bullets = [];
    const gravity = 1;
    let keys = {};

  const handleKey = (e) => {
  if (e.type === 'keydown') {
    keys[e.key] = true;
    if (e.key === 'p' || e.key === 'P') setPaused(prev => !prev);
  } else {
    keys[e.key] = false;
  }
};



    document.addEventListener('keydown', handleKey);
    document.addEventListener('keyup', handleKey);

    const spawnBullet = () => {
      const fromSide = Math.random() < 0.5 ? 'right' : 'top';
      const bullet = { width: 20, height: 20, speed: 4, img: new Image() };
      bullet.img.src = '/moves/bullet_h.png';

      if (fromSide === 'right') {
        bullet.x = canvas.width;
        bullet.y = Math.random() * 300 + 50;
        bullet.vx = -bullet.speed;
        bullet.vy = 0;
      } else {
        bullet.x = Math.random() * (canvas.width - bullet.width);
        bullet.y = 0;
        bullet.vx = 0;
        bullet.vy = bullet.speed;
      }
      bullets.push(bullet);
    };

    const drawPlatform = () => ctx.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);

    const drawPatuti = () => {
      if (patuti.isJumping) patuti.img.src = '/moves/jump-4.png';
      else if (patuti.isDocking) patuti.img.src = '/moves/dock-3.png';
      else if (keys['ArrowLeft']) patuti.img.src = '/moves/left-2.png';
      else if (keys['ArrowRight']) patuti.img.src = '/moves/right-2.png';
      else patuti.img.src = '/moves/idle-1.png';
      ctx.drawImage(patuti.img, patuti.x, patuti.y, patuti.width, patuti.height);
    };

    const updatePatuti = () => {
      if (keys['ArrowLeft'] && patuti.x > 0) patuti.x -= patuti.speed;
      if (keys['ArrowRight'] && patuti.x + patuti.width < canvas.width) patuti.x += patuti.speed;
      patuti.isDocking = !!keys['ArrowDown'];
      if (keys['ArrowUp'] && !patuti.isJumping) { patuti.vy = -15; patuti.isJumping = true; }

      patuti.y += patuti.vy;
      patuti.vy += gravity;
      const onPL = patuti.y + patuti.height <= platform.y && patuti.y + patuti.height + patuti.vy >= platform.y && patuti.x + patuti.width > platform.x && patuti.x < platform.x + platform.width;
      if (onPL) { patuti.y = platform.y - patuti.height; patuti.vy = 0; patuti.isJumping = false; }
      if (patuti.y > canvas.height) patuti.life = 0;
    };

    const drawBullets = () => {
      bullets.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        ctx.drawImage(b.img, b.x, b.y, b.width, b.height);
      });
    };

    const checkCollision = () => {
      bullets.forEach(b => {
        const hit = {
          x: patuti.x,
          y: patuti.isDocking ? patuti.y + patuti.height/2 : patuti.y,
          width: patuti.width,
          height: patuti.isDocking ? patuti.height/2 : patuti.height
        };
        if (b.x < hit.x + hit.width && b.x + b.width > hit.x && b.y < hit.y + hit.height && b.y + b.height > hit.y) {
          patuti.life -= 10;
          b.x = -999;
        }
      });
      document.getElementById('lifeBar').style.width = patuti.life + '%';
      if (patuti.life <= 0) setGameOver(true);
    };

    let lastSpawn = Date.now();
    const loop = () => {
      if (gameOver) return;
      if (!paused) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawPlatform(); updatePatuti(); drawPatuti(); drawBullets(); checkCollision();
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = 'white'; ctx.font = '32px Arial'; ctx.fillText('PAUSED', canvas.width/2 - 60, canvas.height/2);
      }
      if (Date.now() - lastSpawn > 1500 && !gameOver && !paused) { spawnBullet(); lastSpawn = Date.now(); }
      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('keyup', handleKey);
    };

  }, [gameOver, paused]);

  const restart = () => window.location.reload();

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={800} height={400} className="block mx-auto bg-transparent" />
      <div id="overlay" className="absolute bottom-5 right-5 w-52 h-5 border-2 border-black bg-red-600">
        <div id="lifeBar" className="h-full bg-green-500 w-full"></div>
      </div>
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white text-2xl">
          <p>Game Over</p>
          <button onClick={restart} className="m-2 p-2 bg-white text-black rounded">Play Again</button>
          <button onClick={() => window.close()} className="m-2 p-2 bg-white text-black rounded">Stop</button>
        </div>
      )}
    </div>
  );
};

export default App;
