plppdo.on('domChanged', () => {
    if (document.getElementById('Tab')) return;

    function createTab(name, href = '#') { 
        const li = document.createElement('li'); 
        li.innerHTML = `<a class="_8ry3zep" href="${href}" target="_blank"><span class="_xy39ea8">${name}</span></a>`; 
        return li; 
    }

    const nav = document.querySelector('nav[data-testid="side-nav"]'); 
    if (!nav) return;

    const section = document.createElement('section');
    section.id = 'Tab';
    section.className = '_1ozlbq6';
    section.innerHTML = '<h2 class="_18undph9">Blizkt</h2>';

    const ul = document.createElement('ul');
    const devTab = createTab('Developer', '#');
    
    devTab.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        window.Win = window.open("", "_blank");
        if (window.Win) {
            window.Win.document.write(`
                <html>
                <head>
                    <title>Blizkt Dev</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                            background: #121212; 
                            color: #fff; 
                            margin: 0; 
                        }
                        .container { 
                            width: min(90vw, 600px); /* 90% da largura da tela ou 600px no máximo */
                            height: min(90vh, 600px); /* 90% da altura da tela ou 600px no máximo */
                            padding: 20px; 
                            border-radius: 10px; 
                            background: #1e1e1e; 
                            box-shadow: 0px 0px 15px rgba(0,0,0,0.5); 
                            display: flex; 
                            flex-direction: column; 
                            justify-content: space-between;
                        }
                        h2 {
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        .toggle-container {
                            flex: 1;
                            overflow-y: auto;
                            padding-right: 10px;
                        }
                        .toggle { 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: center; 
                            padding: 10px; 
                            border-bottom: 1px solid #333; 
                        }
                        .toggle strong { color: #fff; }
                        .toggle small { color: #bbb; }
                        .debug-box { 
                            width: 90%; /* Reduzido para não encostar nas bordas */
                            height: 150px; 
                            overflow-y: auto; 
                            background: #000; 
                            color: #ccc; 
                            padding: 10px; 
                            font-family: monospace; 
                            white-space: pre-wrap; 
                            border-radius: 5px; 
                            border: 1px solid #333;
                            margin: 10px auto; /* Centraliza horizontalmente */
                        }
                        input[type="checkbox"] { 
                            transform: scale(1.2); 
                            cursor: pointer; 
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Blizkt Options</h2>
                        <div class="toggle-container" id="toggles"></div>
                        <div class="debug-box" id="debugBox"></div>
                    </div>
                    <script>
                        document.head.appendChild(Object.assign(document.createElement('style'), {
                            innerHTML: "::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #1e1e1e; } ::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; } ::-webkit-scrollbar-thumb:hover { background: #666; }"
                        }));
                    </script>
                </body>
                </html>
            `);
        }
        createToggle('Debug Mode', 'Enables debugging logs', 'debugMode', window.debugMode || false);
        createToggle('Disable Security', 'Enables Right click and Ctrl + Shift + I again', 'disableSecurity', window.disableSecurity || false);
        createToggle('Disable Ping Request', 'Disables the request triggered every 1 second to find out the ping in ms', 'disablePing', window.disablePing || false);
    });

    ul.appendChild(devTab);
    section.appendChild(ul);
    nav.appendChild(section);
});

window.createToggle = function(name, desc, varName, toggled = false) {
    if (!window.Win || window.Win.closed) return;

    const toggleContainer = window.Win.document.getElementById('toggles');
    if (!toggleContainer) return;

    const toggleId = `toggle-${varName}`;

    const toggleElement = document.createElement('div');
    toggleElement.className = 'toggle';
    toggleElement.innerHTML = `
        <div>
            <strong>${name}</strong><br>
            <small>${desc}</small>
        </div>
        <input type="checkbox" id="${toggleId}" ${toggled ? "checked" : ""}>
    `;

    toggleElement.querySelector('input').addEventListener('change', (e) => {
        window[varName] = e.target.checked;
        debug(`❕${name} set to ${window[varName]}`);
    });

    toggleContainer.appendChild(toggleElement);
};
window.debug = function(message) {
    if (!window.Win || window.Win.closed || !window.debugMode) return;
    
    const debugBox = window.Win.document.getElementById('debugBox');
    if (debugBox) {
        debugBox.innerHTML += message + '\n';
        debugBox.scrollTop = debugBox.scrollHeight;
    }
};
window.onerror = function(message, source, lineno, colno, error) { debug(`🚨 Error @ ${source}:${lineno},${colno} \n${error ? error.stack : message}`); return true; };
