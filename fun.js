
// Initialize Gun
const gun = Gun({
    peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        // 'https://menzel.lol/gun'
    ]
});
const stats = gun.get('werWillWas/citationStats');


function shuffle(arr) {
    let array = JSON.parse(JSON.stringify(arr))
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhrase(data) {
    let party = shuffle(data)[0]
    return {
        phrase: pickRandom(party.phrases),
        party: party.party
    }
}

function safeBtoa(str) {
   return btoa(encodeURIComponent(str))
}

function remove(arr, elem) {
    return arr.filter(item => item !== elem);
}

async function getAnswers(data, chosen) {
    let possibilities = shuffle(remove(data.map(e => e.party), chosen.party))
    return shuffle([chosen.party, ...possibilities.slice(0, 3)])
}


async function neverShowAgain(phrase) {
    if (confirm("Möchten Sie diesen Satz wirklich für alle Benutzer ausschließen?")) {
        const hash = safeBtoa(phrase).replace(/=/g, '');
        stats.get('excludedPhrases').put({ [hash]: true });
        newQuestion();
    }
}

async function isAllowed(phrase) {
    const hash = safeBtoa(phrase).replace(/=/g, '');
    return new Promise(resolve => {
        stats.get('excludedPhrases').get(hash).once(data => {
            resolve(!data);
        });
    });
}

async function prettify(phrase) {
    const allowed = await isAllowed(phrase);
    if (!allowed) return null;

    const hash = safeBtoa(phrase).replace(/=/g, '');
    return new Promise(resolve => {
        stats.get('editedPhrases').get(hash).once(edited => {
            resolve({
                original: phrase,
                printVersion: edited?.text || phrase
            });
        });
    });
}

async function saveEdit(phrase, editedPhrase) {
    const hash = safeBtoa(phrase).replace(/=/g, '');
    stats.get('editedPhrases').put({ [hash]: { text: editedPhrase } });
}

async function toggleOriginal(phrase) {
    let p = await prettify(phrase)
    if (citation.textContent === p.original) {
        citation.textContent = p.printVersion
        showOriginal.textContent = "Original Anzeigen"

    } else {
        citation.textContent = p.original;
        showOriginal.textContent = "Bearbeitung Anzeigen"
    }
    if (p.original === p.printVersion)
        showOriginal.style.display = "none";
}

async function ask(phrase, answers, solution) {

    const pretty = await prettify(phrase);
    if (!pretty) {
        newQuestion();
        return;
    }

    citation.textContent = pretty.printVersion;

    if (pretty.printVersion !== pretty.original) {
        showOriginal.style.display = "inline";
        showOriginal.textContent = "Original Anzeigen"
        showOriginal.onclick = () => toggleOriginal(phrase)
    } else {
        showOriginal.style.display = "none";
    }

    // Helper function to create click handler
    const createHandler = (answer) => () => {
        addHistoryEntry(pretty.printVersion, answer, solution)


        // Load new question after answer
        newQuestion()
    };

    // Set content and handlers for all options
    [o1, o2, o3, o4].forEach((element, index) => {
        element.textContent = answers[index];
        element.onclick = createHandler(answers[index]);
    });
    neverShowAgainButton.onclick = () => neverShowAgain(phrase)


    // Control buttons
    editButton.onclick = () => {
        const edited = prompt("Zitat bearbeiten (Entfernen von Seitenzahlen, überschriften oder parteinamen; Änderungen sind für alle Nutzer sichtbar):", pretty.printVersion);
        if (edited !== null && edited.trim() !== "") {
            saveEdit(phrase, edited);
            citation.textContent = edited;
        }
    };

    // Add control buttons

}

function newQuestion() {
    console.log("Neue Frage kommt")
    let phrase = getRandomPhrase(data)
    getAnswers(data, phrase).then(result => {
        ask(phrase.phrase, result, phrase.party)
    })
}

async function extractPDFText(url) {
    try {
        // Fetch PDF
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        // Load PDF
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        // Extract text from all pages
        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + '\n';
        }

        return fullText;
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}

function splitText(text) {
    console.log(text)
    return text
        .split(/[•!?▪●✔]|\.\s+/).map(e => e.trim())
        .filter(e => e.length > 10)
}

async function fetchTextFile(url) {
    try {
        // Fetch the text file
        const response = await fetch(url);

        // Check if the request succeeded
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Extract text content
        const text = await response.text();
        return text;
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}

async function initData() {
    let processedCount = 0;

    // Single-file entries
    const singleFileParties = [
        { party: "AfD", file: './wahlprogramme/AfD.pdf' },
        { party: "Bayernpartei", file: './wahlprogramme/Bayernpartei.pdf' },
        { party: "BSW", file: './wahlprogramme/BSW.pdf' },
        { party: "Bündnis C", file: './wahlprogramme/Bündnis C.pdf' },
        { party: "Bündnis Deutschland", file: './wahlprogramme/Bündnis Deutschland.pdf' },
        { party: "BüSo", file: './wahlprogramme/BüSo.pdf' },
        { party: "CDU/CSU", file: './wahlprogramme/CDU CSU.pdf' },
        { party: "Die Basis", file: './wahlprogramme/Die Basis.pdf' },
        { party: "FDP", file: './wahlprogramme/FDP.pdf' },
        { party: "Freie Wähler", file: './wahlprogramme/Freie Wähler.txt', isTxt: true },
        { party: "Die Linke", file: './wahlprogramme/Linke.pdf' },
        { party: "Menschliche Welt", file: './wahlprogramme/Menschliche Welt.txt', isTxt: true },
        { party: "MERA25", file: './wahlprogramme/MERA25.pdf' },
        { party: "MLPD", file: './wahlprogramme/MLPD.pdf' },
        { party: "ÖDP", file: './wahlprogramme/ÖDP.pdf' },
        { party: "Die PARTEI", file: './wahlprogramme/PARTEI.txt', isTxt: true },
        { party: "PDF", file: './wahlprogramme/PDF.pdf' },
        { party: "PdH", file: './wahlprogramme/PdH.pdf' },
        { party: "Piratenpartei", file: './wahlprogramme/Piraten.txt', isTxt: true },
        { party: "SGP", file: './wahlprogramme/SGP.txt', isTxt: true },
        { party: "SPD", file: './wahlprogramme/SPD.pdf' },
        { party: "SSW", file: './wahlprogramme/SSW.pdf' },
        { party: "Team Todenhöfer", file: './wahlprogramme/Team Todenhöfer.pdf' },
        { party: "Tierschutzpartei", file: './wahlprogramme/Tierschutzpartei.pdf' },
        { party: "Verjüngungsforschung", file: './wahlprogramme/Verjüngungsforschung.txt', isTxt: true },
        { party: "Volt", file: './wahlprogramme/Volt.pdf' },
        { party: "Werteunion", file: './wahlprogramme/Werteunion.txt', isTxt: true }
    ];

    const totalFiles = singleFileParties.length + 1;
    citation.textContent = `Wahlprogramme werden Analysiert ${processedCount}/${totalFiles}`;

    for (const { party, file, isTxt } of singleFileParties) {
        // Create safe cache key (replace special characters)
        const cacheKey = `phrases_${party.replace(/[^a-zA-Z0-9]/g, '_')}`;
        let phrases;

        // Check cache first
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            phrases = JSON.parse(cachedData);
        } else {
            // Process file if no cache
            phrases = isTxt
                ? splitText(await fetchTextFile(file))
                : splitText(await extractPDFText(file));

            // Store in localStorage (with 24h expiration example)
            localStorage.setItem(cacheKey, JSON.stringify(phrases));
            localStorage.setItem(`${cacheKey}_timestamp`, Date.now());
        }

        data.push({ party, phrases });
        citation.textContent = `Wahlprogramme werden Analysiert ${++processedCount}/${totalFiles}`;
    }


    // Special case: Grüne (4 PDFs) with caching
    const gruneCacheKey = 'phrases_B_ndnis_90_Die_Gr_nen'; // Sanitized key
    let grunePhrases = JSON.parse(localStorage.getItem(gruneCacheKey)) || [];

    if (grunePhrases.length === 0) {
        // Only process if no cached version exists
        const gruneFiles = [
            './wahlprogramme/Grüne Präambel.pdf',
            './wahlprogramme/Grüne 1.pdf',
            './wahlprogramme/Grüne 2.pdf',
            './wahlprogramme/Grüne 3.pdf'
        ];

        for (const file of gruneFiles) {
            grunePhrases.push(...splitText(await extractPDFText(file)));
            citation.textContent = `Wahlprogramme werden Analysiert ${totalFiles}/${totalFiles}`;
        }

        // Store combined result
        localStorage.setItem(gruneCacheKey, JSON.stringify(grunePhrases));
        localStorage.setItem(`${gruneCacheKey}_timestamp`, Date.now());
    }

    data.push({ party: "Bündnis 90/Die Grünen", phrases: grunePhrases });
}

function addHistoryEntry(phrase, userAnswer, correctAnswer) {
    console.log("adding to history")
    const newRow = document.createElement('tr');
    newRow.className = userAnswer === correctAnswer ? 'correct' : 'incorrect';

    newRow.innerHTML = `
        <td>${phrase}</td>
        <td>${userAnswer}</td>
        <td>${correctAnswer}</td>
    `;

    // Add new entry at the top of the table
    if (hist.firstChild)
        hist.insertBefore(newRow, hist.firstChild)
    else
        hist.appendChild(newRow);

}

initData()
    .then(newQuestion)
    .catch(() => setTimeout(() => location.reload(), 1000))
