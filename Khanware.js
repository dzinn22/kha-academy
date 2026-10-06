if (window.__KHA_ACADEMY_2026_RUNNING__) {
    console.info('[KHA Academy] 2026 já está ativo nesta página.');
} else {
window.__KHA_ACADEMY_2026_RUNNING__ = true;
var ver = "V4.0.0-2026";
let isDev = false;

const repoPath = `https://raw.githubusercontent.com/dzinn22/kha-academy/refs/heads/${isDev ? "dev/" : "main/"}`;

let device = {
    mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile|Tablet|Kindle|Silk|PlayBook|BB10/i.test(navigator.userAgent),
    apple: /iPhone|iPad|iPod|Macintosh|Mac OS X/i.test(navigator.userAgent)
};

/* User */
let user = {
    username: "Username",
    nickname: "Nickname",
    UID: 0
}

let loadedPlugins = [];

/* Elements */
const unloader = document.createElement('unloader');
const dropdownMenu = document.createElement('dropDownMenu');
const watermark = document.createElement('watermark');
const statsPanel = document.createElement('statsPanel');
const splashScreen = document.createElement('splashScreen');

/* Globals */
window.features = {
    questionSpoof: true,
    videoSpoof: true,
    showAnswers: true, // Ativado por padrão para facilitar a lógica de clique
    autoAnswer: false, // REMOVIDO: Agora é manual por clique
    customBanner: false,
    nextRecomendation: false,
    repeatQuestion: false,
    minuteFarmer: false,
    rgbLogo: false
};
window.featureConfigs = {
    autoAnswerDelay: 3,
    customUsername: "",
    customPfp: ""
};

/* Compatibility */
// Do not block the browser context menu or developer tools. Older anti-debug hooks
// caused reload loops and made troubleshooting the 2026 Khan UI unnecessarily hard.
window.disableSecurity = true;

/* Misc Styles */
document.head.appendChild(Object.assign(document.createElement("style"),{innerHTML:"@font-face{font-family:'MuseoSans';src:url('https://corsproxy.io/?url=https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/ynddewua.ttf')format('truetype')}" }));
document.head.appendChild(Object.assign(document.createElement('style'),{innerHTML:"::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; } ::-webkit-scrollbar-thumb:hover { background: #555; }"}));
const favicon = document.querySelector("link[rel~='icon']");
if (favicon) favicon.href = 'https://images-ext-1.discordapp.net/external/Cyc2A3ysxp_YyAWBfG2Eph83t5WYNA8OezrB_N-RkEk/%3Fsize%3D2048/https/cdn.discordapp.com/icons/1420566429266350280/8a669244159c125add2879560a819f65.png?format=webp&quality=lossless';

/* Emmiter */
class EventEmitter{constructor(){this.events={}}on(t,e){"string"==typeof t&&(t=[t]),t.forEach(t=>{this.events[t]||(this.events[t]=[]),this.events[t].push(e)})}off(t,e){"string"==typeof t&&(t=[t]),t.forEach(t=>{this.events[t]&&(this.events[t]=this.events[t].filter(t=>t!==e))})}emit(t,...e){this.events[t]&&this.events[t].forEach(t=>{t(...e)})}once(t,e){"string"==typeof t&&(t=[t]);let s=(...i)=>{e(...i),this.off(t,s)};this.on(t,s)}};
const plppdo = new EventEmitter();

const khaDomObserver = new MutationObserver((mutationsList) => {
    if (mutationsList.some(mutation => mutation.type === 'childList')) plppdo.emit('domChanged');
});
if (document.body) khaDomObserver.observe(document.body, { childList: true, subtree: true });
else document.addEventListener('DOMContentLoaded', () => khaDomObserver.observe(document.body, { childList: true, subtree: true }), { once: true });

/* Misc Functions */
window.debug = function(text) { /* QuickFix */}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const playAudio = url => {
    try {
        const audio = new Audio(url);
        const playback = audio.play();
        if (playback?.catch) playback.catch(() => {});
        debug('Playing audio from ' + url);
    } catch (error) {
        debug('Audio unavailable: ' + error.message);
    }
};
const findAndClickBySelector = selector => { const element = document.querySelector(selector); if (element) { element.click(); sendToast(`⭕ Pressionando ${selector}...`, 1000); } };

function sendToast(text, duration = 5000, gravity = 'bottom') {
    if (typeof Toastify === 'function') {
        Toastify({ text, duration, gravity, position: "center", stopOnFocus: true, style: { background: "#000000" } }).showToast();
    } else {
        console.info('[KHA Academy]', text);
    }
    debug(text);
}

function setFeatureByPath(path, value) {
    if (!path) return;
    const parts = path.split('.');
    let target = window;
    for (let index = 0; index < parts.length - 1; index += 1) {
        target = target?.[parts[index]];
        if (!target) return;
    }
    target[parts[parts.length - 1]] = value;
}

function readRequestUrl(input) {
    return typeof input === 'string' ? input : input?.url || '';
}

async function readRequestBody(input, init) {
    if (init?.body != null) return typeof init.body === 'string' ? init.body : '';
    if (typeof Request !== 'undefined' && input instanceof Request) {
        try { return await input.clone().text(); } catch { return ''; }
    }
    return '';
}

function replaceRequestBody(input, init, body) {
    if (typeof Request !== 'undefined' && input instanceof Request) {
        return [new Request(input, { body }), init];
    }
    return [input, { ...(init || {}), body }];
}

const bundledModules = {
    "visuals/mainMenu.js": "function addFeature(features) {\n    const feature = document.createElement('feature');\n    feature.className = 'kha-feature-group';\n\n    features.forEach(attribute => {\n        let element = attribute.type === 'nonInput' ? document.createElement('label') : document.createElement('input');\n        if (attribute.type === 'nonInput') {\n            element.innerHTML = attribute.name;\n            element.classList.add('kha-section-title');\n        } else {\n            element.type = attribute.type;\n            element.id = attribute.name;\n            element.classList.add('kha-control');\n        }\n\n        if (attribute.attributes) {\n            attribute.attributes.split(' ').map(attr => attr.split('=')).forEach(([key, value]) => {\n                value = value ? value.replace(/\"/g, '') : '';\n                key === 'style' ? element.style.cssText = value : element.setAttribute(key, value);\n            });\n        }\n\n        if (attribute.variable) element.setAttribute('setting-data', attribute.variable);\n        if (attribute.dependent) element.setAttribute('dependent', attribute.dependent);\n        if (attribute.className) element.classList.add(attribute.className);\n\n        if (attribute.labeled) {\n            const label = document.createElement('label');\n            label.classList.add('kha-setting-row');\n            if (attribute.className) label.classList.add(attribute.className);\n            if (attribute.attributes) {\n                attribute.attributes.split(' ').map(attr => attr.split('=')).forEach(([key, value]) => {\n                    value = value ? value.replace(/\"/g, '') : '';\n                    key === 'style' ? label.style.cssText = value : label.setAttribute(key, value);\n                });\n            }\n            label.innerHTML = `${element.outerHTML} ${attribute.label}`;\n            feature.appendChild(label);\n        } else {\n            feature.appendChild(element);\n        }\n    });\n    dropdownMenu.innerHTML += feature.outerHTML;\n}\n\nfunction handleInput(ids, callback = null) {\n    (Array.isArray(ids) ? ids.map(id => document.getElementById(id)) : [document.getElementById(ids)])\n    .forEach(element => {\n        if (!element) return;\n        const setting = element.getAttribute('setting-data'),\n            dependent = element.getAttribute('dependent'),\n            handleEvent = (e, value) => {\n                setFeatureByPath(setting, value);\n                if (callback) callback(value, e);\n            };\n\n        if (element.type === 'checkbox') {\n            element.addEventListener('change', (e) => {\n                playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/5os0bypi.wav');\n                handleEvent(e, e.target.checked);\n                if (dependent) dependent.split(',').forEach(dep =>\n                    document.querySelectorAll(`.${dep}`).forEach(depEl =>\n                        depEl.style.display = e.target.checked ? null : \"none\"));\n            });\n        } else {\n            element.addEventListener('input', (e) => handleEvent(e, e.target.value));\n        }\n    });\n}\n\nconst menuIsMobile = device.mobile || window.matchMedia('(max-width: 700px)').matches || ('ontouchstart' in window && window.innerWidth <= 900);\n\n/* Watermark / mobile touch trigger */\nObject.assign(watermark.style, {\n    position: 'fixed',\n    top: menuIsMobile ? 'auto' : '12px',\n    bottom: menuIsMobile ? 'calc(14px + env(safe-area-inset-bottom))' : 'auto',\n    left: menuIsMobile ? 'auto' : 'calc(100% - 165px)',\n    right: menuIsMobile ? '14px' : 'auto',\n    width: menuIsMobile ? '54px' : '150px',\n    height: menuIsMobile ? '54px' : '30px',\n    backgroundColor: menuIsMobile ? '#151c20' : 'RGB(0,0,0,0.5)',\n    color: 'white',\n    fontSize: menuIsMobile ? '0' : '15px',\n    fontFamily: 'MuseoSans, sans-serif',\n    display: 'flex',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n    cursor: 'pointer',\n    userSelect: 'none',\n    padding: menuIsMobile ? '0' : '0 10px',\n    border: menuIsMobile ? '1px solid rgba(114,255,114,.7)' : '0',\n    borderRadius: menuIsMobile ? '50%' : '10px',\n    zIndex: '10001',\n    transition: 'transform 0.18s ease, background-color 0.18s ease',\n    touchAction: menuIsMobile ? 'manipulation' : 'none',\n    boxShadow: menuIsMobile ? '0 5px 22px rgba(0,0,0,.38), 0 0 0 4px rgba(114,255,114,.08)' : 'none'\n});\n\nwatermark.innerHTML = menuIsMobile\n    ? `<span class=\"kha-mobile-logo\" aria-hidden=\"true\">B</span><span class=\"kha-version\">${ver}</span>`\n    : `<span style=\"text-shadow: -1px 0.5px 0 #72ff72, -2px 0px 0 #2f672e;\">Blizkt</span> <span style=\"color:gray; padding-left:2px; font-family: Arial, sans-serif; font-size:10px\">${ver}</span>`;\nwatermark.setAttribute('role', 'button');\nwatermark.setAttribute('tabindex', '0');\nwatermark.setAttribute('aria-label', menuIsMobile ? 'Abrir painel Blizkt' : 'Painel Blizkt');\nwatermark.setAttribute('aria-expanded', 'false');\ndocument.body.appendChild(watermark);\n\nlet isDragging = false, offsetX = 0, offsetY = 0;\n\n/* Dropdown */\nObject.assign(dropdownMenu.style, {\n    position: menuIsMobile ? 'fixed' : 'absolute',\n    top: menuIsMobile ? 'auto' : '100%',\n    bottom: menuIsMobile ? 'calc(78px + env(safe-area-inset-bottom))' : 'auto',\n    left: menuIsMobile ? '12px' : '0',\n    right: menuIsMobile ? '12px' : 'auto',\n    width: menuIsMobile ? 'auto' : '160px',\n    maxHeight: menuIsMobile ? 'min(74vh, 560px)' : 'none',\n    overflowY: menuIsMobile ? 'auto' : 'visible',\n    backgroundColor: menuIsMobile ? 'rgba(16,23,27,.98)' : 'rgba(0,0,0,0.3)',\n    border: menuIsMobile ? '1px solid rgba(114,255,114,.24)' : '0',\n    borderRadius: menuIsMobile ? '16px' : '10px',\n    color: 'white',\n    fontSize: menuIsMobile ? '13px' : '13px',\n    fontFamily: 'Monospace, sans-serif',\n    display: 'none',\n    flexDirection: 'column',\n    zIndex: '10000',\n    padding: menuIsMobile ? '12px' : '5px',\n    cursor: 'default',\n    userSelect: 'none',\n    transition: 'opacity 0.18s ease, transform 0.18s ease',\n    backdropFilter: 'blur(12px)',\n    WebkitBackdropFilter: 'blur(12px)',\n    boxShadow: menuIsMobile ? '0 18px 50px rgba(0,0,0,.48)' : 'none'\n});\n\ndropdownMenu.innerHTML = `\n    <style>\n        dropDownMenu { box-sizing: border-box; }\n        dropDownMenu .kha-feature-group { display: block; margin: 0; padding: 0; }\n        dropDownMenu .kha-section-title { display: block; margin: 9px 5px 4px; color: #72ff72; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }\n        dropDownMenu .kha-setting-row { display: flex; align-items: center; gap: 9px; min-height: 36px; border-radius: 7px; color: #ecf3ec; padding: 5px 6px; font-size: 12px; line-height: 1.25; transition: background-color .16s ease; }\n        dropDownMenu .kha-setting-row:hover, dropDownMenu .kha-setting-row:focus-within { background: rgba(114,255,114,.10); }\n        dropDownMenu input[type=\"checkbox\"] { appearance: none; width: 19px; height: 19px; flex: 0 0 19px; margin: 0; border: 1px solid #77817b; border-radius: 5px; background-color: #28302e; cursor: pointer; }\n        dropDownMenu input[type=\"checkbox\"]:checked { border-color: #72ff72; background: #72ff72; box-shadow: inset 0 0 0 4px #263229; }\n        dropDownMenu input[type=\"checkbox\"]:focus-visible, dropDownMenu input[type=\"text\"]:focus-visible, dropDownMenu input[type=\"range\"]:focus-visible { outline: 2px solid #72ff72; outline-offset: 2px; }\n        dropDownMenu input[type=\"text\"], dropDownMenu input[type=\"number\"] { width: 100%; min-width: 0; min-height: 32px; border: 1px solid #3c4844; border-radius: 6px; color: white; background: #1b2422; padding: 6px 8px; }\n        dropDownMenu input[type=\"range\"] { width: 100%; min-width: 96px; accent-color: #72ff72; cursor: pointer; }\n        dropDownMenu .kha-control:not([type=\"checkbox\"]):not([type=\"text\"]):not([type=\"number\"]):not([type=\"range\"]) { display: block; }\n        dropDownMenu::-webkit-scrollbar { width: 6px; }\n        dropDownMenu::-webkit-scrollbar-thumb { border-radius: 6px; background: #4d5d55; }\n        .kha-mobile-logo { display: grid; width: 33px; height: 33px; place-items: center; border: 2px solid #72ff72; border-radius: 11px; transform: rotate(-8deg); color: #72ff72; font-family: Arial, sans-serif; font-size: 20px; font-weight: 900; line-height: 1; }\n        .kha-version { display: none; }\n        @media (max-width: 700px) {\n            dropDownMenu .kha-section-title { margin-top: 13px; margin-bottom: 6px; font-size: 10px; }\n            dropDownMenu .kha-setting-row { min-height: 48px; padding: 8px 7px; border-bottom: 1px solid rgba(255,255,255,.06); font-size: 14px; }\n            dropDownMenu input[type=\"checkbox\"] { width: 24px; height: 24px; flex-basis: 24px; border-radius: 6px; }\n            dropDownMenu input[type=\"text\"], dropDownMenu input[type=\"number\"] { min-height: 42px; font-size: 14px; }\n            dropDownMenu input[type=\"range\"] { min-height: 36px; }\n            dropDownMenu .kha-control:not([type=\"checkbox\"]):not([type=\"text\"]):not([type=\"number\"]):not([type=\"range\"]) { padding: 8px 7px; }\n        }\n    </style>\n`;\n\nlet featuresList = [\n    { name: 'questionSpoof', type: 'checkbox', variable: 'features.questionSpoof', attributes: 'checked', labeled: true, label: 'Question Spoof' },\n    { name: 'videoSpoof', type: 'checkbox', variable: 'features.videoSpoof', attributes: 'checked', labeled: true, label: 'Video Spoof' },\n    { name: 'showAnswers', type: 'checkbox', variable: 'features.showAnswers', labeled: true, label: 'Answer Revealer' },\n    { name: 'autoAnswer', type: 'checkbox', variable: 'features.autoAnswer', dependent: 'autoAnswerDelay,nextRecomendation,repeatQuestion', labeled: true, label: 'Auto Answer' },\n    { name: 'repeatQuestion', className: 'repeatQuestion', type: 'checkbox', variable: 'features.repeatQuestion', attributes: 'style=\"display:none;\"', labeled: true, label: 'Repeat Question' },\n    { name: 'nextRecomendation', className: 'nextRecomendation', type: 'checkbox', variable: 'features.nextRecomendation', attributes: 'style=\"display:none;\"', labeled: true, label: 'Recomendations' },\n    { name: 'autoAnswerDelay', className: 'autoAnswerDelay', type: 'range', variable: 'features.autoAnswerDelay', attributes: 'style=\"display:none;\" min=\"1\" max=\"3\" value=\"1\"', labeled: false },\n    { name: 'minuteFarm', type: 'checkbox', variable: 'features.minuteFarmer', labeled: true, label: 'Minute Farmer' },\n    { name: 'customBanner', type: 'checkbox', variable: 'features.customBanner', labeled: true, label: 'Custom Banner' },\n    { name: 'rgbLogo', type: 'checkbox', variable: 'features.rgbLogo', labeled: true, label: 'RGB Logo' },\n    { name: 'darkMode', type: 'checkbox', variable: 'features.darkMode', attributes: 'checked', labeled: true, label: 'Dark Mode' },\n    { name: 'onekoJs', type: 'checkbox', variable: 'features.onekoJs', labeled: true, label: 'onekoJs' },\n    { name: 'Custom Username', type: 'nonInput' },\n    { name: 'customName', type: 'text', variable: 'featureConfigs.customUsername', attributes: 'autocomplete=\"off\"' },\n    { name: 'Custom pfp', type: 'nonInput' },\n    { name: 'customPfp', type: 'text', variable: 'featureConfigs.customPfp', attributes: 'autocomplete=\"off\"' }\n];\n\nfeaturesList.push({ name: `${user.username} - UID: ${user.UID}`, type: 'nonInput', attributes: 'style=\"font-size:10px; padding-left:5px; color:#87938c;\"' });\n\naddFeature(featuresList);\n\nhandleInput(['questionSpoof', 'videoSpoof', 'showAnswers', 'nextRecomendation', 'repeatQuestion', 'minuteFarm', 'customBanner', 'rgbLogo']);\nhandleInput(['customName', 'customPfp']);\nhandleInput('autoAnswer', checked => checked && !features.questionSpoof && (document.querySelector('[setting-data=\"features.questionSpoof\"]').checked = features.questionSpoof = true));\nhandleInput('autoAnswerDelay', value => value && (featureConfigs.autoAnswerDelay = 4 - value));\nhandleInput('darkMode', checked => {\n    if (!window.DarkReader) return;\n    checked ? (DarkReader.setFetchMethod(window.fetch), DarkReader.enable()) : DarkReader.disable();\n});\nhandleInput('onekoJs', checked => { onekoEl = document.getElementById('oneko'); if (onekoEl) { onekoEl.style.display = checked ? null : \"none\"; } });\n\nfunction setMenuOpen(open) {\n    dropdownMenu.style.display = open ? 'flex' : 'none';\n    watermark.setAttribute('aria-expanded', String(open));\n    watermark.style.transform = open ? 'scale(.96)' : 'scale(1)';\n    if (open && menuIsMobile) dropdownMenu.scrollTop = 0;\n}\n\nif (menuIsMobile) {\n    const toggleMenu = (event) => {\n        if (event) event.stopPropagation();\n        setMenuOpen(dropdownMenu.style.display !== 'flex');\n    };\n\n    // `click` is intentionally used here because mobile browsers synthesize it for taps,\n    // while keyboard activation remains available through the keydown handler below.\n    watermark.addEventListener('click', toggleMenu);\n    watermark.addEventListener('keydown', (event) => {\n        if (event.key === 'Enter' || event.key === ' ') {\n            event.preventDefault();\n            toggleMenu(event);\n        }\n    });\n    document.addEventListener('pointerdown', (event) => {\n        if (dropdownMenu.style.display === 'flex' && !dropdownMenu.contains(event.target) && !watermark.contains(event.target)) {\n            setMenuOpen(false);\n        }\n    }, true);\n} else {\n    watermark.addEventListener('mouseenter', () => { setMenuOpen(true); playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/3kd01iyj.wav'); });\n    watermark.addEventListener('mouseleave', e => { !watermark.contains(e.relatedTarget) && setMenuOpen(false); playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/rqizlm03.wav'); });\n\n    watermark.addEventListener('pointerdown', e => {\n        if (!dropdownMenu.contains(e.target)) {\n            isDragging = true;\n            offsetX = e.clientX - watermark.offsetLeft;\n            offsetY = e.clientY - watermark.offsetTop;\n            watermark.style.transform = 'scale(0.9)';\n            if (watermark.setPointerCapture) watermark.setPointerCapture(e.pointerId);\n        }\n    });\n    watermark.addEventListener('pointerup', () => { isDragging = false; watermark.style.transform = 'scale(1)'; });\n    document.addEventListener('pointermove', e => {\n        if (isDragging) {\n            let newX = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - watermark.offsetWidth));\n            let newY = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - watermark.offsetHeight));\n            Object.assign(watermark.style, { left: `${newX}px`, top: `${newY}px`, right: 'auto', bottom: 'auto' });\n            setMenuOpen(false);\n        }\n    });\n}\n",
    "visuals/statusPanel.js": "const statusIsMobile = device.mobile || window.matchMedia('(max-width: 700px)').matches || ('ontouchstart' in window && window.innerWidth <= 900);\n\nObject.assign(statsPanel.style, {\n    position: 'fixed',\n    bottom: statusIsMobile ? 'calc(76px + env(safe-area-inset-bottom))' : '20px',\n    left: statusIsMobile ? '12px' : '20px',\n    top: 'auto',\n    width: statusIsMobile ? 'calc(100% - 24px)' : '250px',\n    maxWidth: statusIsMobile ? 'calc(100% - 24px)' : '250px',\n    minHeight: statusIsMobile ? '34px' : '30px',\n    height: 'auto',\n    backgroundColor: statusIsMobile ? 'rgb(0,0,0,0.62)' : 'rgb(0,0,0,0.2)',\n    color: 'white',\n    fontSize: statusIsMobile ? '11px' : '13px',\n    fontFamily: 'Arial, sans-serif',\n    display: 'flex',\n    justifyContent: 'center',\n    alignItems: 'center',\n    cursor: statusIsMobile ? 'default' : 'grab',\n    borderRadius: statusIsMobile ? '9px' : '10px',\n    userSelect: 'none',\n    zIndex: '10000',\n    transition: 'transform 0.18s, background-color 0.18s',\n    backdropFilter: 'blur(7px)',\n    WebkitBackdropFilter: 'blur(7px)',\n    padding: statusIsMobile ? '8px 10px' : '0'\n});\n\nconst getPing = async () => {\n    if (window.disablePing) return ':( ';\n    try {\n        const t = performance.now();\n        await fetch('https://pt.khanacademy.org/', { method: 'HEAD' });\n        return Math.round(performance.now() - t);\n    } catch {\n        return 'Error';\n    }\n};\n\nlet lastFrameTime = performance.now(), frameCount = 0, fps = 0;\n(function calcFPS() {\n    if (++frameCount && performance.now() - lastFrameTime >= 1000) {\n        fps = Math.round(frameCount * 1000 / (performance.now() - lastFrameTime));\n        frameCount = 0;\n        lastFrameTime = performance.now();\n    }\n    requestAnimationFrame(calcFPS);\n})();\n\nconst getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });\nconst update = async () => statsPanel.innerHTML = `\n    <span style=\"color:#72ff72; font-weight:700;\">Blizkt</span>\n    <span style=\"margin:0 7px; color:#777;\">|</span><span>${fps}fps</span>\n    <span style=\"margin:0 7px; color:#777;\">|</span><span>${await getPing()}ms</span>\n    <span style=\"margin:0 7px; color:#777;\">|</span><span>${getTime()}</span>\n`;\n\nupdate();\ndocument.body.appendChild(statsPanel);\nsetInterval(update, 1000);\n\nif (!statusIsMobile) {\n    let isDragging = false, offsetX = 0, offsetY = 0;\n    statsPanel.addEventListener('pointerdown', e => {\n        isDragging = true;\n        offsetX = e.clientX - statsPanel.offsetLeft;\n        offsetY = e.clientY - statsPanel.offsetTop;\n        statsPanel.style.transform = 'scale(0.97)';\n        if (statsPanel.setPointerCapture) statsPanel.setPointerCapture(e.pointerId);\n    });\n    statsPanel.addEventListener('pointerup', () => { isDragging = false; statsPanel.style.transform = 'scale(1)'; });\n    document.addEventListener('pointermove', e => {\n        if (!isDragging) return;\n        Object.assign(statsPanel.style, {\n            left: `${Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - statsPanel.offsetWidth))}px`,\n            top: `${Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - statsPanel.offsetHeight))}px`,\n            bottom: 'auto'\n        });\n    });\n}\n\nif (statusIsMobile) {\n    plppdo.on('domChanged', () => {\n        statsPanel.style.display = window.location.href.includes(\"khanacademy.org/profile\") ? 'flex' : 'none';\n    });\n}\n",
    "visuals/widgetBot.js": "const widgetIsMobile = device.mobile || window.matchMedia('(max-width: 900px)').matches || ('ontouchstart' in window && window.innerWidth <= 1100);\n\nif (!widgetIsMobile) {\n    const script = Object.assign(document.createElement('script'), {\n        src: 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3',\n        async: true,\n        onload: () => {\n            if (typeof Crate !== 'function') return;\n            const discEmbed = new Crate({\n                server: '1420566429266350280',\n                channel: '1425619443882528939',\n                location: ['bottom', 'right'],\n                notifications: true,\n                indicator: true,\n                allChannelNotifications: true,\n                defer: false,\n                color: '#000000'\n            });\n            plppdo.on('domChanged', () => {\n                window.location.href.includes('khanacademy.org/profile') ? discEmbed.show() : discEmbed.hide();\n            });\n        },\n        onerror: () => console.warn('[KHA Academy] Widget unavailable')\n    });\n    document.body.appendChild(script);\n}\n",
    "visuals/devTab.js": "plppdo.on('domChanged', () => {\n    if (document.getElementById('Tab')) return;\n\n    function createTab(name, href = '#') { \n        const li = document.createElement('li'); \n        li.innerHTML = `<a class=\"_8ry3zep\" href=\"${href}\" target=\"_blank\"><span class=\"_xy39ea8\">${name}</span></a>`; \n        return li; \n    }\n\n    const nav = document.querySelector('nav[data-testid=\"side-nav\"]'); \n    if (!nav) return;\n\n    const section = document.createElement('section');\n    section.id = 'Tab';\n    section.className = '_1ozlbq6';\n    section.innerHTML = '<h2 class=\"_18undph9\">Blizkt</h2>';\n\n    const ul = document.createElement('ul');\n    const devTab = createTab('Developer', '#');\n    \n    devTab.querySelector('a').addEventListener('click', (e) => {\n        e.preventDefault();\n        window.Win = window.open(\"\", \"_blank\");\n        if (window.Win) {\n            window.Win.document.write(`\n                <html>\n                <head>\n                    <title>Blizkt Dev</title>\n                    <style>\n                        body { \n                            font-family: Arial, sans-serif; \n                            display: flex; \n                            justify-content: center; \n                            align-items: center; \n                            height: 100vh; \n                            background: #121212; \n                            color: #fff; \n                            margin: 0; \n                        }\n                        .container { \n                            width: min(90vw, 600px); /* 90% da largura da tela ou 600px no máximo */\n                            height: min(90vh, 600px); /* 90% da altura da tela ou 600px no máximo */\n                            padding: 20px; \n                            border-radius: 10px; \n                            background: #1e1e1e; \n                            box-shadow: 0px 0px 15px rgba(0,0,0,0.5); \n                            display: flex; \n                            flex-direction: column; \n                            justify-content: space-between;\n                        }\n                        h2 {\n                            text-align: center;\n                            margin-bottom: 10px;\n                        }\n                        .toggle-container {\n                            flex: 1;\n                            overflow-y: auto;\n                            padding-right: 10px;\n                        }\n                        .toggle { \n                            display: flex; \n                            justify-content: space-between; \n                            align-items: center; \n                            padding: 10px; \n                            border-bottom: 1px solid #333; \n                        }\n                        .toggle strong { color: #fff; }\n                        .toggle small { color: #bbb; }\n                        .debug-box { \n                            width: 90%; /* Reduzido para não encostar nas bordas */\n                            height: 150px; \n                            overflow-y: auto; \n                            background: #000; \n                            color: #ccc; \n                            padding: 10px; \n                            font-family: monospace; \n                            white-space: pre-wrap; \n                            border-radius: 5px; \n                            border: 1px solid #333;\n                            margin: 10px auto; /* Centraliza horizontalmente */\n                        }\n                        input[type=\"checkbox\"] { \n                            transform: scale(1.2); \n                            cursor: pointer; \n                        }\n                    </style>\n                </head>\n                <body>\n                    <div class=\"container\">\n                        <h2>Blizkt Options</h2>\n                        <div class=\"toggle-container\" id=\"toggles\"></div>\n                        <div class=\"debug-box\" id=\"debugBox\"></div>\n                    </div>\n                    <script>\n                        document.head.appendChild(Object.assign(document.createElement('style'), {\n                            innerHTML: \"::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #1e1e1e; } ::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; } ::-webkit-scrollbar-thumb:hover { background: #666; }\"\n                        }));\n                    </script>\n                </body>\n                </html>\n            `);\n        }\n        createToggle('Debug Mode', 'Enables debugging logs', 'debugMode', window.debugMode || false);\n        createToggle('Disable Security', 'Enables Right click and Ctrl + Shift + I again', 'disableSecurity', window.disableSecurity || false);\n        createToggle('Disable Ping Request', 'Disables the request triggered every 1 second to find out the ping in ms', 'disablePing', window.disablePing || false);\n    });\n\n    ul.appendChild(devTab);\n    section.appendChild(ul);\n    nav.appendChild(section);\n});\n\nwindow.createToggle = function(name, desc, varName, toggled = false) {\n    if (!window.Win || window.Win.closed) return;\n\n    const toggleContainer = window.Win.document.getElementById('toggles');\n    if (!toggleContainer) return;\n\n    const toggleId = `toggle-${varName}`;\n\n    const toggleElement = document.createElement('div');\n    toggleElement.className = 'toggle';\n    toggleElement.innerHTML = `\n        <div>\n            <strong>${name}</strong><br>\n            <small>${desc}</small>\n        </div>\n        <input type=\"checkbox\" id=\"${toggleId}\" ${toggled ? \"checked\" : \"\"}>\n    `;\n\n    toggleElement.querySelector('input').addEventListener('change', (e) => {\n        window[varName] = e.target.checked;\n        debug(`❕${name} set to ${window[varName]}`);\n    });\n\n    toggleContainer.appendChild(toggleElement);\n};\nwindow.debug = function(message) {\n    if (!window.Win || window.Win.closed || !window.debugMode) return;\n    \n    const debugBox = window.Win.document.getElementById('debugBox');\n    if (debugBox) {\n        debugBox.innerHTML += message + '\\n';\n        debugBox.scrollTop = debugBox.scrollHeight;\n    }\n};\nwindow.onerror = function(message, source, lineno, colno, error) { debug(`🚨 Error @ ${source}:${lineno},${colno} \\n${error ? error.stack : message}`); return true; };\n",
    "functions/questionSpoof.js": "const phrases = [\n    \"Conteúdo da questão carregado.\",\n    \"Pratique esta habilidade no seu ritmo.\",\n    \"Resolva a atividade para continuar.\",\n    \"Revise o conceito e tente novamente.\"\n];\n\nasync function transformQuestionResponse(input, init, next) {\n    const originalResponse = await next(input, init);\n    if (!features.questionSpoof || !originalResponse?.clone) return originalResponse;\n\n    try {\n        const responseObj = JSON.parse(await originalResponse.clone().text());\n        const item = responseObj?.data?.assessmentItem?.item;\n        if (!item?.itemData) return originalResponse;\n\n        const itemData = JSON.parse(item.itemData);\n        const content = itemData?.question?.content;\n        if (!Array.isArray(content) || typeof content[0] !== 'string') return originalResponse;\n        if (content[0] !== content[0].toUpperCase()) return originalResponse;\n\n        itemData.answerArea = { calculator: false, chi2Table: false, periodicTable: false, tTable: false, zTable: false };\n        itemData.question.content = phrases[Math.floor(Math.random() * phrases.length)] + '[[☃ radio 1]]';\n        itemData.question.widgets = {\n            'radio 1': {\n                type: 'radio',\n                options: { choices: [\n                    { content: 'Resposta correta.', correct: true },\n                    { content: 'Resposta incorreta.', correct: false }\n                ] }\n            }\n        };\n        item.itemData = JSON.stringify(itemData);\n        const headers = new Headers(originalResponse.headers);\n        headers.set('content-type', 'application/json');\n        return new Response(JSON.stringify(responseObj), {\n            status: originalResponse.status,\n            statusText: originalResponse.statusText,\n            headers\n        });\n    } catch (error) {\n        debug('Error @ questionSpoof.js: ' + error.message);\n        return originalResponse;\n    }\n}\n\nif (window.khaFetch) window.khaFetch.register('questionSpoof', transformQuestionResponse);\n",
    "functions/videoSpoof.js": "async function updateVideoProgress(input, init, next) {\n    if (!features.videoSpoof) return next(input, init);\n    const body = await window.khaFetch.readRequestBody(input, init);\n    if (!body || !body.includes('\"operationName\":\"updateUserVideoProgress\"')) return next(input, init);\n\n    try {\n        const bodyObj = JSON.parse(body);\n        const videoInput = bodyObj?.variables?.input;\n        const durationSeconds = Number(videoInput?.durationSeconds);\n        if (!videoInput || !Number.isFinite(durationSeconds)) return next(input, init);\n        videoInput.secondsWatched = durationSeconds;\n        videoInput.lastSecondWatched = durationSeconds;\n        const [nextInput, nextInit] = window.khaFetch.replaceRequestBody(input, init, JSON.stringify(bodyObj));\n        sendToast('Vídeo atualizado.', 1000);\n        return next(nextInput, nextInit);\n    } catch (error) {\n        debug('Error @ videoSpoof.js: ' + error.message);\n        return next(input, init);\n    }\n}\n\nif (window.khaFetch) window.khaFetch.register('videoSpoof', updateVideoProgress);",
    "functions/minuteFarm.js": "async function filterMinuteFarm(input, init, next) {\n    if (!features.minuteFarmer) return next(input, init);\n    const body = await window.khaFetch.readRequestBody(input, init);\n    const url = window.khaFetch.readRequestUrl(input);\n    if (body && url.includes('mark_conversions') && body.includes('termination_event')) {\n        sendToast('Limitador de tempo bloqueado.', 1000);\n        return new Response('', { status: 204 });\n    }\n    return next(input, init);\n}\n\nif (window.khaFetch) window.khaFetch.register('minuteFarm', filterMinuteFarm);",
    "functions/spoofUser.js": "function updateProfileVisuals() {\n    if (!/\\/profile(?:\\/|$)/i.test(window.location.pathname)) return;\n    const pfpElement = document.querySelector('.avatar-pic, [data-testid=\"avatar\"], [data-test-id=\"avatar\"], img[alt*=\"avatar\" i]');\n    const nicknameElement = document.querySelector('.user-deets.editable h2, [data-testid=\"profile-name\"], [data-test-id=\"profile-name\"], main h1');\n    const desiredUsername = featureConfigs.customUsername || (user.nickname !== 'Nickname' ? user.nickname : '');\n    if (nicknameElement && desiredUsername && nicknameElement.textContent !== desiredUsername) nicknameElement.textContent = desiredUsername;\n    if (featureConfigs.customPfp && pfpElement && pfpElement.src !== featureConfigs.customPfp) {\n        Object.assign(pfpElement, { src: featureConfigs.customPfp, alt: 'Profile avatar' });\n        pfpElement.style.borderRadius = '50%';\n    }\n}\n\nplppdo.on('domChanged', updateProfileVisuals);\nupdateProfileVisuals();",
    "functions/answerRevealer.js": "const originalParse = JSON.parse;\n\nfunction markAnswerData(body) {\n    if (!features.showAnswers) return body;\n    const item = body?.data?.assessmentItem?.item;\n    if (!item?.itemData) return body;\n\n    const itemData = JSON.parse(item.itemData);\n    const content = itemData?.question?.content;\n    const widgets = itemData?.question?.widgets;\n    if (!Array.isArray(content) || typeof content[0] !== 'string' || !widgets) return body;\n    if (content[0] !== content[0].toUpperCase()) return body;\n\n    let changed = false;\n    Object.values(widgets).forEach(widget => {\n        const choices = widget?.options?.choices;\n        if (!Array.isArray(choices)) return;\n        choices.forEach(choice => {\n            if (choice?.correct && typeof choice.content === 'string' && !choice.content.startsWith('✅ ')) {\n                choice.content = '✅ ' + choice.content;\n                changed = true;\n            }\n        });\n    });\n    if (changed) item.itemData = JSON.stringify(itemData);\n    return body;\n}\n\nJSON.parse = function safeKhaParse(input, reviver) {\n    const body = originalParse(input, reviver);\n    try {\n        return markAnswerData(body);\n    } catch (error) {\n        debug('Error @ answerRevealer.js: ' + error.message);\n        return body;\n    }\n};",
    "functions/rgbLogo.js": "const rgbStyle = document.createElement('style');\nrgbStyle.className = 'RGBLogo';\nrgbStyle.textContent = `\n    @keyframes colorShift {\n        0% { fill: rgb(255, 0, 0); }\n        33% { fill: rgb(0, 255, 0); }\n        66% { fill: rgb(0, 0, 255); }\n        100% { fill: rgb(255, 0, 0); }\n    }\n`;\n\nfunction findKhanLogoPath() {\n    const logo = document.querySelector('svg._1rt6g9t, svg[aria-label*=\"Khan\" i], svg[aria-label*=\"Academy\" i], header svg');\n    return logo?.querySelector('path:nth-last-of-type(2), path:last-of-type') || null;\n}\n\nfunction updateRgbLogo() {\n    const khanLogo = findKhanLogoPath();\n    if (!features.rgbLogo) {\n        if (khanLogo) khanLogo.style.animation = '';\n        return;\n    }\n    if (!khanLogo) return;\n    if (!document.querySelector('style.RGBLogo')) document.head.appendChild(rgbStyle);\n    khanLogo.removeAttribute('data-darkreader-inline-fill');\n    khanLogo.style.animation = 'colorShift 5s infinite';\n}\n\nplppdo.on('domChanged', updateRgbLogo);\nupdateRgbLogo();",
    "functions/customBanner.js": "const phrases = [\n    '[Atualização] Continue de onde parou.',\n    '[Missão] Mais uma habilidade concluída.',\n    '[Progresso] Prática consistente gera mastery.',\n    '[Foco] Resolva a próxima atividade.'\n];\n\nfunction findBannerHeading() {\n    return document.querySelector('.stp-animated-banner h2, [data-testid*=\"banner\" i] h2, [data-testid*=\"mission\" i] h2, [data-test-id*=\"banner\" i] h2');\n}\n\nsetInterval(() => {\n    const greeting = findBannerHeading();\n    if (greeting && features.customBanner) greeting.textContent = phrases[Math.floor(Math.random() * phrases.length)];\n}, 3000);\n",
    "functions/autoAnswer.js": "const baseSelectors = [\n    '[data-testid=\"choice-icon__library-choice-icon\"]',\n    '[data-testid=\"exercise-check-answer\"]',\n    '[data-testid=\"exercise-check-button\"]',\n    '[data-test-id=\"exercise-check-button\"]',\n    '[data-testid*=\"exercise\"][data-testid*=\"check\"]',\n    '[data-testid=\"exercise-next-question\"]',\n    '[data-test-id=\"exercise-next-question\"]',\n    '[data-testid*=\"exercise\"][data-testid*=\"next\"]',\n    'button[aria-label*=\"check\" i]',\n    'button[aria-label*=\"verificar\" i]',\n    'button[aria-label*=\"next\" i]',\n    'button[aria-label*=\"próxima\" i]',\n    '._1udzurba',\n    '._awve9b'\n];\n\nwindow.khanwareDominates = true;\n\n(async () => {\n    while (window.khanwareDominates) {\n        if (features.autoAnswer && features.questionSpoof) {\n            const selectorsToCheck = [...baseSelectors];\n            if (features.nextRecomendation) selectorsToCheck.push('._hxicrxf');\n            if (features.repeatQuestion) selectorsToCheck.push('._ypgawqo');\n\n            for (const selector of selectorsToCheck) {\n                const element = document.querySelector(selector);\n                if (!element) continue;\n                element.click();\n                const label = element.querySelector(':scope > div')?.innerText?.trim() || element.innerText?.trim() || '';\n                if (['Mostrar resumo', 'Show summary', 'Ver resumo'].includes(label)) {\n                    sendToast('Exercício concluído!', 3000);\n                    playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav');\n                }\n            }\n        }\n        await delay(Math.max(300, Number(featureConfigs.autoAnswerDelay || 3) * 800));\n    }\n})();\n"
};
const nativeFetch = window.fetch.bind(window);
const fetchMiddlewares = [];
window.khaFetch = {
    register(name, middleware) {
        if (!name || typeof middleware !== 'function' || fetchMiddlewares.some(item => item.name === name)) return;
        fetchMiddlewares.push({ name, middleware });
    },
    readRequestBody,
    readRequestUrl,
    replaceRequestBody
};
window.fetch = function khaFetch(input, init) {
    let index = fetchMiddlewares.length - 1;
    const dispatch = (nextInput, nextInit) => {
        const entry = fetchMiddlewares[index--];
        return entry ? entry.middleware(nextInput, nextInit, dispatch) : nativeFetch(nextInput, nextInit);
    };
    return dispatch(input, init);
}

async function showSplashScreen() { splashScreen.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background-color:#000;display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 0.5s ease;user-select:none;color:white;font-family:MuseoSans,sans-serif;font-size:30px;text-align:center;"; splashScreen.innerHTML = '<span style="color:white;">Blizkt</span><span style="color:#72ff72;">.SPACE</span>'; document.body.appendChild(splashScreen); setTimeout(() => splashScreen.style.opacity = '1', 10);};
async function hideSplashScreen() { splashScreen.style.opacity = '0'; setTimeout(() => splashScreen.remove(), 1000); };

async function loadScript(url, label) {
    try {
        const bundleKey = url.startsWith(repoPath) ? url.slice(repoPath.length) : '';
        let script = bundleKey ? bundledModules[bundleKey] : null;
        if (!script) {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error('HTTP ' + response.status + ' while loading ' + label);
            script = await response.text();
        }
        if (!script.trim()) throw new Error('Empty script for ' + label);
        loadedPlugins.push(label);
        eval(script);
        return true;
    } catch (error) {
        console.warn('[KHA Academy] Could not load ' + label, error);
        debug('Error loading ' + label + ': ' + error.message);
        return false;
    }
}

async function loadCss(url, label = url) {
    return new Promise(resolve => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.onload = () => resolve(true);
        link.onerror = () => { console.warn('[KHA Academy] Could not load CSS ' + label); resolve(false); };
        document.head.appendChild(link);
    });
}

/* Nova Funcionalidade: Clique para Responder */
document.addEventListener('pointerdown', (e) => {
    // Evita disparar se o clique for no painel ou botões do script
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest('dropDownMenu') || target?.closest('statsPanel') || target?.closest('watermark') || target?.id === 'antiprof-btn') return;

    // Procura pela resposta correta injetada pelo answerRevealer
    // O Khan Academy usa botões ou áreas clicáveis para as opções.
    // Esta lógica assume que o script original 'answerRevealer.js' marca ou identifica as respostas.
    // Como não temos o código interno do answerRevealer, vamos tentar clicar no elemento que contém a resposta correta
    // ou simular o clique na opção certa se houver uma classe específica.
    
    const correctOption = document.querySelector('.correct-answer, [data-test-id="correct-answer"]'); // Exemplo de seletores comuns
    if (correctOption) {
        correctOption.click();
        // Clica no botão de verificar/próximo automaticamente após selecionar
        setTimeout(() => {
            const nextBtn = document.querySelector('button[data-test-id="exercise-check-button"], button[data-test-id="exercise-next-question"]');
            if (nextBtn) nextBtn.click();
        }, 100);
    }
});

