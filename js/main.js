// --- REDIRECT PER UTENTI MOBILE ---
(function() {
    // Espressione regolare per rilevare i dispositivi mobili più comuni
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Se rileva un mobile, reindirizza alla pagina mobile.html
        window.location.href = "mobile.html";
    }
})();


// --- CODICE PER LA VERSIONE DESKTOP ---
document.addEventListener('DOMContentLoaded', function() {
    // Riferimenti agli elementi principali
    const loaderContent = document.querySelector('.loader-content');
    const terminal = document.getElementById('terminal');
    const inputField = document.getElementById('input');
    const outputDiv = document.getElementById('output');
    const promptSpan = document.getElementById('prompt');
    const terminalTitle = document.getElementById('terminal-window-title');

    // --- LOGICA PER SIMULARE LA CHIUSURA DEL TERMINALE ---
    const closeButton = document.querySelector('.terminal-button.close');
    if (closeButton && terminal) {
        closeButton.addEventListener('click', function() {
            terminal.style.display = 'none';
            const exitMessage = document.createElement('p');
            exitMessage.style.color = '#0F0';
            exitMessage.style.textAlign = 'center';
            exitMessage.style.marginTop = '40px';
            exitMessage.textContent = '[Sessione terminata]';
            document.body.appendChild(exitMessage);
        });
    }

    //Loading screen
    const loaderLines = [
        `<pre>
        /////////////////////////////////////////////////
        //                                             //
        //      K  E  K  K  O  T  E  C  H  .  I  T     //
        //                                             //
        /////////////////////////////////////////////////
</pre>`,
        '<p>Avvio di KekkOS in corso...</p>',
        '<p>Inizializzazione sessione...</p>',
        '<p>Connessione da: <span id="ip-address">ricerca...</span></p>',
        '<p>Data e ora: <span id="date-time">ricerca...</span></p>',
        '<p>Ultimo accesso: <span id="last-visit">mai</span></p>',
        '<br>',
        '<p>Caricamento completato.</p>'
    ];

    let lineIndex = 0;

    //function loading screen
    function typeLoader() {
        if (lineIndex < loaderLines.length) {
            loaderContent.innerHTML += loaderLines[lineIndex];

            // Aggiorna dinamicamente il contenuto
            if (loaderLines[lineIndex].includes('ip-address')) {
                fetch('https://api.ipify.org?format=json')
                    .then(response => response.json())
                    .then(data => {
                        const promptIdentifier = `${data.ip}@kekkotech.it`;
                        document.getElementById('ip-address').textContent = data.ip;
                        if (promptSpan) promptSpan.textContent = `${promptIdentifier}:~$`;
                        if (terminalTitle) terminalTitle.textContent = 'KekkOS';
                        document.title = 'kekkotech';
                    }).catch(() => {
                        const promptIdentifier = 'guest@kekkotech.it';
                        document.getElementById('ip-address').textContent = 'non disponibile';
                        if (promptSpan) promptSpan.textContent = `${promptIdentifier}:~$`;
                        if (terminalTitle) terminalTitle.textContent = 'KekkOS';
                        document.title = 'kekkotech';
                    });
            }
            if (loaderLines[lineIndex].includes('date-time')) {
                const now = new Date();
                document.getElementById('date-time').textContent = now.toLocaleString('it-IT');
            }
            if (loaderLines[lineIndex].includes('last-visit')) {
                const lastVisit = localStorage.getItem('kekkotech_last_visit');
                document.getElementById('last-visit').textContent = lastVisit || 'mai';
                localStorage.setItem('kekkotech_last_visit', new Date().toLocaleString('it-IT'));
            }

            lineIndex++;
            setTimeout(typeLoader, 400);
        } else {
            setTimeout(showTerminal, 1000);
        }
    }

    function showTerminal() {
        const loader = document.getElementById('loader');
        loader.style.display = 'none';
        terminal.style.display = 'flex';
        inputField.focus();
        printToTerminal('Benvenuto su kekkotech.it!');
        printToTerminal('Digita "help" per la lista dei comandi.');

        // --- Comando tramite URL ---
        const urlParams = new URLSearchParams(window.location.search);
        const commandFromUrl = urlParams.get('cmd');
        if (commandFromUrl) {
            printToTerminal(`${promptSpan.textContent} ${commandFromUrl}`);
            handleCommand(commandFromUrl);
        }
    }

    // --- Logica del Terminale ---
    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const command = inputField.value.trim().toLowerCase();
            if (command) {
                printToTerminal(`${promptSpan.textContent} ${command}`);
                handleCommand(command);
            }
            inputField.value = '';
        }
    });

    function handleCommand(command) {
        switch (command) {
            case 'help':
                printToTerminal('Comandi disponibili:');
                printToTerminal('- <span class="cmd">help</span>: Mostra questa lista di comandi.');
                printToTerminal('- <span class="cmd">aboutme</span>: Informazioni su di me.');
                printToTerminal('- <span class="cmd">projects</span>: I miei progetti principali.');
                printToTerminal('- <span class="cmd">contacts</span>: Come contattarmi.');
                printToTerminal('- <span class="cmd">status</span>: Verifica lo stato dei servizi online');
                printToTerminal('- <span class="cmd">cls</span>: Pulisce la schermata.');
                break;
            case 'aboutme':
                printToTerminal('To be filled');
                break;

            case 'projects':
                printToTerminal('Caricamento progetti da resources.services.kekkotech.com...');
                fetch('https://resources.services.kekkotech.com/downloads.kekkotech.com/project-list.js')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Errore HTTP: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(text => {
                        // Eseguiamo il codice JS per avere accesso alla variabile projectList
                        const projectList = eval(text + '; projectList');

                        if (projectList && projectList.length > 0) {
                            printToTerminal('Progetti trovati:');
                            projectList.forEach(project => {
                                printToTerminal('----------------------------------------');
                                printToTerminal(`Nome: <span class="cmd">${project.name}</span> (v${project.version})`);
                                printToTerminal(`Descrizione: ${project.description}`);
                                printToTerminal(`Autori: ${project.authors}`);
                                // Aggiungi un link cliccabile se l'Link non è "404"
                                if (project.info && project.info !== '404') {
                                    printToTerminal(`Link: <a href="${project.info}" target="_blank">Clicca qui</a>`);
                                }
                            });
                            printToTerminal('----------------------------------------');
                        } else {
                            printToTerminal('Nessun progetto trovato.');
                        }
                    })
                    .catch(error => {
                        printToTerminal(`Errore nel caricamento della lista progetti: ${error.message}.`);
                        printToTerminal('Controlla la console per maggiori dettagli.');
                        console.error(error);
                    });
                break;

            case 'status':
                const sites = ["kekkotech.com", "kekkotech.it", "downloads.kekkotech.com", "resources.services.kekkotech.com"];
                printToTerminal("Verifica dello stato dei servizi in corso...");

                const fetchPromises = sites.map(site => {
                    const statusPromise = fetch(`https://${site}/js/status.json`)
                        .then(response => {
                            if (!response.ok) {
                                return { status: 'offline' };
                            }
                            return response.json();
                        })
                        .then(data => ({
                            status: data.status
                        }))
                        .catch(error => ({
                            status: 'offline'
                        }));

                    const motdPromise = fetch(`https://resources.services.kekkotech.com/${site}/motd.json`)
                        .then(response => {
                            if (!response.ok) {
                                return { motd: '404 no MOTD data.' };
                            }
                            return response.json();
                        })
                        .catch(error => ({
                            motd: 'Errore nel recupero del MOTD.'
                        }));

                    return Promise.all([statusPromise, motdPromise])
                        .then(([statusResult, motdResult]) => ({
                            site: site,
                            status: statusResult.status,
                            motd: motdResult.motd
                        }));
                });

                Promise.all(fetchPromises)
                    .then(results => {
                        results.forEach(result => {
                            const output = `- Stato di ${result.site}: ${result.status}. MOTD: ${result.motd}`;
                            printToTerminal(output);
                        });
                        printToTerminal("Verifica completata.");
                    })
                    .catch(error => {
                        printToTerminal(`Errore durante l'elaborazione di una delle richieste.`);
                        console.error(error);
                    });
                break;

            case 'contacts': {
                printToTerminal('Email: <a href="mailto:matteocheccacci@gmail.com">matteocheccacci@gmail.com</a>');
                printToTerminal('Instagram: <a href="https://instagram.com/matteo.checcacci">@matteo.checcacci</a>');
                break;
            }
            case 'cls':
                outputDiv.innerHTML = '';
                break;
            default:
                printToTerminal(`Comando non trovato: ${command}`);
        }
    }

    function printToTerminal(message) {
        const p = document.createElement('p');
        p.innerHTML = message;
        outputDiv.appendChild(p);
        terminal.scrollTop = terminal.scrollHeight;
    }

    // Avvia la sequenza di caricamento
    typeLoader();
});
