async function filterMinuteFarm(input, init, next) {
    if (!features.minuteFarmer) return next(input, init);
    const body = await window.khaFetch.readRequestBody(input, init);
    const url = window.khaFetch.readRequestUrl(input);
    if (body && url.includes('mark_conversions') && body.includes('termination_event')) {
        sendToast('Limitador de tempo bloqueado.', 1000);
        return new Response('', { status: 204 });
    }
    return next(input, init);
}

if (window.khaFetch) window.khaFetch.register('minuteFarm', filterMinuteFarm);