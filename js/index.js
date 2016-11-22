function refreshData()
{
    x = 1;  // x = seconds
    var unix = (Math.round(+new Date()/1000)) // Get current date in seconds (unix time)
 	var unixStr = unix.toString(16); // convert to hex
 	var unixPrint = unixStr.substr(unixStr.length - 6); // get last 6 chars for use in the hex color

 	var color = '#'+unixPrint.toString();
 	
    $("div.background").css("background-color", color );
    $("p#hex").text(color);
     
    setTimeout(refreshData, x*1000);
}
  
refreshData(); // execute function