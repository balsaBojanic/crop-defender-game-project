
const DIFF = {
    'Easy': {
        spawnInterval: 5000,
        wallHP: 100,
        cropTimer: 18000,
        timeToWin: 30,
        thievesPerWave: 0.5,
        cropQuota: 2
    },
    'Normal': {
        spawnInterval: 2400,
        wallHP: 80,
        cropTimer: 14000,
        timeToWin: 40,
        thievesPerWave: 1,
        cropQuota: 2
    },
    'Hard': {
        spawnInterval: 3000,
        wallHP: 60,
        cropTimer: 18000,
        timeToWin: 50,
        thievesPerWave: 2,
        cropQuota: 3
    }
};

function msg(t) {
    msgEl.innerText = t;
}

function rectOverlap(a, b) {
    return !(
        a.x + a.w / 2 < b.x ||
        a.x - a.w / 2 > b.x + b.w ||
        a.y + a.h / 2 < b.y ||
        a.y - a.h / 2 > b.y + b.h
    );
}

function dist(a, b) {
    const bx = (b.x + (b.w ? b.w / 2 : 0));
    const by = (b.y + (b.h ? b.h / 2 : 0));
    return Math.hypot(a.x - bx, a.y - by);
}

function circleRectCollide(circ, rect) {
    const rx = rect.x;
    const ry = rect.y;
    const rw = rect.w || 6;
    const rh = rect.h || 6;
    const dx = Math.abs(circ.x - (rx + rw / 2));
    const dy = Math.abs(circ.y - (ry + rh / 2));
    
    if (dx > rw / 2 + circ.r) return false;
    if (dy > rh / 2 + circ.r) return false;
    if (dx <= rw / 2) return true;
    if (dy <= rh / 2) return true;
    
    const dx2 = dx - rw / 2;
    const dy2 = dy - rh / 2;
    return (dx2 * dx2 + dy2 * dy2) <= (circ.r * circ.r);
}