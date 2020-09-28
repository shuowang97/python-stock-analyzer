//API-KEY:Tiingo b46119b62502a8ecc7e70d99b7c265bd9fbfd39d
//https://sw-571-hw6.azurewebsites.net/
//news KEY: bbef8dd425204e818bbead05dd243053

const NEWS_KEY = "bbef8dd425204e818bbead05dd243053";
const Tiingo_KEY = "b46119b62502a8ecc7e70d99b7c265bd9fbfd39d";
const BASE_URL = "https://sw-571-hw6.azurewebsites.net/";

function clearForm() {
    document.getElementById("search-text").value = ""
    document.getElementsByClassName("tabs")[0].style.display = "none"
    document.getElementById("form1").style.display = "none"
    document.getElementById("form2").style.display = "none"
    document.getElementById("form3").style.display = "none"
    document.getElementById("form4").style.display = "none"
    document.getElementById("error-box").style.display = "none"
}

function clearWhenFail() {
    document.getElementsByClassName("tabs")[0].style.display = "none"
    document.getElementById("form1").style.display = "none"
    document.getElementById("form2").style.display = "none"
    document.getElementById("form3").style.display = "none"
    document.getElementById("form4").style.display = "none"
}

function secondSearch() {

    // console.log("this is second search")

    const stockSymbol = document.getElementById("search-text").value
    let requestUrl = "/news?symbol=" + stockSymbol + "&token=" + NEWS_KEY
    let xmlHttpRequest = new XMLHttpRequest()
    xmlHttpRequest.open('GET', requestUrl)
    xmlHttpRequest.send()

    xmlHttpRequest.onreadystatechange = function () {
        if (xmlHttpRequest.readyState==4 && xmlHttpRequest.status==200){
            let responseJSON = xmlHttpRequest.response
            let response = JSON.parse(responseJSON)
            let cnt = 0;
            let articles = response["articles"]
            let array = []
            for(let i = 0; i < articles.length; i++){
                if(allExist(articles[i])){
                    array[cnt++] = articles[i]
                    if(cnt == 5) break;
                }
            }
            for(let i = 0; i < array.length; i++){
                let dic = array[i]
                let title = dic["title"]
                let url = dic["url"]
                let urlToImage = dic["urlToImage"]
                let publishedAt = dic["publishedAt"]
                // publishedAt = publishedAt.format("MM-dd-yyyy")
                let id = "news" + (i+1) + "-text"
                let tr_id = "tr-news-" + (i+1)
                let parts = publishedAt.split("-")
                publishedAt = parts[1] + "/" + parts[2].substr(0,2) + "/" + parts[0]

                document.getElementById(tr_id).style.display = ""
                document.getElementById(id).innerHTML =
                    "<b>" + title + "</b><br>" +
                    "<span>Publish Date: " + publishedAt + "</span><br>" +
                    "<a href=" + url + " target=_blank>See Original</a>"
                let id_img = "news" + (i+1) + "-img"
                document.getElementById(id_img).src = urlToImage
            }

            if(cnt < 5) {
                for(let j = cnt + 1; j <= 5; j++){
                    //less than 5 news
                    let tr_id = "tr-news-" + j
                    document.getElementById(tr_id).style.display = "none"
                }
            }
        }
    }
}

function allExist(dic) {
    return dic["title"] != undefined && dic["url"] != undefined && dic["urlToImage"] != undefined &&
           dic["publishedAt"] != undefined
}

// cannot use async/await to achieve this, it's a standard version of promise
function middleStep(requestUrl) {
    const promise = new Promise((resolve, reject) => {
        let xmlHttpRequest = new XMLHttpRequest()
        xmlHttpRequest.open('GET', requestUrl)
        xmlHttpRequest.send()

        xmlHttpRequest.onload = () => {
            if(xmlHttpRequest.status == 200) {
                resolve(xmlHttpRequest.response)
            }else if(xmlHttpRequest.status >= 400) {
                reject(xmlHttpRequest.response)
            }
        }
    })
    return promise
}

