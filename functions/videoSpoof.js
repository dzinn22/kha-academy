async function updateVideoProgress(input, init, next) {
    if (!features.videoSpoof) return next(input, init);
    const body = await window.khaFetch.readRequestBody(input, init);
    if (!body || !body.includes('"operationName":"updateUserVideoProgress"')) return next(input, init);

    try {
        const bodyObj = JSON.parse(body);
        const videoInput = bodyObj?.variables?.input;
        const durationSeconds = Number(videoInput?.durationSeconds);
        if (!videoInput || !Number.isFinite(durationSeconds)) return next(input, init);
        videoInput.secondsWatched = durationSeconds;
        videoInput.lastSecondWatched = durationSeconds;
        const [nextInput, nextInit] = window.khaFetch.replaceRequestBody(input, init, JSON.stringify(bodyObj));
        sendToast('Vídeo atualizado.', 1000);
        return next(nextInput, nextInit);
    } catch (error) {
        debug('Error @ videoSpoof.js: ' + error.message);
        return next(input, init);
    }
}

if (window.khaFetch) window.khaFetch.register('videoSpoof', updateVideoProgress);