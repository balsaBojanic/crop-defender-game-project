// --- app.js ---
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let running = false;
let difficulty = 'Normal';


const timeEl = document.getElementById('time');
const cropsEl = document.getElementById('crops');
const quotaEl = document.getElementById('cropQuota');
const wallsEl = document.getElementById('wallsHP');
const thievesEl = document.getElementById('thievesCount');
const msgEl = document.getElementById('msg');
const diffSelect = document.getElementById('difficulty');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');

diffSelect.addEventListener('change', () => difficulty = diffSelect.value);
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

let player, walls, crops, thieves, bullets;
let lastSpawn = 0, spawnInterval = 1600;
let gameStart = 0, timeToWin = 90;
let cropQuota = 2;

function resetGame() {
    running = false;
    msg('Game reset. Choose difficulty and Start.');
    initState();
    draw();
}

function startGame() {
    difficulty = diffSelect.value;
    const cfg = DIFF[difficulty];
    spawnInterval = cfg.spawnInterval;
    timeToWin = cfg.timeToWin;
    cropQuota = cfg.cropQuota;
    initState();
    running = true;
    gameStart = performance.now();
    lastSpawn = performance.now();
    msg('Game started — defend your crops!');
    requestAnimationFrame(loop);
}

function initState() {
    player = { x: W/2, y: H - 100, w: 28, h: 28, speed: 180 }; // Player near bottom
    walls = [];
    bullets = [];
    thieves = [];
    const cfg = DIFF[difficulty] || DIFF['Normal'];
    
    // Horizontal walls at the top
    for (let i = 0; i < 5; i++) {
        walls.push({
            x: 150 + i * 120,  // Spread horizontally
            y: 80,             // Positioned at top
            w: 100,            // Wider walls
            h: 20,             // Thinner walls (horizontal orientation)
            hp: cfg.wallHP,
            maxHp: cfg.wallHP,
            broken: false
        });
    }
    
    crops = [];
    // Crops centered at bottom
    for (let i = 0; i < 3; i++) {
        crops.push({
            x: W/2 - 200 + i * 200,  // Centered horizontally
            y: H - 120,               // Positioned at bottom
            w: 140,
            h: 80,
            waterTimer: cfg.cropTimer,
            maxTimer: cfg.cropTimer,
            alive: true
        });
    }
}

const keys = {};
addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') e.preventDefault();
});
addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
});

function spawnThief() {
    const x = 150 + Math.random() * (W - 300);  // Spawn across top width
    thieves.push({
        x: x,
        y: -20,  // Start above canvas
        r: 12,
        speed: 30 + Math.random() * 20,
        dmg: 2 + Math.floor(Math.random() * 2),
        target: Math.floor(Math.random() * walls.length),  // Target random wall
        hp: 8
    });
}

