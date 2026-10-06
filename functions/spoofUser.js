function updateProfileVisuals() {
    if (!/\/profile(?:\/|$)/i.test(window.location.pathname)) return;
    const pfpElement = document.querySelector('.avatar-pic, [data-testid="avatar"], [data-test-id="avatar"], img[alt*="avatar" i]');
    const nicknameElement = document.querySelector('.user-deets.editable h2, [data-testid="profile-name"], [data-test-id="profile-name"], main h1');
    const desiredUsername = featureConfigs.customUsername || (user.nickname !== 'Nickname' ? user.nickname : '');
    if (nicknameElement && desiredUsername && nicknameElement.textContent !== desiredUsername) nicknameElement.textContent = desiredUsername;
    if (featureConfigs.customPfp && pfpElement && pfpElement.src !== featureConfigs.customPfp) {
        Object.assign(pfpElement, { src: featureConfigs.customPfp, alt: 'Profile avatar' });
        pfpElement.style.borderRadius = '50%';
    }
}

plppdo.on('domChanged', updateProfileVisuals);
updateProfileVisuals();