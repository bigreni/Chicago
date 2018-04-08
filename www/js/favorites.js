function loadFavorites()
{
    $('#simplemenu').sidr();
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    var arrStops = null;
    var arrIds;
    var text = "";
    for (i = 0; i < arrFaves.length; i++) 
    {
        arrStops = arrFaves[i].split(":");
        arrIds = arrStops[0].split(">");
        text = '<li><button onclick=removeFavorite(' + i + '); style="background-color:red; border:none;float:right;">&#x2718;</button><a href="javascript:loadArrivals(' + arrIds[0] + ',' + arrIds[2] + ",'" + arrStops[1].trim() + "'"  +')"; class="langOption"><h4 class="selectLanguage">' + arrStops[1] + '</h4></a></li>';
	    $("#lstFaves").append(text);
    }
}



function removeFavorite(index)
{
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    if(arrFaves.length > 1)
    {
        arrFaves.splice(index, 1);
        var faves = arrFaves.join("|");
        localStorage.setItem("Favorites", faves);
    }
    else
    {
        localStorage.removeItem("Favorites");
    }
    location.reload();
}

function loadArrivals(route, stop, text) {
    var url = "http://www.ctabustracker.com/bustime/eta/getStopPredictionsETA.jsp?route=" + route + "&stop=" + stop;
	$.get(url, function(data) {  processXmlDocumentPredictions(data, text); });       
}

function processXmlDocumentPredictions(xml, text)
{
        var outputContainer = $('.js-next-bus-results');
		var stopTag = xml.getElementsByTagName("stop");
		var predsTag = stopTag[0].getElementsByTagName("pre");
        var results = '<p><strong>' + text +'</strong></p><table id="tblResults" cellpadding="0" cellspacing="0">'

		if(predsTag != null)
		{
		    results = results.concat('<tr class="header"><th>ROUTE</th><th>DESTINATION</th><th>ARRIVAL</th></tr><tr><td class="spacer" colspan="3"></td></tr>');
			for(var i=0; i<predsTag.length;i++)
			{
				var arrival = predsTag[i].getElementsByTagName("pt")[0].firstChild.data + " " + predsTag[i].getElementsByTagName("pu")[0].firstChild.data;
				var route = predsTag[i].getElementsByTagName("rd")[0].firstChild.data;
				var destination = predsTag[i].getElementsByTagName("fd")[0].firstChild.data;
                results = results.concat('<tr class="predictions">');
                results = results.concat("<td>" + route + "</td>" + "<td>" + destination + "</td>" + "<td>" + arrival + "</td>");
			    results = results.concat('</tr><tr><td class="spacer" colspan="3"></td></tr>');
			}
		}
        else
        {
            results = results.concat("<tr><td>No upcoming arrivals</td></tr>");
        }
        results = results + "</table>";
        $(outputContainer).html(results).show();
}
