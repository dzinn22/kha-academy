const originalParse = JSON.parse;

function markAnswerData(body) {
    if (!features.showAnswers) return body;
    const item = body?.data?.assessmentItem?.item;
    if (!item?.itemData) return body;

    const itemData = JSON.parse(item.itemData);
    const content = itemData?.question?.content;
    const widgets = itemData?.question?.widgets;
    if (!Array.isArray(content) || typeof content[0] !== 'string' || !widgets) return body;
    if (content[0] !== content[0].toUpperCase()) return body;

    let changed = false;
    Object.values(widgets).forEach(widget => {
        const choices = widget?.options?.choices;
        if (!Array.isArray(choices)) return;
        choices.forEach(choice => {
            if (choice?.correct && typeof choice.content === 'string' && !choice.content.startsWith('✅ ')) {
                choice.content = '✅ ' + choice.content;
                changed = true;
            }
        });
    });
    if (changed) item.itemData = JSON.stringify(itemData);
    return body;
}

JSON.parse = function safeKhaParse(input, reviver) {
    const body = originalParse(input, reviver);
    try {
        return markAnswerData(body);
    } catch (error) {
        debug('Error @ answerRevealer.js: ' + error.message);
        return body;
    }
};