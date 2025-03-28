// Copyright (c) 2022 Double-oxygeN
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'voicevox:speech',
    title: 'VOICEVOX 読み上げ',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'voicevox:speech') {
    const { speakerId } = await chrome.storage.local.get('speakerId');

    chrome.tabs.sendMessage(tab.id, {
      action: "playText",
      text: info.selectionText,
      speakerId
    });
  }
});
