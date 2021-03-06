'use strict';

var activeTabId = null;

chrome.tabs.onUpdated.addListener(function(updatedTabId, changeInfo, tab) {
	if (tab.active && changeInfo.status == "complete") {
		activeTabId = updatedTabId;
		chrome.pageAction.show(updatedTabId);
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	activeTabId = activeInfo.tabId;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.name === 'loadPricesPage') {
		chrome.tabs.create({
			active: true,
			url: 'prices.html',
			index: sender.tab.index + 1
		}, tab => {
			
			chrome.tabs.onUpdated.addListener(function(updatedTabId, changeInfo) {
				if (changeInfo.status == "complete" && updatedTabId == tab.id) {
					var tabWindow = chrome.extension.getViews({
						tabId: tab.id,
						type: "tab"
					})[0];
					
					var pricesList = message.pricesList;
					var productName = message.productName;
					
					var html = `
						<p style="font: 25px monospace; white-space: pre;">${productName}</p>
						<p style="font: 15px monospace; white-space: pre;">${pricesList.join('<br/>')}</p>`;
					
					tabWindow.document.getElementsByClassName('content')[0].innerHTML = html;
					tabWindow.document.title = 'Prices for: ' + productName;
				}
			});
			
		});
	}
	
	if (message === 'getTabId') {
		sendResponse({
			activeTabId: activeTabId
		});
	}
});
