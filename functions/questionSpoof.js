const phrases = [
    "Conteúdo da questão carregado.",
    "Pratique esta habilidade no seu ritmo.",
    "Resolva a atividade para continuar.",
    "Revise o conceito e tente novamente."
];

async function transformQuestionResponse(input, init, next) {
    const originalResponse = await next(input, init);
    if (!features.questionSpoof || !originalResponse?.clone) return originalResponse;

    try {
        const responseObj = JSON.parse(await originalResponse.clone().text());
        const item = responseObj?.data?.assessmentItem?.item;
        if (!item?.itemData) return originalResponse;

        const itemData = JSON.parse(item.itemData);
        const content = itemData?.question?.content;
        if (!Array.isArray(content) || typeof content[0] !== 'string') return originalResponse;
        if (content[0] !== content[0].toUpperCase()) return originalResponse;

        itemData.answerArea = { calculator: false, chi2Table: false, periodicTable: false, tTable: false, zTable: false };
        itemData.question.content = phrases[Math.floor(Math.random() * phrases.length)] + '[[☃ radio 1]]';
        itemData.question.widgets = {
            'radio 1': {
                type: 'radio',
                options: { choices: [
                    { content: 'Resposta correta.', correct: true },
                    { content: 'Resposta incorreta.', correct: false }
                ] }
            }
        };
        item.itemData = JSON.stringify(itemData);
        const headers = new Headers(originalResponse.headers);
        headers.set('content-type', 'application/json');
        return new Response(JSON.stringify(responseObj), {
            status: originalResponse.status,
            statusText: originalResponse.statusText,
            headers
        });
    } catch (error) {
        debug('Error @ questionSpoof.js: ' + error.message);
        return originalResponse;
    }
}

if (window.khaFetch) window.khaFetch.register('questionSpoof', transformQuestionResponse);
