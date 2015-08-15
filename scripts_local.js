apiURL = "http://localhost/Cultz/sistema/";

//localStorage.removeItem("user");

function statusChangeCallback(response) {
	if (response.status === 'connected') {
		getUserData();
	} else if (response.status === 'not_authorized') {
		loginFB();
		$("#loading").fadeOut("fast");
	} else {
		loginFB();
		$("#loading").fadeOut("fast");
	}
}

function getUserData(){
	FB.api('/me?fields=id,name,email', function(response) {
		login( response );
	});
}

function login(response){
	$.getJSON( apiURL+"login.php", response).done(function( data ) {
		console.log("----- USUARIO LOGADO ------")
		console.log(data);

		userLogado = data;
		localStorage.user = JSON.stringify( data );

		loginComplete();

		trocaTela('andamento');
		$("#loading").fadeOut("fast");
	});
}

function checkLoginState() {
	
	$("#loading").fadeIn("fast");

	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
}

function loginFB(){
	FB.login(function(response) {
		statusChangeCallback(response);
	}, {scope: 'email, user_friends'});
}



function getFriendsFB(){
	$("#loading").fadeIn("fast");

	FB.api('me/friends?fields=id&limit=999', function(response) {
		getFriendsBD( response );
	});
}


function getFriendsBD(response){
	datas = response.data;

	arr = new Array();
	for(i=0; i<datas.length; i++){
		d = datas[i];
		arr.push(d.id);
	}

	AmigosLoadFB(arr.join(","));
	
}