const rgbStyle = document.createElement('style');
rgbStyle.className = 'RGBLogo';
rgbStyle.textContent = `
    @keyframes colorShift {
        0% { fill: rgb(255, 0, 0); }
        33% { fill: rgb(0, 255, 0); }
        66% { fill: rgb(0, 0, 255); }
        100% { fill: rgb(255, 0, 0); }
    }
`;

function findKhanLogoPath() {
    const logo = document.querySelector('svg._1rt6g9t, svg[aria-label*="Khan" i], svg[aria-label*="Academy" i], header svg');
    return logo?.querySelector('path:nth-last-of-type(2), path:last-of-type') || null;
}

function updateRgbLogo() {
    const khanLogo = findKhanLogoPath();
    if (!features.rgbLogo) {
        if (khanLogo) khanLogo.style.animation = '';
        return;
    }
    if (!khanLogo) return;
    if (!document.querySelector('style.RGBLogo')) document.head.appendChild(rgbStyle);
    khanLogo.removeAttribute('data-darkreader-inline-fill');
    khanLogo.style.animation = 'colorShift 5s infinite';
}

plppdo.on('domChanged', updateRgbLogo);
updateRgbLogo();