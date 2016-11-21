function refreshData()
{
    x = 1;  // x = seconds
    var unix = (Math.round(+new Date()/1000))
 	//var d = new Date()
 	//var h = d.getHours();
 	//var m = d.getMinutes();
 	//var s = d.getSeconds();
 	
 	//if (h<=9) {h = '0'+h};
 	//if (m<=9) {m = '0'+m};
	//if (s<=9) {s = '0'+s};
	
 	//var	color = '#'+h+m+s;
 	var unixStr = unix.toString(16);
 	var unixPrint = unixStr.substring(3, 9);

 	var color = '#'+unixPrint;
 	
    $("div.background").css("background-color", color );
    $("p#hex").text(color);
     
    setTimeout(refreshData, x*1000);
}
  
refreshData(); // execute function