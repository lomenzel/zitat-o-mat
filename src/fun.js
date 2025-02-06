
// Initialize Gun
const gun = Gun({
    peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        // 'https://menzel.lol/gun'
    ]
});
const stats = gun.get('werWillWas/citationStats');

let data = [];

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
    let possibilities = shuffle(remove(data.map(e => e.party), chosen.party)).filter(onlyUnique)
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

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

async function initData() {
    data = await fetch("./data.json").then(res => res.json())
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
