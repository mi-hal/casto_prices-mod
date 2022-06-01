function getPricesNew() {
	const castoHost = 'https://www.castorama.pl';
	const checkAvail = 'cataloginventory/index/checkAvailabilityInStores';
	const getProductPrices = 'bold_all/data/getProductPriceStockByStore';
	
	const paramsDef = {
		psid: 'sku',
		quantity: 'qty',
		showAll: 'show_all_markets',
		isAsync: 'isAjax',
		store: 'store',
		type: 'typeBlock',
		stock: 'needStock'
	};
	
	function buildQuery(params) {
		let qstr = '';
		
		Object.keys(params).forEach(key => {
			qstr += paramsDef[key];
			qstr += '=';
			qstr += params[key];
			qstr += '&';
		});
		
		return qstr.slice(0, -1);
	};
	
	const getUrl = function (isForAvail, params) {
		return `${castoHost}/` +
			`${isForAvail ? checkAvail : getProductPrices}` +
			`${params ? '?' + buildQuery(params) : ''}`;
	}
	
	const getProductSku = function () {
		return jQuery("span.product-content-header__product-sku span")[0].innerText;
	}
	
	const getProductId = function () {
		return jQuery('[title=Drukowanie]')[0].href.split('/').slice(-2)[0];
	}
	
	const reqHeaderName = 'Content-Type'
	const reqHeaderVal = 'application/x-www-form-urlencoded; charset=UTF-8'
	
    var psid = getProductSku();
    var prodId = getProductId();
	const prodName = $('.product-main-data__name').html().trim();

    let list = [];
	
    const postData = buildQuery({
		quantity: 1,
		psid: psid,
		showAll: 'true'
	});

    const request = new Request(getUrl(true), {
        method: 'POST',
        headers: {
            [reqHeaderName]: reqHeaderVal
        },
        body: postData
    });

    fetch(request).then(function (res) {
        console.log(`STATUS: ${res.status}`);

        var jsonPromise = res.json();

        jsonPromise.then(function (val) {
            list = val.success;
            getPrices();
        }).catch(error => {
            console.log(`problem with request: ${error.message}`);
        });
    }).catch(error => {
        console.log(`problem with request: ${error.message}`);
    });

    var prices = [];

    function padStart (str) {
        if (str.length < 8) {
            var missings = new Array(8 - str.length);
            return missings.fill(' ').join('') + str;
        }
    }

    function getPrices() {			
        for (var i = 0; i < list.length; i++) {
            const j = i;
			
            const request = new Request(getUrl(false, {
				isAsync: 'true',
				store: list[i].store_code,
				type: 'default',
				stock: prodId
			}), {
                method: 'GET'
            });

            fetch(request).then(function (res) {
                const statusCode = res.status;
                const contentType = res.headers.get('content-type');

                if (statusCode !== 200) {
                    throw new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    throw new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
                }

                var jsonPromise = res.json();

                jsonPromise.then(function (val) {
                    var price = padStart(val.products[prodId].price.toString());

                    prices.push('<b>' + price + '</b> ' + list[j].nazwa + ' - ' + val.products[prodId].qty + ' sztuk');

                    if (j === list.length - 1) {
                        console.log('finish');
                        setTimeout(print, 1000);
                    }
                }).catch(error => {
                    console.log(`problem with GET request: ${error.message}`);
                });
            }).catch(error => {
                console.log(`problem with GET request: ${error.message}`);
            });
        }
    }

    function print() {
        var pricesOrdered = prices.sort();
		
		chrome.runtime.sendMessage({
			name: 'loadPricesPage',
			productName: prodName,				
			pricesList: pricesOrdered
		});
    }
}

getPricesNew();
