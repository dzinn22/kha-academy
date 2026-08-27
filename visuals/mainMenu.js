function addFeature(features) {
    const feature = document.createElement('feature');
    feature.className = 'kha-feature-group';

    features.forEach(attribute => {
        let element = attribute.type === 'nonInput' ? document.createElement('label') : document.createElement('input');
        if (attribute.type === 'nonInput') {
            element.innerHTML = attribute.name;
            element.classList.add('kha-section-title');
        } else {
            element.type = attribute.type;
            element.id = attribute.name;
            element.classList.add('kha-control');
        }

        if (attribute.attributes) {
            attribute.attributes.split(' ').map(attr => attr.split('=')).forEach(([key, value]) => {
                value = value ? value.replace(/"/g, '') : '';
                key === 'style' ? element.style.cssText = value : element.setAttribute(key, value);
            });
        }

        if (attribute.variable) element.setAttribute('setting-data', attribute.variable);
        if (attribute.dependent) element.setAttribute('dependent', attribute.dependent);
        if (attribute.className) element.classList.add(attribute.className);

        if (attribute.labeled) {
            const label = document.createElement('label');
            label.classList.add('kha-setting-row');
            if (attribute.className) label.classList.add(attribute.className);
            if (attribute.attributes) {
                attribute.attributes.split(' ').map(attr => attr.split('=')).forEach(([key, value]) => {
                    value = value ? value.replace(/"/g, '') : '';
                    key === 'style' ? label.style.cssText = value : label.setAttribute(key, value);
                });
            }
            label.innerHTML = `${element.outerHTML} ${attribute.label}`;
            feature.appendChild(label);
        } else {
            feature.appendChild(element);
        }
    });
    dropdownMenu.innerHTML += feature.outerHTML;
}

function handleInput(ids, callback = null) {
    (Array.isArray(ids) ? ids.map(id => document.getElementById(id)) : [document.getElementById(ids)])
    .forEach(element => {
        if (!element) return;
        const setting = element.getAttribute('setting-data'),
            dependent = element.getAttribute('dependent'),
            handleEvent = (e, value) => {
                setFeatureByPath(setting, value);
                if (callback) callback(value, e);
            };

        if (element.type === 'checkbox') {
            element.addEventListener('change', (e) => {
                playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/5os0bypi.wav');
                handleEvent(e, e.target.checked);
                if (dependent) dependent.split(',').forEach(dep =>
                    document.querySelectorAll(`.${dep}`).forEach(depEl =>
                        depEl.style.display = e.target.checked ? null : "none"));
            });
        } else {
            element.addEventListener('input', (e) => handleEvent(e, e.target.value));
        }
    });
}

const menuIsMobile = device.mobile || window.matchMedia('(max-width: 700px)').matches || ('ontouchstart' in window && window.innerWidth <= 900);

/* Watermark / mobile touch trigger */
Object.assign(watermark.style, {
    position: 'fixed',
    top: menuIsMobile ? 'auto' : '12px',
    bottom: menuIsMobile ? 'calc(14px + env(safe-area-inset-bottom))' : 'auto',
    left: menuIsMobile ? 'auto' : 'calc(100% - 165px)',
    right: menuIsMobile ? '14px' : 'auto',
    width: menuIsMobile ? '54px' : '150px',
    height: menuIsMobile ? '54px' : '30px',
    backgroundColor: menuIsMobile ? '#151c20' : 'RGB(0,0,0,0.5)',
    color: 'white',
    fontSize: menuIsMobile ? '0' : '15px',
    fontFamily: 'MuseoSans, sans-serif',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    padding: menuIsMobile ? '0' : '0 10px',
    border: menuIsMobile ? '1px solid rgba(114,255,114,.7)' : '0',
    borderRadius: menuIsMobile ? '50%' : '10px',
    zIndex: '10001',
    transition: 'transform 0.18s ease, background-color 0.18s ease',
    touchAction: menuIsMobile ? 'manipulation' : 'none',
    boxShadow: menuIsMobile ? '0 5px 22px rgba(0,0,0,.38), 0 0 0 4px rgba(114,255,114,.08)' : 'none'
});

watermark.innerHTML = menuIsMobile
    ? `<span class="kha-mobile-logo" aria-hidden="true">B</span><span class="kha-version">${ver}</span>`
    : `<span style="text-shadow: -1px 0.5px 0 #72ff72, -2px 0px 0 #2f672e;">Blizkt</span> <span style="color:gray; padding-left:2px; font-family: Arial, sans-serif; font-size:10px">${ver}</span>`;
watermark.setAttribute('role', 'button');
watermark.setAttribute('tabindex', '0');
watermark.setAttribute('aria-label', menuIsMobile ? 'Abrir painel Blizkt' : 'Painel Blizkt');
watermark.setAttribute('aria-expanded', 'false');
document.body.appendChild(watermark);

let isDragging = false, offsetX = 0, offsetY = 0;

/* Dropdown */
Object.assign(dropdownMenu.style, {
    position: menuIsMobile ? 'fixed' : 'absolute',
    top: menuIsMobile ? 'auto' : '100%',
    bottom: menuIsMobile ? 'calc(78px + env(safe-area-inset-bottom))' : 'auto',
    left: menuIsMobile ? '12px' : '0',
    right: menuIsMobile ? '12px' : 'auto',
    width: menuIsMobile ? 'auto' : '160px',
    maxHeight: menuIsMobile ? 'min(74vh, 560px)' : 'none',
    overflowY: menuIsMobile ? 'auto' : 'visible',
    backgroundColor: menuIsMobile ? 'rgba(16,23,27,.98)' : 'rgba(0,0,0,0.3)',
    border: menuIsMobile ? '1px solid rgba(114,255,114,.24)' : '0',
    borderRadius: menuIsMobile ? '16px' : '10px',
    color: 'white',
    fontSize: menuIsMobile ? '13px' : '13px',
    fontFamily: 'Monospace, sans-serif',
    display: 'none',
    flexDirection: 'column',
    zIndex: '10000',
    padding: menuIsMobile ? '12px' : '5px',
    cursor: 'default',
    userSelect: 'none',
    transition: 'opacity 0.18s ease, transform 0.18s ease',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: menuIsMobile ? '0 18px 50px rgba(0,0,0,.48)' : 'none'
});

dropdownMenu.innerHTML = `
    <style>
        dropDownMenu { box-sizing: border-box; }
        dropDownMenu .kha-feature-group { display: block; margin: 0; padding: 0; }
        dropDownMenu .kha-section-title { display: block; margin: 9px 5px 4px; color: #72ff72; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        dropDownMenu .kha-setting-row { display: flex; align-items: center; gap: 9px; min-height: 36px; border-radius: 7px; color: #ecf3ec; padding: 5px 6px; font-size: 12px; line-height: 1.25; transition: background-color .16s ease; }
        dropDownMenu .kha-setting-row:hover, dropDownMenu .kha-setting-row:focus-within { background: rgba(114,255,114,.10); }
        dropDownMenu input[type="checkbox"] { appearance: none; width: 19px; height: 19px; flex: 0 0 19px; margin: 0; border: 1px solid #77817b; border-radius: 5px; background-color: #28302e; cursor: pointer; }
        dropDownMenu input[type="checkbox"]:checked { border-color: #72ff72; background: #72ff72; box-shadow: inset 0 0 0 4px #263229; }
        dropDownMenu input[type="checkbox"]:focus-visible, dropDownMenu input[type="text"]:focus-visible, dropDownMenu input[type="range"]:focus-visible { outline: 2px solid #72ff72; outline-offset: 2px; }
        dropDownMenu input[type="text"], dropDownMenu input[type="number"] { width: 100%; min-width: 0; min-height: 32px; border: 1px solid #3c4844; border-radius: 6px; color: white; background: #1b2422; padding: 6px 8px; }
        dropDownMenu input[type="range"] { width: 100%; min-width: 96px; accent-color: #72ff72; cursor: pointer; }
        dropDownMenu .kha-control:not([type="checkbox"]):not([type="text"]):not([type="number"]):not([type="range"]) { display: block; }
        dropDownMenu::-webkit-scrollbar { width: 6px; }
        dropDownMenu::-webkit-scrollbar-thumb { border-radius: 6px; background: #4d5d55; }
        .kha-mobile-logo { display: grid; width: 33px; height: 33px; place-items: center; border: 2px solid #72ff72; border-radius: 11px; transform: rotate(-8deg); color: #72ff72; font-family: Arial, sans-serif; font-size: 20px; font-weight: 900; line-height: 1; }
        .kha-version { display: none; }
        @media (max-width: 700px) {
            dropDownMenu .kha-section-title { margin-top: 13px; margin-bottom: 6px; font-size: 10px; }
            dropDownMenu .kha-setting-row { min-height: 48px; padding: 8px 7px; border-bottom: 1px solid rgba(255,255,255,.06); font-size: 14px; }
            dropDownMenu input[type="checkbox"] { width: 24px; height: 24px; flex-basis: 24px; border-radius: 6px; }
            dropDownMenu input[type="text"], dropDownMenu input[type="number"] { min-height: 42px; font-size: 14px; }
            dropDownMenu input[type="range"] { min-height: 36px; }
            dropDownMenu .kha-control:not([type="checkbox"]):not([type="text"]):not([type="number"]):not([type="range"]) { padding: 8px 7px; }
        }
    </style>
`;

let featuresList = [
    { name: 'questionSpoof', type: 'checkbox', variable: 'features.questionSpoof', attributes: 'checked', labeled: true, label: 'Question Spoof' },
    { name: 'videoSpoof', type: 'checkbox', variable: 'features.videoSpoof', attributes: 'checked', labeled: true, label: 'Video Spoof' },
    { name: 'showAnswers', type: 'checkbox', variable: 'features.showAnswers', labeled: true, label: 'Answer Revealer' },
    { name: 'autoAnswer', type: 'checkbox', variable: 'features.autoAnswer', dependent: 'autoAnswerDelay,nextRecomendation,repeatQuestion', labeled: true, label: 'Auto Answer' },
    { name: 'repeatQuestion', className: 'repeatQuestion', type: 'checkbox', variable: 'features.repeatQuestion', attributes: 'style="display:none;"', labeled: true, label: 'Repeat Question' },
    { name: 'nextRecomendation', className: 'nextRecomendation', type: 'checkbox', variable: 'features.nextRecomendation', attributes: 'style="display:none;"', labeled: true, label: 'Recomendations' },
    { name: 'autoAnswerDelay', className: 'autoAnswerDelay', type: 'range', variable: 'features.autoAnswerDelay', attributes: 'style="display:none;" min="1" max="3" value="1"', labeled: false },
    { name: 'minuteFarm', type: 'checkbox', variable: 'features.minuteFarmer', labeled: true, label: 'Minute Farmer' },
    { name: 'customBanner', type: 'checkbox', variable: 'features.customBanner', labeled: true, label: 'Custom Banner' },
    { name: 'rgbLogo', type: 'checkbox', variable: 'features.rgbLogo', labeled: true, label: 'RGB Logo' },
    { name: 'darkMode', type: 'checkbox', variable: 'features.darkMode', attributes: 'checked', labeled: true, label: 'Dark Mode' },
    { name: 'onekoJs', type: 'checkbox', variable: 'features.onekoJs', labeled: true, label: 'onekoJs' },
    { name: 'Custom Username', type: 'nonInput' },
    { name: 'customName', type: 'text', variable: 'featureConfigs.customUsername', attributes: 'autocomplete="off"' },
    { name: 'Custom pfp', type: 'nonInput' },
    { name: 'customPfp', type: 'text', variable: 'featureConfigs.customPfp', attributes: 'autocomplete="off"' }
];

featuresList.push({ name: `${user.username} - UID: ${user.UID}`, type: 'nonInput', attributes: 'style="font-size:10px; padding-left:5px; color:#87938c;"' });

addFeature(featuresList);

handleInput(['questionSpoof', 'videoSpoof', 'showAnswers', 'nextRecomendation', 'repeatQuestion', 'minuteFarm', 'customBanner', 'rgbLogo']);
handleInput(['customName', 'customPfp']);
handleInput('autoAnswer', checked => checked && !features.questionSpoof && (document.querySelector('[setting-data="features.questionSpoof"]').checked = features.questionSpoof = true));
handleInput('autoAnswerDelay', value => value && (featureConfigs.autoAnswerDelay = 4 - value));
handleInput('darkMode', checked => {
    if (!window.DarkReader) return;
    checked ? (DarkReader.setFetchMethod(window.fetch), DarkReader.enable()) : DarkReader.disable();
});
handleInput('onekoJs', checked => { onekoEl = document.getElementById('oneko'); if (onekoEl) { onekoEl.style.display = checked ? null : "none"; } });

function setMenuOpen(open) {
    dropdownMenu.style.display = open ? 'flex' : 'none';
    watermark.setAttribute('aria-expanded', String(open));
    watermark.style.transform = open ? 'scale(.96)' : 'scale(1)';
    if (open && menuIsMobile) dropdownMenu.scrollTop = 0;
}

if (menuIsMobile) {
    const toggleMenu = (event) => {
        if (event) event.stopPropagation();
        setMenuOpen(dropdownMenu.style.display !== 'flex');
    };

    // `click` is intentionally used here because mobile browsers synthesize it for taps,
    // while keyboard activation remains available through the keydown handler below.
    watermark.addEventListener('click', toggleMenu);
    watermark.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleMenu(event);
        }
    });
    document.addEventListener('pointerdown', (event) => {
        if (dropdownMenu.style.display === 'flex' && !dropdownMenu.contains(event.target) && !watermark.contains(event.target)) {
            setMenuOpen(false);
        }
    }, true);
} else {
    watermark.addEventListener('mouseenter', () => { setMenuOpen(true); playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/3kd01iyj.wav'); });
    watermark.addEventListener('mouseleave', e => { !watermark.contains(e.relatedTarget) && setMenuOpen(false); playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/rqizlm03.wav'); });

    watermark.addEventListener('pointerdown', e => {
        if (!dropdownMenu.contains(e.target)) {
            isDragging = true;
            offsetX = e.clientX - watermark.offsetLeft;
            offsetY = e.clientY - watermark.offsetTop;
            watermark.style.transform = 'scale(0.9)';
            if (watermark.setPointerCapture) watermark.setPointerCapture(e.pointerId);
        }
    });
    watermark.addEventListener('pointerup', () => { isDragging = false; watermark.style.transform = 'scale(1)'; });
    document.addEventListener('pointermove', e => {
        if (isDragging) {
            let newX = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - watermark.offsetWidth));
            let newY = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - watermark.offsetHeight));
            Object.assign(watermark.style, { left: `${newX}px`, top: `${newY}px`, right: 'auto', bottom: 'auto' });
            setMenuOpen(false);
        }
    });
}
