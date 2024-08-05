document.addEventListener('DOMContentLoaded', function() {
    setupResultObserver();
    updateButtonStates();
    addButtonEffects();
    toggleRecordingState(false); // Initially disable the stop button
});

const resultElement = document.getElementById("result");
const languageSelect = document.getElementById("languageSelect");
let recognition;
let silenceTimer;

function startconverting() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        setuprecognition(recognition);
        recognition.lang = languageSelect.value;
        recognition.start();
        toggleRecordingState(true);
    }
}

function stopconverting() {
    if (recognition) {
        recognition.stop();
        toggleRecordingState(false);
    }
}
function setuprecognition(recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = function(event) {
        const { finaltranscript, interimtranscript } = processresult(event.results);
        resultElement.innerHTML = finaltranscript + interimtranscript;
        updateStats();
    };
    recognition.onspeechend = function() {
        silenceTimer = setTimeout(() => {
            recognition.stop();
        }, 2000); // Stop after 2 seconds of silence
    };
    recognition.onspeechstart = function() {
        clearTimeout(silenceTimer);
    };
}

function processresult(results) {
    let finaltranscript = '';
    let interimtranscript = '';
    for (let i = 0; i < results.length; i++) {
        let transcript = results[i][0].transcript;
        let confidence = results[i][0].confidence;
        transcript = transcript.replace("\n", "<br>");
        if (results[i].isFinal) {
            finaltranscript += `<span title="Confidence: ${(confidence * 100).toFixed(2)}%">${transcript}</span> `;
        } else {
            interimtranscript += transcript;
        }
    }
    return { finaltranscript, interimtranscript };
}

function updateStats() {
    const text = resultElement.innerText;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    document.getElementById("wordCount").innerText = `Words: ${words}`;
    document.getElementById("charCount").innerText = `Characters: ${chars}`;
}

function speakText() {
    const text = resultElement.innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageSelect.value;
    speechSynthesis.speak(utterance);
}

function copyToClipboard() {
    const text = resultElement.innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Text copied to clipboard!");
    });
}

function saveAsFile() {
    const text = resultElement.innerText.trim();
    if (text.length === 0) {
        alert("There's no text to download. Please convert some speech to text first.");
        return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transcript.txt";
    link.click();
}

function updateButtonStates() {
    const text = resultElement.innerText.trim();
    const downloadButton = document.querySelector('button[title="Save as File"]');
    const speakButton = document.querySelector('button[title="Text to Speech"]');
    const copyButton = document.querySelector('button[title="Copy to Clipboard"]');
    
    if (text.length === 0) {
        downloadButton.disabled = true;
        speakButton.disabled = true;
        copyButton.disabled = true;
    } else {
        downloadButton.disabled = false;
        speakButton.disabled = false;
        copyButton.disabled = false;
    }
}

function setupResultObserver() {
    const config = { childList: true, characterData: true, subtree: true };
    const observer = new MutationObserver(updateButtonStates);
    observer.observe(resultElement, config);
}

function clearText() {
    resultElement.innerHTML = '';
    updateStats();
    updateButtonStates();
}

languageSelect.addEventListener('change', () => {
    if (recognition) {
        recognition.stop();
        startconverting();
    }
});

function addButtonEffects() {
    const startButton = document.querySelector('button[data-action="start"]');
    const stopButton = document.querySelector('button[data-action="stop"]');

    startButton.addEventListener('mousedown', function() {
        this.classList.add('pressed');
    });

    startButton.addEventListener('mouseup', function() {
        this.classList.remove('pressed');
    });

    stopButton.addEventListener('mousedown', function() {
        this.classList.add('pressed');
    });

    stopButton.addEventListener('mouseup', function() {
        this.classList.remove('pressed');
    });
}

function toggleRecordingState(isRecording) {
    const startButton = document.querySelector('button[data-action="start"]');
    const stopButton = document.querySelector('button[data-action="stop"]');

    if (isRecording) {
        startButton.classList.add('recording');
        stopButton.disabled = false;
    } else {
        startButton.classList.remove('recording');
        stopButton.disabled = true;
    }
}
