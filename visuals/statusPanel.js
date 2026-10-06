const statusIsMobile = device.mobile || window.matchMedia('(max-width: 700px)').matches || ('ontouchstart' in window && window.innerWidth <= 900);

Object.assign(statsPanel.style, {
    position: 'fixed',
    bottom: statusIsMobile ? 'calc(76px + env(safe-area-inset-bottom))' : '20px',
    left: statusIsMobile ? '12px' : '20px',
    top: 'auto',
    width: statusIsMobile ? 'calc(100% - 24px)' : '250px',
    maxWidth: statusIsMobile ? 'calc(100% - 24px)' : '250px',
    minHeight: statusIsMobile ? '34px' : '30px',
    height: 'auto',
    backgroundColor: statusIsMobile ? 'rgb(0,0,0,0.62)' : 'rgb(0,0,0,0.2)',
    color: 'white',
    fontSize: statusIsMobile ? '11px' : '13px',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: statusIsMobile ? 'default' : 'grab',
    borderRadius: statusIsMobile ? '9px' : '10px',
    userSelect: 'none',
    zIndex: '10000',
    transition: 'transform 0.18s, background-color 0.18s',
    backdropFilter: 'blur(7px)',
    WebkitBackdropFilter: 'blur(7px)',
    padding: statusIsMobile ? '8px 10px' : '0'
});

const getPing = async () => {
    if (window.disablePing) return ':( ';
    try {
        const t = performance.now();
        await fetch('https://pt.khanacademy.org/', { method: 'HEAD' });
        return Math.round(performance.now() - t);
    } catch {
        return 'Error';
    }
};

let lastFrameTime = performance.now(), frameCount = 0, fps = 0;
(function calcFPS() {
    if (++frameCount && performance.now() - lastFrameTime >= 1000) {
        fps = Math.round(frameCount * 1000 / (performance.now() - lastFrameTime));
        frameCount = 0;
        lastFrameTime = performance.now();
    }
    requestAnimationFrame(calcFPS);
})();

const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const update = async () => statsPanel.innerHTML = `
    <span style="color:#72ff72; font-weight:700;">Blizkt</span>
    <span style="margin:0 7px; color:#777;">|</span><span>${fps}fps</span>
    <span style="margin:0 7px; color:#777;">|</span><span>${await getPing()}ms</span>
    <span style="margin:0 7px; color:#777;">|</span><span>${getTime()}</span>
`;

update();
document.body.appendChild(statsPanel);
setInterval(update, 1000);

if (!statusIsMobile) {
    let isDragging = false, offsetX = 0, offsetY = 0;
    statsPanel.addEventListener('pointerdown', e => {
        isDragging = true;
        offsetX = e.clientX - statsPanel.offsetLeft;
        offsetY = e.clientY - statsPanel.offsetTop;
        statsPanel.style.transform = 'scale(0.97)';
        if (statsPanel.setPointerCapture) statsPanel.setPointerCapture(e.pointerId);
    });
    statsPanel.addEventListener('pointerup', () => { isDragging = false; statsPanel.style.transform = 'scale(1)'; });
    document.addEventListener('pointermove', e => {
        if (!isDragging) return;
        Object.assign(statsPanel.style, {
            left: `${Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - statsPanel.offsetWidth))}px`,
            top: `${Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - statsPanel.offsetHeight))}px`,
            bottom: 'auto'
        });
    });
}

if (statusIsMobile) {
    plppdo.on('domChanged', () => {
        statsPanel.style.display = window.location.href.includes("khanacademy.org/profile") ? 'flex' : 'none';
    });
}