function onHover() {

    event.preventDefault()

    const stockSymbol = document.getElementById("search-text").value
    let requestUrl = "/search?symbol=" + stockSymbol + "&token=" + Tiingo_KEY

    // can use async/await to replace here!
    // let response = await middleStep(url) using try&catch to replace .catch()

    middleStep(requestUrl).then((xmlHttpResponse) => {
        // console.log("middleStep successful")
        // let responseJSON = xmlHttpResponse.response
        let response = JSON.parse(xmlHttpResponse)
        document.getElementById("company-name").innerText = response["name"]
        document.getElementById("stock-symbol").innerText = response["ticker"]
        document.getElementById("exchange-code").innerText = response["exchangeCode"]
        document.getElementById("start-date").innerText = response["startDate"]
        document.getElementById("description").innerText = response["description"]
        document.getElementById("stock-symbol2").innerText = response["ticker"]
        document.getElementById("prev-price").innerText = parseFloat(response["prevClose"]).toFixed(2)
        document.getElementById("open-price").innerText = parseFloat(response["open"]).toFixed(2)
        document.getElementById("high-price").innerText = parseFloat(response["high"]).toFixed(2)
        document.getElementById("low-price").innerText = parseFloat(response["low"]).toFixed(2)
        document.getElementById("last-price").innerText = parseFloat(response["last"]).toFixed(2)
        document.getElementById("number-shares").innerText = response["volume"]

        let changeVal = (parseFloat(response["last"]) - parseFloat(response["prevClose"])).toFixed(2)
        let changePercent = ((changeVal / parseFloat(response["prevClose"])) * 100).toFixed(2)

        if(changeVal < 0){
            document.getElementById("change").innerHTML = changeVal + "&nbsp;&nbsp;" + "<img className=\"red-arrow\" src=\"./static/img/RedArrowDown.jpg\" alt=\"\" width=\"11\" height=\"10\">"
            document.getElementById("change-percent").innerHTML = changePercent + "%" + "&nbsp;&nbsp;" + "<img className=\"red-arrow\" src=\"./static/img/RedArrowDown.jpg\" alt=\"\" width=\"11\" height=\"10\">"
        }else{
            document.getElementById("change").innerHTML = changeVal + "&nbsp;&nbsp;" + "<img class=\"green-arrow\" src=\"./static/img/GreenArrowUp.jpg\" alt=\"\" width=\"11\" height=\"10\">"
            document.getElementById("change-percent").innerHTML = changePercent + "%" + "&nbsp;&nbsp;" + "<img class=\"green-arrow\" src=\"./static/img/GreenArrowUp.jpg\" alt=\"\" width=\"11\" height=\"10\">"
        }
        // show the panel
        document.getElementsByClassName("tabs")[0].style.display = ""
        document.getElementById("form1").style.display = ""
        document.getElementById("form2").style.display = "none"
        document.getElementById("form3").style.display = "none"
        document.getElementById("form4").style.display = "none"
        document.getElementById("tab01").checked = true

        // secondSearch()

    }).catch(() => {
        // console.log("middleStep failed")
        clearWhenFail()
        document.getElementById("error-box").style.display = ""
        return Promise.reject()
    }).then(() => {
        // continuous search
        secondSearch()
        // thirdSearch()
        return Promise.reject()
    }).catch(() => {
        // console.log("execution ends")
    })
}

async function thirdSearch() {
    // console.log("this is the third search ")

    const stockSymbol = document.getElementById("search-text").value
    let requestUrl = "/stockChart?symbol=" + stockSymbol + "&token=" + Tiingo_KEY

    let responseJSON = await middleStep(requestUrl)

    let response = JSON.parse(responseJSON)
    let array_price = []
    let array_volume = []
    for(var i = 0; i < response.length; i++){
        let dic = response[i]
        // 2020-03-30T16:00:00.000Z
        let dateStr = dic["date"]
        let dateObj = new Date(dateStr)
        // timestamp
        let date = dateObj.valueOf()

        let price = dic["close"]
        let volume = dic["volume"]
        storeInArray(date, price, array_price, i)
        storeInArray(date, volume, array_volume, i)
    }
    // console.log(array_volume)
    // console.log(array_price)
    let mydate = new Date()
    let month = mydate.getMonth() + 1
    if(month < 10) {
        month = "0" + month
    }
    let day = mydate.getDate()
    if(day < 10) {
        day = "0" + day
    }
    let today = mydate.getUTCFullYear() + "-" + month + "-" + day
    // console.log(today)


    // show panel
    createCarts(stockSymbol.toUpperCase(), today, array_price, array_volume)
    if(document.getElementById("tab03").checked) {
        document.getElementById("form3").style.display = ""
        document.getElementById("form1").style.display = "none"
        document.getElementById("form2").style.display = "none"
        document.getElementById("form4").style.display = "none"
    }
}

function storeInArray(xVal, yVal, array, i) {
    array[i] = [xVal, yVal]
}

function createCarts(symbol, date, data, volume) {
    // Highcharts.getJSON('https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/new-intraday.json', function (data) {

        // console.log("Highchart is creatingggggggggggggggggggggggg")

        // create the chart
        Highcharts.stockChart('form3', {

            title: {
                text: 'Stcok Price ' + symbol + " " + date
            },

            subtitle: {
                useHTML: true,
                text: '<a target="_blank" href="https://www.tiingo.com" >Source: Tiingo</a>'
            },

            xAxis: {
                type: 'datetime',
                tickInterval: 24 * 3600 * 1000,
                dateTimeLabelFormats: {
                    day: '%e.%b'
                },
            },

            yAxis: [
                {
                    title: {
                        text: 'Stock Price'
                    },
                    opposite: false,

                }, {
                    title: {
                        text: "Volume"
                    },
                    opposite: true,
                }],

            tooltip: {
                xDateFormat: '%A. %b %e. %Y'
            },

            rangeSelector: {
                buttons: [{
                    type: 'day',
                    count: 7,
                    text: '7d'
                }, {
                    type: 'day',
                    count: 15,
                    text: '15d'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }],
                selected: 4,
                inputEnabled: false
            },

            series: [{
                name: symbol,
                type: 'area',
                data: data,
                gapSize: 5,
                tooltip: {
                    valueDecimals: 2
                },
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                threshold: null
            }, {
                type: 'column',
                name: symbol + " Volume",
                data: volume,
                yAxis: 1,
                gapSize: 5,
                pointWidth: 2,
                threshold: null
            }]
        });
    // });
}



document.addEventListener('DOMContentLoaded', function () {

})





