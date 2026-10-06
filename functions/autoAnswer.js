const baseSelectors = [
    '[data-testid="choice-icon__library-choice-icon"]',
    '[data-testid="exercise-check-answer"]',
    '[data-testid="exercise-check-button"]',
    '[data-test-id="exercise-check-button"]',
    '[data-testid*="exercise"][data-testid*="check"]',
    '[data-testid="exercise-next-question"]',
    '[data-test-id="exercise-next-question"]',
    '[data-testid*="exercise"][data-testid*="next"]',
    'button[aria-label*="check" i]',
    'button[aria-label*="verificar" i]',
    'button[aria-label*="next" i]',
    'button[aria-label*="próxima" i]',
    '._1udzurba',
    '._awve9b'
];

window.khanwareDominates = true;

(async () => {
    while (window.khanwareDominates) {
        if (features.autoAnswer && features.questionSpoof) {
            const selectorsToCheck = [...baseSelectors];
            if (features.nextRecomendation) selectorsToCheck.push('._hxicrxf');
            if (features.repeatQuestion) selectorsToCheck.push('._ypgawqo');

            for (const selector of selectorsToCheck) {
                const element = document.querySelector(selector);
                if (!element) continue;
                element.click();
                const label = element.querySelector(':scope > div')?.innerText?.trim() || element.innerText?.trim() || '';
                if (['Mostrar resumo', 'Show summary', 'Ver resumo'].includes(label)) {
                    sendToast('Exercício concluído!', 3000);
                    playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav');
                }
            }
        }
        await delay(Math.max(300, Number(featureConfigs.autoAnswerDelay || 3) * 800));
    }
})();
