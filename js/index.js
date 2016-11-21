function refreshData()
{
    x = 1;  // x = seconds
 	var d = new Date();
 	var year = d.getFullYear();
 	var month = d.getMonth();
 	var day = d.getDay();
 	var h = d.getHours();
 	var m = d.getMinutes();
 	var s = d.getSeconds();
 	
 	if (h<=9) {h = '0'+h};
 	if (m<=9) {m = '0'+m};
	if (s<=9) {s = '0'+s};

	var shortYear = year.charAt(2) + year.charAt(3);

	h = h^shortYear;
	
 	var	color = '#'+h+m+s;
 	
    $("div.background").css("background-color", color );
    $("p#hex").text(color);
     
    setTimeout(refreshData, x*1000);
}
  
refreshData(); // execute function