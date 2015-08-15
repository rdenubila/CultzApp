
document.addEventListener("deviceready", ready, false);


function ready(){

	initFB = true;
	checkInit();

}


function checkLoginState() {
	
	$("#loading").fadeIn("fast");

	facebookConnectPlugin.getLoginStatus( 
        function (response) { alert(JSON.stringify(response)) },
        function (response) { alert(JSON.stringify(response)) });

}