/* Nova Funcionalidade: Botão AntiProf */
function createAntiProfButton() {
    if (document.getElementById('antiprof-btn')) return;
    const btn = document.createElement('button');
    const compactViewport = device.mobile || window.matchMedia('(max-width: 700px)').matches || ('ontouchstart' in window && window.innerWidth <= 900);
    btn.id = 'antiprof-btn';
    btn.innerText = compactViewport ? '×' : 'AntiProf';
    btn.setAttribute('aria-label', 'Remover o painel Blizkt');
    btn.style.cssText = compactViewport
        ? "position:fixed;bottom:calc(14px + env(safe-area-inset-bottom));left:14px;z-index:10000;width:44px;height:44px;padding:0;background:#ff4444;color:white;border:none;border-radius:50%;cursor:pointer;font-family:sans-serif;font-size:24px;font-weight:bold;line-height:1;box-shadow:0 2px 12px rgba(0,0,0,0.35);touch-action:manipulation;"
        : "position:fixed;bottom:20px;right:20px;z-index:10000;padding:10px 20px;background:#ff4444;color:white;border:none;border-radius:5px;cursor:pointer;font-family:sans-serif;font-weight:bold;box-shadow:0 2px 5px rgba(0,0,0,0.3);";
    
    btn.onclick = () => {
        // Remove todos os elementos criados pelo script
        const elementsToRemove = ['dropDownMenu', 'watermark', 'statsPanel', 'splashScreen', 'unloader', 'style'];
        elementsToRemove.forEach(tag => {
            document.querySelectorAll(tag).forEach(el => el.remove());
        });
        
        // Remove o próprio botão
        btn.remove();
        
        // Limpa o console para não deixar rastros
        console.clear();
        
        // Reinicia a página
        location.reload();
    };
    
    document.body.appendChild(btn);
}

