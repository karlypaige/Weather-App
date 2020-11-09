var apiKey="595a35fe210a614c524dd39d31768f5a";
var loc="San Diego";
var queryURL;
var uviValue;
var tHigh=[];
var tLow=[];
var temps=[];
var icons=[];
var dates=[];
var humidity=[];
var storedValues=[];
var countFive = 0;
var cw = $("#current-weather");

function callStoredCities(){
    if(localStorage.getItem("cities")) {
        storedValues=JSON.parse(localStorage.getItem("cities"));
        
        $("#cities").empty();

        //populate already stored cities to teh cities column
        for (var i=0; i<storedValues.length; i++){
            $("#cities").append("<p class=\"card cities\">" + storedValues[i] + "</p>");
        }
    }
}

callStoredCities();

$(".cities").on("click", function(){
    //get value
    console.log($(this).text());
    loc=$(this).text();
    queryURL="https://api.openweathermap.org/data/2.5/weather?q=" + loc + "&appid=" + apiKey;
    weatherCall(queryURL);
})

//collect the user input
$("#search").on("click", function(){
    loc=$("#inputCity").val();
    queryURL="https://api.openweathermap.org/data/2.5/weather?q=" + loc + "&appid=" + apiKey;
        
    //check string for duplicate value
    for (var i=0; i<storedValues.length; i++){
        if(loc===storedValues[i]){
            
        }
    }
        
    storedValues[storedValues.length]=loc;
    console.log(storedValues);
    //put entry into local storage
    localStorage.setItem("cities", JSON.stringify(storedValues));

    // for (var i=0; i<storedValues.length; i++){
    //     $("#cities").append("<p class=\"card\">" + storedValues[i] + "</p>");
    // }
    callStoredCities();
    weatherCall(queryURL);
});

//function to convert Kelvin to Farenheit
function KtoF(K){
    return (K - 273.15)* 1.8000+ 32.00;
}

function weatherCall(qURL) {
    //time variable capturing today
    var now = dayjs();
    
//ajax calls url for openweathermap
$.ajax({
    url: qURL,
    method: "GET"
  }).then(function(response) {
    let queryUVI="https://api.openweathermap.org/data/2.5/uvi?lat=" + response["coord"]["lat"] + "&lon=" + response["coord"]["lon"] + "&appid=" + apiKey;
    
    var icon=response["weather"][0]["icon"];
    var currentIcon="http://openweathermap.org/img/wn/" + icon + ".png"
    
    //getting the UVI and appending current weather to div
    $.ajax({
        url: queryUVI,
        method: "GET"
      }).then(function(UVI) {
        uviValue=UVI["value"];

        //CityName + Icon + Date of current weather
        cw.html("<h2>" + response["name"] + "(" + now.$M + "/" + now.$D + "/" + now.$y + ")<img src=" + currentIcon + ">" + "</h2>");
        //temperature
        cw.append("<br>").append("Temp: " + KtoF(response["main"]["temp"]).toFixed(2) );
        //humidity
        cw.append("<br>").append("Humidity: " + response["main"]["humidity"]); 
        //windspeed
        cw.append("<br>").append("Wind speed: " + response["wind"]["speed"]);
        //UV index
        cw.append("<br>").append("UVI: " + uviValue);
      });
    
    $.ajax({
        url:"https://api.openweathermap.org/data/2.5/forecast?q=" + loc + "&appid=" + apiKey,
        method: "GET"
    }).then(function(forecast) {
        //get high and low temp for the day
        //loop through 5day @ 3hour forecast
        for (var i=0; i<forecast["list"].length; i++){
        //There are 8 temps reported each day - loop through every 8 values and collect highest and lowest
            // 0: 1 2 3 4 5 6 7 8  
            // 1: 1 2 3 4 5 6 7 8 
            // 2: 1 2 3 4 5 6 7 8 
            // 3: 1 2 3 4 5 6 7 8 
            // 4: 1 2 3 4 5 6 7 8 
            
            countFive=Math.floor(i/8);

            if(i%8===0){
                tHigh[countFive] = forecast["list"][i]["main"]["temp"];
                tLow[countFive] = forecast["list"][i]["main"]["temp"];
            } else {
                if (tHigh[countFive]<forecast["list"][i]["main"]["temp"]) {
                    tHigh[countFive] = forecast["list"][i]["main"]["temp"];
                }
                if (tLow[countFive]>forecast["list"][i]["main"]["temp"]) {
                    tLow[countFive] = forecast["list"][i]["main"]["temp"];
                };
            };
        };
        
        var forecastURL="https://api.openweathermap.org/data/2.5/onecall?lat=" + response["coord"]["lat"] + "&lon=" + response["coord"]["lon"] + "&appid=" + apiKey;
        
        $.ajax({
            url: forecastURL,
            method: "GET"
        }).then(function(forecast) {
            
            for (var i=0; i<5; i++){
                //grab dates in an array
                temps[i]=forecast["daily"][i]["temp"]["day"];
                //grab icons in an array
                icons[i]=forecast["daily"][i]["weather"][0]["icon"];
                //grab temps in an array
                //dates[i]=forecast["daily"][i];
                //grab humidity in an array
                humidity[i]=forecast["daily"][i]["humidity"];
            }

            //clear the forecast
            $("#forecast").empty();

            for (var i=0; i<tHigh.length; i++){

                //url for icons
                let icon = "https://openweathermap.org/img/wn/" + icons[i] + ".png";
                // console.log("THIS IS WEATHER ICON: " + icon);

                //date
                let useDate= now.add(i+1, 'day').$M + "/" + now.add(i+1, 'day').$D + "/" + now.add(i+1, 'day').$y + "</br>";
                //temp + icon
                let useTemp="Daily temp: " + KtoF(temps[0]).toFixed(2) + "<img src=" + icon + "></br>";
                //high/low temp
                let useHighLow="High: " + KtoF(tLow[i]).toFixed(2) + "</br>Low: " + KtoF(tHigh[i]).toFixed(2) + "</br>";
                //humisity
                let useHumid="Humidity: " + humidity[i];

                //diplay the 5 daya forecast
                $("#forecast").append("<panel class=\"col-lg-2 col-md-12 card\">" +useDate+  useTemp + useHighLow + useHumid + "</panel>");

            };

        });

    });

});

};