function update(dt) {
    if (!running) return;
    
    const s = player.speed * dt;
    if (keys['w'] || keys['arrowup']) player.y -= s;
    if (keys['s'] || keys['arrowdown']) player.y += s;
    if (keys['a'] || keys['arrowleft']) player.x -= s;
    if (keys['d'] || keys['arrowright']) player.x += s;
    
    player.x = Math.max(10, Math.min(W - 10, player.x));
    player.y = Math.max(H - 200, Math.min(H - 10, player.y));  // Constrain to bottom area

    // water crops
    if (keys['e']) {
        for (const c of crops) {
            if (c.alive && rectOverlap(player, c)) {
                c.waterTimer = c.maxTimer;
            }
        }
    }
    
    // repair walls
    if (keys['r']) {
        for (const w of walls) {
            if (dist(player, w) < 80 && !w.broken) {
                w.hp = Math.min(w.maxHp, w.hp + 40 * dt);
            }
        }
    }
    
    // shooting - bullets go upward
    if (keys[' ']) {
        if (!player.shootCooldown || player.shootCooldown <= 0) {
            bullets.push({ 
                x: player.x + player.w/2, 
                y: player.y, 
                vx: 0,      // No horizontal movement
                vy: -400,    // Upward movement
                r: 4 
            });
            player.shootCooldown = 0.35;
        }
    }
    
    if (player.shootCooldown > 0) player.shootCooldown -= dt;

    
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;  
        if (b.y < -50) bullets.splice(i, 1);  
    }

    
    if (performance.now() - lastSpawn > spawnInterval) {
        lastSpawn = performance.now();
        const cfg = DIFF[difficulty];
        for (let i = 0; i < (cfg.thievesPerWave || 1); i++) spawnThief();
    }

    
    for (let i = thieves.length - 1; i >= 0; i--) {
        const t = thieves[i];
        const w = walls[t.target];
        
        if (w && !w.broken) {
            
            if (t.y < w.y + w.h + 10) {
                t.y += t.speed * dt;  
            } else {
                
                w.hp -= t.dmg * dt;
                if (w.hp <= 0) {
                    w.broken = true;
                    w.hp = 0;
                    loseCrops(1);
                }
            }
        } else {
            
            t.y += t.speed * dt;
            if (t.y > H - 60) {  
                loseCrops(1);
                thieves.splice(i, 1);
                continue;
            }
        }
        
       
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (circleRectCollide(t, b)) {
                t.hp -= 4;
                bullets.splice(j, 1);
                if (t.hp <= 0) {
                    thieves.splice(i, 1);
                    break;
                }
            }
        }
    }

    
    for (const c of crops) {
        if (!c.alive) continue;
        c.waterTimer -= dt * 1000;
        if (c.waterTimer <= 0) {
            c.alive = false;
            loseCrops(1);
        }
    }

    const elapsed = (performance.now() - gameStart) / 1000;
    const remain = Math.max(0, timeToWin - elapsed);
    
    if (remain <= 0) {
        const alive = crops.filter(c => c.alive).length;
        running = false;
        msg(alive >= cropQuota ? 'You win!' : 'You lose — too few crops.');
    }
}

function loseCrops(n) {
    for (let i = 0; i < n; i++) {
        const alive = crops.find(c => c.alive);
        if (alive) alive.alive = false;
    }
}

function loop(ts) {
    const now = performance.now();
    if (!loop.last) loop.last = now;
    const dt = Math.min(0.05, (now - loop.last) / 1000);
    loop.last = now;
    update(dt);
    draw();
    if (running) requestAnimationFrame(loop);
}

function draw() {
    ctx.clearRect(0, 0, W, H);
    
    
    ctx.fillStyle = '#2c5';
    ctx.fillRect(0, 0, W, 120);  
    
    
    ctx.fillStyle = '#2c5';
    ctx.fillRect(0, H - 160, W, 160);  
    
    
    for (const w of walls) {
        ctx.fillStyle = w.broken ? '#333' : (w.hp / w.maxHp > 0.5 ? '#855' : '#a53');
        ctx.fillRect(w.x, w.y, w.w, w.h);
        
        
        ctx.fillStyle = '#111';
        ctx.fillRect(w.x - 2, w.y - 12, w.w + 4, 8);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(w.x - 2, w.y - 12, (w.hp / w.maxHp) * (w.w + 4), 8);
    }
    
    
    for (const c of crops) {
        ctx.fillStyle = c.alive ? '#3a3' : '#4a4';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        
        
        ctx.fillStyle = '#111';
        ctx.fillRect(c.x, c.y - 12, c.w, 8);
        
        const frac = Math.max(0, c.waterTimer / c.maxTimer);
        ctx.fillStyle = frac > 0.6 ? '#0ff' : (frac > 0.2 ? '#ff8' : '#f65');
        ctx.fillRect(c.x, c.y - 12, c.w * frac, 8);
    }
    
    
    ctx.fillStyle = '#08f';
    ctx.fillRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
    
    
    for (const b of bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd';
        ctx.fill();
    }
    
    
    for (const t of thieves) {
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fillStyle = '#642';
        ctx.fill();
    }
    
    const elapsed = running ? (performance.now() - gameStart) / 1000 : 0;
    const remain = Math.max(0, timeToWin - elapsed);
    
    timeEl.innerText = running ? remain.toFixed(1) + 's' : '--';
    cropsEl.innerText = crops.filter(c => c.alive).length;
    quotaEl.innerText = cropQuota;
    wallsEl.innerText = walls.map(w => Math.round(w.hp)).join(', ');
    thievesEl.innerText = thieves.length;
}

resetGame();