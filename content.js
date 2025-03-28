// content.js

let currentAudioContext = null;
let currentAudioSource = null;
let currentAudioGain = null;
let isPlaying = false;
let pendingTexts = [];

const stopCurrentPlayback = () => {
  if (currentAudioSource) {
    currentAudioSource.stop();
    currentAudioSource = null;
  }
  if (currentAudioContext) {
    currentAudioContext.close();
    currentAudioContext = null;
  }
  if (currentAudioGain) {
    currentAudioGain = null;
  }
  isPlaying = false;
  pendingTexts = [];
};

const requestSpeechFromText = async (text, speakerId) => {
  const voicevoxApiEndpoint = 'http://127.0.0.1:50021'
  const fetchSpeechAuxiliaryData = async (text, speakerId) => {
    const encodedTextAsUri = encodeURIComponent(text.trim())
    const audioInfo = await fetch(`${voicevoxApiEndpoint}/audio_query?text=${encodedTextAsUri}&speaker=${speakerId}`, {
      method: 'POST'
    })
    return await audioInfo.json()
  }

  const fetchSynthesizedAudioArrayBuffer = async (speakerId, aux) => {
    const synthesisHeaders = new Headers({
      'Accept': 'audio/wav',
      'Content-Type': 'application/json'
    })
    const synthesis = await fetch(`${voicevoxApiEndpoint}/synthesis?speaker=${speakerId}`, {
      method: 'POST',
      headers: synthesisHeaders,
      body: JSON.stringify(aux)
    })
    return await synthesis.arrayBuffer()
  }

  const speechAuxiliaryData = await fetchSpeechAuxiliaryData(text, speakerId)
  const synthesizedAudioArrayBuffer = await fetchSynthesizedAudioArrayBuffer(speakerId, speechAuxiliaryData)

  if (!currentAudioContext) {
    currentAudioContext = new AudioContext()
  }

  const audioData = await currentAudioContext.decodeAudioData(synthesizedAudioArrayBuffer)
  currentAudioSource = new AudioBufferSourceNode(currentAudioContext, {
    buffer: audioData
  })
  currentAudioGain = new GainNode(currentAudioContext, {
    gain: 1.0
  })

  currentAudioSource.connect(currentAudioGain)
  currentAudioGain.connect(currentAudioContext.destination)

  currentAudioSource.addEventListener('ended', () => {
    currentAudioSource = null;
    if (pendingTexts.length > 0) {
      const nextText = pendingTexts.shift();
      chrome.storage.local.get('speakerId', (result) => {
        requestSpeechFromText(nextText, result.speakerId);
      });
    } else {
      isPlaying = false;
      currentAudioContext.close();
      currentAudioContext = null;
      currentAudioGain = null;
    }
  })

  currentAudioSource.start()
  isPlaying = true;
}

let userHotkey = "";

chrome.storage.local.get(['hotkey'], (res) => {
  if (res.hotkey) {
    userHotkey = res.hotkey;
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.hotkey) {
    userHotkey = changes.hotkey.newValue;
  }
});

function parseHotkeyString(hotkeyStr) {
  const parts = hotkeyStr.toLowerCase().split("+");
  return {
    altKey: parts.includes("alt"),
    ctrlKey: parts.includes("ctrl"),
    shiftKey: parts.includes("shift"),
    key: parts[parts.length - 1]
  }
}

function hotkeyMatchesEvent(hotkeyStr, event) {
  const parsed = parseHotkeyString(hotkeyStr);
  if (parsed.altKey !== event.altKey) return false;
  if (parsed.ctrlKey !== event.ctrlKey) return false;
  if (parsed.shiftKey !== event.shiftKey) return false;
  return event.key.toLowerCase() === parsed.key;
}

document.addEventListener("keydown", (e) => {
  if (userHotkey && hotkeyMatchesEvent(userHotkey, e)) {
    e.preventDefault();
    const selection = window.getSelection().toString();
    if (isPlaying) {
      stopCurrentPlayback();
    } else {
      const sentences = selection.split(/[。！？\n\r\t]/).filter(s => s.trim());
      if (sentences.length > 0) {
        const firstSentence = sentences[0];
        pendingTexts = sentences.slice(1);
        chrome.storage.local.get('speakerId', (result) => {
          requestSpeechFromText(firstSentence, result.speakerId);
        });
      }
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "playText") {
    const { text, speakerId } = request;
    if (isPlaying) {
      stopCurrentPlayback();
    } else {
      const sentences = text.split(/[。！？\n\r\t]/).filter(s => s.trim());
      if (sentences.length > 0) {
        const firstSentence = sentences[0];
        pendingTexts = sentences.slice(1);
        requestSpeechFromText(firstSentence, speakerId);
      }
    }
  }
});

// set speakerId default to 1 if not set
chrome.storage.local.get('speakerId', (result) => {
  if (!result.speakerId) {
    chrome.storage.local.set({ speakerId: 1 });
  }
});

