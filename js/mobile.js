document.addEventListener('DOMContentLoaded', function() {
    // Riferimenti agli elementi principali
    const loaderContent = document.querySelector('.loader-content');
    const terminal = document.getElementById('terminal');
    const outputDiv = document.getElementById('output');
    const terminalTitle = document.getElementById('terminal-window-title');
    const commandButtons = document.querySelectorAll('.mobile-command');

    // Variabile per conservare l'identificativo dell'utente (IP o guest)
    let userIdentifier = 'guest@kekkotech.com';

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

    const loaderLines = [
        `<pre>
        /////////////////////////////////////////////////
        //                                             //
        //      K  E  K  K  O  T  E  C  H  .  I  T     //
        //                                             //
        /////////////////////////////////////////////////
</pre>`,
        '<p>Avvio di KekkOS Mobile in corso...</p>',
        '<p>Inizializzazione sessione...</p>',
        '<p>Connessione da: <span id="ip-address">ricerca...</span></p>',
        '<p>Data e ora: <span id="date-time">ricerca...</span></p>',
        '<p>Ultimo accesso: <span id="last-visit">mai</span></p>',
        '<br>',
        '<p>Caricamento completato.</p>'
    ];
    let lineIndex = 0;

    function typeLoader() {
        if (lineIndex < loaderLines.length) {
            loaderContent.innerHTML += loaderLines[lineIndex];

            if (loaderLines[lineIndex].includes('ip-address')) {
                fetch('https://api.ipify.org?format=json')
                    .then(response => response.json())
                    .then(data => {
                        userIdentifier = `${data.ip}@kekkotech.com`; // Salva l'identificativo
                        document.getElementById('ip-address').textContent = data.ip;
                        document.title = 'KekkOS Mobile | kekkotech.com';
                        if (terminalTitle) terminalTitle.textContent = 'KekkOS Mobile';
                    })
                    .catch(() => {
                        userIdentifier = 'guest@kekkotech.com';
                        document.getElementById('ip-address').textContent = 'non disponibile';
                        document.title = 'KekkOS Mobile | kekkotech.com';
                        if (terminalTitle) terminalTitle.textContent = 'KekkOS Mobile';
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
        document.getElementById('loader-mobile').style.display = 'none';
        terminal.style.display = 'flex';
        printToTerminal('Benvenuto su kekkotech.com!')
    }

    commandButtons.forEach(button => {
        button.addEventListener('click', function() {
            const command = this.dataset.command;
            const promptText = `${userIdentifier}:~$`; // Usa l'identificativo salvato
            printToTerminal(`${promptText} ${command}`);
            handleCommand(command);
        });
    });

    function handleCommand(command) {
        switch (command) {
            case 'aboutme':
                printToTerminal('To be filled');
                break;

            case 'projects':
                printToTerminal('Caricamento progetti...');
                fetch('https://downloads.kekkotech.com/js/list.js')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Errore HTTP: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(text => {
                        const projectList = eval(text + '; projectList');

                        if (projectList && projectList.length > 0) {
                            printToTerminal('Progetti trovati:');
                            projectList.forEach(project => {
                                printToTerminal('---');
                                printToTerminal(`<b>${project.name}</b> (v${project.version})`);
                                printToTerminal(`${project.description}`);
                                if (project.info && project.info !== '404') {
                                    printToTerminal(`<a href="${project.info}" target="_blank">Maggiori info...</a>`);
                                }
                            });
                            printToTerminal('---');
                        } else {
                            printToTerminal('Nessun progetto trovato.');
                        }
                    })
                    .catch(error => {
                        printToTerminal(`Errore nel caricamento dei progetti.`);
                        console.error(error);
                    });
                break;

            case 'contacts': {
                printToTerminal('Email: <a href="mailto:matteocheccacci@gmail.com">matteocheccacci@gmail.com</a>');
                printToTerminal('Instagram: <a href="https://instagram.com/matteo.checcacci">@matteo.checcacci</a>');
                break;
            }
            case 'status':
                const sites = ["kekkotech.com", "downloads.kekkotech.com", "services.kekkotech.com"];
                printToTerminal("Verifica dello stato dei servizi in corso...");

                const fetchPromises = sites.map(site => {
                    return fetch(`https://${site}/js/status.json`)
                        .then(response => {
                            if (!response.ok) {
                                return { status: 'offline' };
                            }
                            return response.json();
                        })
                        .then(data => ({
                            site: site,
                            status: data.status
                        }))
                        .catch(error => {
                            return {
                                site: site,
                                status: 'offline'
                            };
                        });
                });

                Promise.all(fetchPromises)
                    .then(results => {
                        results.forEach(result => {
                            printToTerminal(`Stato di ${result.site}: ${result.status}`);
                        });
                        printToTerminal("Verifica completata.");
                    })
                    .catch(error => {
                        printToTerminal(`Errore durante l'elaborazione di una delle richieste.`);
                        console.error(error);
                    });
                break;
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
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    // Avvia la sequenza di caricamento
    typeLoader();
});