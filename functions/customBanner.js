const phrases = [
    '[Atualização] Continue de onde parou.',
    '[Missão] Mais uma habilidade concluída.',
    '[Progresso] Prática consistente gera mastery.',
    '[Foco] Resolva a próxima atividade.'
];

function findBannerHeading() {
    return document.querySelector('.stp-animated-banner h2, [data-testid*="banner" i] h2, [data-testid*="mission" i] h2, [data-test-id*="banner" i] h2');
}

setInterval(() => {
    const greeting = findBannerHeading();
    if (greeting && features.customBanner) greeting.textContent = phrases[Math.floor(Math.random() * phrases.length)];
}, 3000);
