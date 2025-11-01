// Copyright (c) 2022 Double-oxygeN
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


const hotkeyInput = document.getElementById("hotkeyInput");
const speakerMenu = document.getElementById("speakerMenu");
const speedInput = document.getElementById("speedInput");

chrome.storage.local.get(['hotkey'], (res) => {
  if (res.hotkey) {
    hotkeyInput.value = res.hotkey;
  }
});

const setupHotkeyInput = (inputElement, storageKey) => {
  inputElement.addEventListener("keydown", (e) => {
    e.preventDefault();

    const keys = [];
    if (e.ctrlKey) keys.push("Ctrl");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");

    const mainKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;

    if (mainKey === "Control" || mainKey === "Shift" || mainKey === "Alt" || mainKey === "Meta") {
      return;
    }

    keys.push(mainKey);

    const hotkeyStr = keys.join("+");
    inputElement.value = hotkeyStr;

    chrome.storage.local.set({ [storageKey]: hotkeyStr });
  });

  inputElement.addEventListener("change", (ev) => {
    chrome.storage.local.set({ [storageKey]: ev.target.value });
  });
};

setupHotkeyInput(hotkeyInput, 'hotkey');

fetch("http://127.0.0.1:50021/speakers")
  .then(response => response.json())
  .then(data => {
    for (const speaker of data) {
      const speakerGroup = document.createElement("optgroup")
      speakerGroup.label = speaker.name

      for (const style of speaker.styles) {
        const speakerStyleItem = document.createElement("option")
        speakerStyleItem.text = `${speaker.name}（${style.name}）`
        speakerStyleItem.value = style.id
        speakerGroup.appendChild(speakerStyleItem)
      }

      speakerMenu.appendChild(speakerGroup)
    }
  }).then(() => {
    chrome.storage.local.get(['speakerId'], (res) => {
      if (res.speakerId) {
        speakerMenu.value = res.speakerId;
      }
    });
    chrome.storage.local.get(['speed'], (res) => {
      if (res.speed) {
        speedInput.value = res.speed;
      }
    });
  })

speakerMenu.addEventListener("change", ev => {
  chrome.storage.local.set({
    'speakerId': ev.target.value
  })
})

speedInput.addEventListener("change", ev => {
  chrome.storage.local.set({
    'speed': ev.target.value
  })
})