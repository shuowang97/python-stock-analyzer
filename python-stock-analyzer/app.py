from flask import Flask, request, jsonify
from datetime import *;
from dateutil.relativedelta import *
import requests
import json
app = Flask(__name__, static_folder="./static")

# re-deploy
# az webapp up


@app.route('/')
def index():
    return app.send_static_file("index.html")

@app.route('/search', methods=['GET'])
def search():
    # get the args
    stockSymbol = request.args.get('symbol')
    stockKEY = request.args.get('token')

    # tab1
    url = "https://api.tiingo.com/tiingo/daily/" + stockSymbol + "?token=" + stockKEY
    # print(url)
    response = requests.get(url)
    # print(response.content);
    bytesStr = response.content
    jsonStr = str(bytesStr,"utf - 8")
    # print("JSON String: " + jsonStr)


    # tab2
    url = "https://api.tiingo.com/iex/" + stockSymbol + "?token=" + stockKEY
    # print(url)
    response = requests.get(url)
    # print(response.content);
    bytesStr = response.content
    jsonStr2 = str(bytesStr,"utf - 8")
    # print("JSON String: " + jsonStr2)

    tab1_dic = json.loads(jsonStr)
    tab2_dic = json.loads(jsonStr2)
    # return jsonify(response.json())
    tabs_dic = {**tab1_dic, **tab2_dic[0]}
    return tabs_dic

@app.route('/stockChart', methods=['GET'])
def stockChart():
    # https://api.tiingo.com/iex/keyword/prices?startDate=prior_date&resampleFreq=12hour&columns=open,high,low,close,volume&token=API_KEY
    # https://api.tiingo.com/iex/aapl/prices?startDate=2020-03-04
    # &resampleFreq=12hour&columns=open,high,low,close,volume&token=0108ecd7f84bf97f8f1199
    # 8a4e4561ea51da92c8
    stockSymbol = request.args.get('symbol')
    stockKEY = request.args.get('token')

    TODAY = date.today()
    hour = datetime.now().hour
    extra = relativedelta(hour=0)
    if(TODAY.weekday() == 0 and hour < 16):
        extra = relativedelta(days=-3)
    if(TODAY.weekday() == 7):
        relativedelta(days=-2)
    if(TODAY.weekday() == 6):
        extra = relativedelta(days=-1)
    relative_6m = TODAY + relativedelta(months=-6) + extra

    # print(relative_6m)
    relative_6m = str(relative_6m)
    url = "https://api.tiingo.com/iex/" + stockSymbol + "/prices?startDate=" + relative_6m \
          + "&resampleFreq=12hour&columns=open,high,low,close,volume&token=" + stockKEY
    # print(url)
    response = requests.get(url)

    return response.content

@app.route('/news', methods=['GET'])
def news():
    #  https://newsapi.org/v2/everything?apiKey=API_KEY&q=keyword

    # get the args
    stockSymbol = request.args.get('symbol')
    newsKEY = request.args.get('token')

    url = "https://newsapi.org/v2/everything?apiKey=" + newsKEY + "&q=" + stockSymbol
    # print(url)
    response = requests.get(url)
    return response.content
