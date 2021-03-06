
const msg = document.getElementById('message');

chrome.runtime.sendMessage(null, 'getTabId', {}, res => {
	chrome.tabs.get(res.activeTabId, tab => {
		if (tab.url.indexOf('www.castorama.pl') === -1) {
			msg.innerHTML = 'Przejdź na <a target="_blank" href="https://www.castorama.pl">www.castorama.pl</a>';
		} else {
			
			chrome.tabs.executeScript(null, { file: "jquery-3.6.0.slim.js" }, function() {
				chrome.tabs.executeScript(null, { file: "testProductPage.js" }, function (result) {					
					if (result[0]) {
						msg.innerHTML = 'Proszę czekaj...';
						chrome.tabs.executeScript(null, { file: "checkPrices.js" });
					} else {
						msg.innerHTML = 'Przejdź na stronę produktu!';
					}
				});
			});
			
		}
	});
});

