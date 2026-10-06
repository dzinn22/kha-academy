const widgetIsMobile = device.mobile || window.matchMedia('(max-width: 900px)').matches || ('ontouchstart' in window && window.innerWidth <= 1100);

if (!widgetIsMobile) {
    const script = Object.assign(document.createElement('script'), {
        src: 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3',
        async: true,
        onload: () => {
            if (typeof Crate !== 'function') return;
            const discEmbed = new Crate({
                server: '1420566429266350280',
                channel: '1425619443882528939',
                location: ['bottom', 'right'],
                notifications: true,
                indicator: true,
                allChannelNotifications: true,
                defer: false,
                color: '#000000'
            });
            plppdo.on('domChanged', () => {
                window.location.href.includes('khanacademy.org/profile') ? discEmbed.show() : discEmbed.hide();
            });
        },
        onerror: () => console.warn('[KHA Academy] Widget unavailable')
    });
    document.body.appendChild(script);
}