/* Visual Functions */
async function setupMenu() {
    if (document.querySelector('watermark') || document.querySelector('dropDownMenu')) return;
    await loadScript(repoPath + 'visuals/mainMenu.js', 'mainMenu');
    await loadScript(repoPath + 'visuals/statusPanel.js', 'statusPanel');
    if (!device.mobile) await loadScript(repoPath + 'visuals/widgetBot.js', 'widgetBot');
    if (isDev) await loadScript(repoPath + 'visuals/devTab.js', 'devTab');
    createAntiProfButton();
}

/* Main Functions */ 
async function setupMain() {
    const modules = [
        ['functions/autoAnswer.js', 'autoAnswer'],
        ['functions/questionSpoof.js', 'questionSpoof'],
        ['functions/videoSpoof.js', 'videoSpoof'],
        ['functions/minuteFarm.js', 'minuteFarm'],
        ['functions/spoofUser.js', 'spoofUser'],
        ['functions/answerRevealer.js', 'answerRevealer'],
        ['functions/rgbLogo.js', 'rgbLogo'],
        ['functions/customBanner.js', 'customBanner']
    ];
    for (const [path, label] of modules) await loadScript(repoPath + path, label);
}

/* Inject */
if (!/^https?:\/\/([a-z0-9-]+\.)?khanacademy\.org/.test(window.location.href)) { alert("❌ Blizkt Failed to Injected!\n\nVocê precisa executar o Blizkt no site do Khan Academy! (https://pt.khanacademy.org/)"); window.location.href = "https://pt.khanacademy.org/"; }

async function loadCurrentUser() {
    const query = {
        operationName: 'getFullUserProfile',
        query: 'query getFullUserProfile { user { id username nickname } }'
    };
    try {
        const response = await fetch(new URL('/api/internal/graphql/getFullUserProfile', window.location.origin), {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(query)
        });
        if (!response.ok) throw new Error("profile HTTP " + response.status);
        const data = await response.json();
        const profile = data?.data?.user;
        if (profile) {
            user = {
                nickname: profile.nickname || profile.username || 'Khan learner',
                username: profile.username || 'Username',
                UID: profile.id ? String(profile.id).slice(-5) : 0
            };
            return true;
        }
    } catch (error) {
        console.warn('[KHA Academy] Profile unavailable; using local fallback.', error);
    }
    return false;
}

async function bootKhaAcademy() {
    if (!document.body) await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    await showSplashScreen();
    const toastLoaded = await loadScript('https://cdn.jsdelivr.net/npm/toastify-js', 'toastifyPlugin');
    await loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css', 'toastifyCss');

    // Optional helpers must not block the main menu on a failed CDN or client challenge.
    loadScript('https://raw.githubusercontent.com/adryd325/oneko.js/refs/heads/main/oneko.js', 'onekoJs').then(() => {
        const oneko = document.getElementById('oneko');
        if (oneko) {
            oneko.style.backgroundImage = "url('https://raw.githubusercontent.com/adryd325/oneko.js/main/oneko.gif')";
            oneko.style.display = 'none';
        }
    });
    loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js', 'darkReaderPlugin').then(() => {
        if (window.DarkReader) {
            DarkReader.setFetchMethod(window.fetch);
            DarkReader.enable();
        }
    });

    await loadCurrentUser();
    await setupMenu();
    await setupMain();

    if (toastLoaded) sendToast('😘 KHA Academy 2026 carregado.');
    await delay(350);
    sendToast("⭐ Bem-vindo(a): " + user.nickname);
    loadedPlugins.forEach(plugin => sendToast("🚀 " + plugin + " carregado", 1800, 'top'));
    await hideSplashScreen();
}

bootKhaAcademy().catch(error => {
    console.error('[KHA Academy] Bootstrap failed:', error);
    sendToast('⚠️ O painel não conseguiu carregar todos os módulos. Recarregue a página e tente novamente.', 5000, 'top');
    hideSplashScreen();
});

}
