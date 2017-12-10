var apiURL = "http://www.quizcultz.com.br/webservice/";

if( $(window).width()<350 ){
	$('meta[name=viewport]').attr('content','width=device-width initial-scale=0.4, maximum-scale=0.4, minimum-scale=0.4, user-scalable=no, minimal-ui=1');
} else if( $(window).width()<640 ){
	$('meta[name=viewport]').attr('content','width=device-width initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no, minimal-ui=1');
}


//localStorage.clear();


var swiperInstrucao;
var swiperRoleta;
var swiperEstabelecimentos;
var swiperStat;

var userLogado;
var is_userLoggedInFB;

//var initReady = false;
//var initFB = false;

if (localStorage.vidas == undefined) {
	localStorage.vidas = 5;
}

var limiteTempoVidas = 3 * 60; // EM MINUTOS
var limiteTempoGiro = 24 * 60; // EM MINUTOS

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	//initAddAmigos();

	initApp();
	//initReady = true;
	//checkInit();
}

$( document ).ready(function() {
	$.getJSON( apiURL+"getTextByArea.php?area=instrucoes").done(function( data ) {
		console.log("----- CARREGA TEXTO INSTRUCAO ------");

		for(i=0; i<data.length; i++){

			d = data[i];

			html = '<div class="swiper-slide">';
			html += d.texto;
			html += '</div>';

			$("#swiperInstrucao .swiper-wrapper").append(html);
		}

		trocaTela("instrucao");
	})
	.error(function(jqXHR, textStatus, errorThrown) {
		console.log("----- ERRO: getTextByArea.php?area=instrucoes ------");
		console.log(errorThrown);
		$("#instrucao").fadeOut();
		fechaInstrucao();
	});

	$("#overlay").on('click', function(event) {
		fechaOverlay();
	});


	//GUIAS
	$(".guias_resize").each(function(index, el) {
		qtd = $(this).find('li').length;
		$(this).find('li').width( 100/qtd+"%" );
	});
    
    initAndamento();

	updateVidas();
});

/*function checkInit(){
	if(initReady && initFB){
		initApp();
	}
}*/

function initApp(){
	if (localStorage.user) {
		checkLoginState(statusChangeCallback, statusChangeFailCallback);
	} else {
		is_userLoggedInFB = false;
		trocaTela("instrucao");
	}
}

function statusChangeFailCallback(response) {
	console.log(JSON.stringify(response));
	is_userLoggedInFB = false;
	trocaTela("instrucao");
}

function checkGiroCultz(){

	console.log("----- checkGiroCultz() ------");
	if (localStorage.tempoGiro==undefined) {
		localStorage.tempoGiro = new Date().getTime();
	}

	var tempo = (1000 * 60);
	var agora = new Date();
	var t = (agora.getTime()-parseInt(localStorage.tempoGiro)) / tempo;

	console.log("t: "+t);

	if(t>limiteTempoGiro){
		getLocation();

		localStorage.tempoGiro = new Date().getTime();
	}
	else
		console.log('Localização não atualizada pois t = ' + t + ' < limiteTempoGiro = ' + limiteTempoGiro);

}


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

var currentGiroEst;
function showPosition(position) {
    console.log(position.coords);

    var url =  apiURL+"getBusinessDistance.php?lat="+position.coords.latitude+"&long="+position.coords.longitude+"&dist=2";
    console.log(url);
    $.getJSON(url).done(function( data ) {
		console.log("----- GPS ------");
		console.log(data);

		if(data.length>0){
			currentGiroEst = data[0];
			trocaBanner();
			mostraOverlay("giro_cultz");
		}

	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});
}

function alerta(msg){
	$("#box_alerta p").html(msg);
	$("#box_alerta").fadeIn();
}

function fecha_alerta(){
	$("#box_alerta").fadeOut();
}

var telaAtual = "home";
var qtdVidaCultz;
function trocaTela(novaTela){
	$(".menu_topo li").removeClass('sel');
	$(".menu_topo ."+novaTela).addClass('sel');

	if(novaTela=="andamento"){
		$("#topo_circuito").fadeOut();
		$("#topo_fixo").fadeIn();
	}

	if(novaTela=="sel_tema"){
		$("#topo_circuito").fadeIn();
		$("#topo_fixo").fadeOut();
	}

	if(novaTela=="instrucao"){
		$("#topo_circuito").fadeOut();
		$("#topo_fixo").fadeOut();

		if(userLogado!=null){
			$("#instrucao #btn_iniciar").html("FECHAR");
		}
	}

	if(novaTela=="add_amigos"){
		initAddAmigos();
	}

	if(novaTela=="andamento"){
		loadCults();
		LoadRounds();
	}

	if(novaTela=="estatisticas"){
		loadStats();

		$(".estrelas .estrela").hide();
		for(i=0; i< 5-parseInt(localStorage.vidas); i++){
			$(".estrelas .estrela_"+i).show();
		}


		$("#estatisticas .estrelas .estrela").click(function(){
			trocaEstrelaCultz($(this).index()+1);
		});

		trocaEstrelaCultz(1);
		$(".confirmar_compra_vida").hide();

		setTimeout(function(){

			console.log("TELA VIDAS");

			swiperStat = new Swiper('#swiperStat', {
				onSlideChangeEnd: function(s){
					$("#estatisticas .guias .sel").removeClass('sel');
					$("#estatisticas .guias li").eq(s.activeIndex).addClass('sel');
					if(s.activeIndex==2){
						$(".confirmar_compra_vida").show();
					} else {
						$(".confirmar_compra_vida").hide();
					}
				}
			});

			$("#estatisticas .guias li").click(function(event) {
				swiperStat.slideTo( $(this).index() );
			});
		}, 1000);
	}

	if (telaAtual=="home")
		$("#"+telaAtual).delay(1000).fadeOut('fast');
	else {
		$("#"+telaAtual).fadeOut('fast', function() {
			$("#"+novaTela).fadeIn("fast", function(){
				if(telaAtual=="instrucao"){
					swiperInstrucao = new Swiper('#swiperInstrucao', {
						pagination: "#swiperInstrucaoPag"
					});
				}

				if(telaAtual=="estabelecimento_info"){
					swiperEstInfo = new Swiper('#swiperEstInfo', {
						onSlideChangeEnd: function(s){
							$("#estabelecimento_info .guias .sel").removeClass('sel');
							$("#estabelecimento_info .guias li").eq(s.activeIndex).addClass('sel');
						}
					});
				}
				

				if(telaAtual=="sel_tema"){
					initRoleta();
				}

				if(telaAtual=="jogo"){
					initPergunta();
					trocaBanner();
				}

				if(telaAtual=="estabelecimentos"){
					initEstabelecimentos();
				}

				

			});
		});
	}

	telaAtual = novaTela;

}

function vaiParaVidas(){


	trocaTela('estatisticas');
	setTimeout(function(){
		swiperStat.slideTo( 2 );
	}, 1250);
}

function trocaEstrelaCultz(qtd){
	$("#estatisticas .estrelas .amarela").removeClass('amarela');
	qtdVidaCultz = qtd;
	for(i=0; i<qtd; i++){
		$("#estatisticas .estrelas .estrela_"+i).addClass('amarela');
	}

	$(".info_vida_cultz").html(qtdVidaCultz+" vida = "+qtdVidaCultz+" Cultz");

	$(".confirmar_compra_vida").show();
}

function comprarVida(){

	if(cultzCount>=qtdVidaCultz){
		updateVidas(qtdVidaCultz);
		addCultz("Trocou "+qtdVidaCultz+" Cultz por "+qtdVidaCultz+" vida(s)", -qtdVidaCultz);
		trocaTela("andamento");

		loadCults();
	} else {
		alerta("Você não possui Cultz suficientes para comprar a quantidade de vidas selecionada.");
	}
}


function trocaBanner(){
	$.getJSON( apiURL+"getBanner.php").done(function( data ) {
		console.log("----- TROCA BANNER ------");
		
		$(".banner").html("<a href='"+data.link+"' target='_blank'><img src='"+apiURL+"/arquivos/"+data.img+"'' height='160' width='565'></a>")

	});
}

var ultimaTelaOverlay;
function mostraOverlay(id, d){

	if(d==undefined){
		d = 0;
	}

	switch(id){
		case "errou": finalizaCircuito(false); break;
		case "acertou_tudo": finalizaCircuito(true); break;
		case "ganhou_cultz": finalizaCircuito(true); addCultz("Acertou todas as perguntas do circuito", 1); break;
		case "ganhou_cultz_circuito": finalizaCircuito(true); addCultz("Acertou todas as perguntas do circuito", 1); break;

		case "ganhou_5_circuitos": addCultz("Ganhou 5 circuitos", 1); finalizaCircuito(true); break;

		case "ganhou_giro": addCultz("Acertou o Giro Cultz", 1); break;
	}

	$("#overlay .msgs").hide();
	$("#overlay #"+id).show();

	$("#overlay").delay(d).fadeIn('fast', function(){
		$(".box_jogo .resposta").removeClass('certa').removeClass('errada');
	});

	ultimaTelaOverlay = id;
}

function fechaOverlay(){
	$("#overlay").fadeOut();

	switch(ultimaTelaOverlay){
		case "giro_cultz":
			loadPerguntasGiro(currentGiroEst.id);
			break;
		case "acertou":
			initPergunta();
			break;
		default:
			trocaTela("andamento");
			break;
	}
}

function fechaInstrucao(){
	if(userLogado==null){
		trocaTela('login');
	} else {
		trocaTela('andamento');
	}
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function cadastrar(){

	data = {
		nome: $("#cadastro_nome").val(),
		email: $("#cadastro_email").val(),
		senha: $("#cadastro_senha").val()
	}

	if(data.nome=="" || data.email=="" || data.senha==""){
		alerta("Preencha todos os campos!");
		return false;
	}

	if(!validateEmail(data.email)){
		alerta("E-mail inválido!");
		return false;
	}

	$.getJSON( apiURL+"setCadastro.php", data).done(function( data ) {
		console.log("----- CADASTRAR USUARIO ------");
		console.log(data);

		if(!data.success){
			alerta(data.erro);
		} else {
			alerta("Usuário cadastrado com sucesso!");
			trocaTela('login');
		}
	});

}

function loginComum (){
	$("#loading").fadeIn("fast");

	data = {
		email: $("#login_email").val(),
		senha: $("#login_senha").val()
	}

	login(data, 'andamento');
}

function login(response, goTo = ''){
	$.getJSON( apiURL+"login.php", response).done(function( data ) {
		console.log("----- USUARIO LOGADO ------");
		console.log(data);

		$("#loading").fadeOut("fast");

		if(!data.success){
			alerta("Usuário e/ou senha inválido!");
			return false;
		}

		userLogado = data;
		localStorage.user = JSON.stringify( data );

		loadCults();
		LoadRounds();
		loginComplete();

		if (goTo != '')
			trocaTela(goTo);
		
	}).error(function(jqXHR, textStatus, errorThrown) {
		console.log('---- getJSON login.php ----');
		console.log("error " + textStatus);
		console.log("incoming Text " + jqXHR.responseText);
		console.log(errorThrown);
    });
}

function loginComplete(){
	$("#topo_fixo .foto").css('background-image', 'url('+userLogado.foto.replace('http://', 'https://')+')');
	$("#topo_fixo .nome").html(decodeURI(userLogado.nome));

	getDeviceData();
}

function initAndamento(){
	$(".jogos_andamento li").on('click', function(event) {
		event.preventDefault();
		trocaTela("sel_tema");
	});
}

function toggleCheck(obj){

	o = $(obj).find(".check i");

	if(o.hasClass('icon-uncheck')){
		o.removeAttr('class');
		o.addClass('icon-check');
	} else {
		o.removeAttr('class');
		o.addClass('icon-uncheck');
	}

}

function initAddAmigos(){

	$("#lista_fb").html("");
	$("#lista_ac").html("");

	getFriendsFB();

	$("#add_amigos .guias a").on('click', function(event) {
		event.preventDefault();
		$("#add_amigos .guias .sel").removeAttr('class');
		$(this).parent().addClass('sel');
		$("#add_amigos .lista").hide();
		$($(this).attr('href')).show();
	});

	$("#add_amigos .guias a").eq(0).click();

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

function AmigosLoadFB(ids){

	$("#lista_fb").html("");
	$("#lista_ac").html("");

	$.getJSON( apiURL+"getFriends.php", {id: userLogado.id, ids: ids, tipo: 'fb'}).done(function( data ) {
		console.log("----- FRIENDS ------");
		console.log(data);

		for(i=0; i<data.length; i++){
			d = data[i];

			html = '<li>';
			html += '	<div class="item" data-id="'+d.id+'" onclick="toggleCheck(this);">';
			html += '		<div class="check"> <i class="icon-uncheck"></i> </div>';
			
			if(d.foto!=""){
				html += '		<div class="foto" style="background-image: url(\''+d.foto.replace('http://', 'https://')+'\')"></div>';
			} else {
				html += '		<div class="foto" style="background-image: url(images/profile.png)"></div>';
			}


			html += '		<h2>'+decodeURI(d.nome)+'</h2>';
			html += '		<div class="clear"></div>';
			html += '	</div>';
			html += '</li>';

			if(d.id_fb==""){
				$("#lista_ac").append(html);
			} else {
				$("#lista_fb").append(html);
			}
		}

		$("#lista_fb").append("<li onclick='inviteFriends()'><p class='aviso'>Não encontrou quem você procurava? Toque aqui e chame seu amigo para jogar o Quiz Cultz.</p></li>")


		if($("#lista_fb").html()==""){
			//$("#lista_fb").html("<li><p class='aviso'>Você não tem nenhum amigo para convidar.</p></li>")
		}

		if($("#lista_ac").html()==""){
			$("#lista_ac").html("<li><p class='aviso'>Você não tem nenhum amigo para convidar.</p></li>")
		}



		$("#loading").fadeOut("fast");

	});

}

function convidaAmigos(){

	if($("#add_amigos .icon-check").length==0){
		alerta("Selecione pelo menos um amigo para convidar");
	} else {

		ids = new Array();

		$("#add_amigos .icon-check").each(function(index, el) {
			ids.push( $(this).parent().parent().data('id') );
		});

		enviaConvite(ids.join(','));

	}
}

function enviaConvite(ids){

	$("#loading").fadeIn("fast");

	$.getJSON( apiURL+"setInvite.php", {id: userLogado.id, ids: ids } ).done(function( data ) {

		console.log("-- CONVIDA AMIGOS --");
		console.log(data);

		$("#loading").fadeOut("fast");
		if(data.result == true){
			if(data.qtd==0){
				alerta("Não há nenhum usuário para convidar. Convide seus amigos!");
			}
			trocaTela('andamento');
		} else {
			alerta(data.error);
		}

	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});
}


function LoadRounds(){

	checkGiroCultz();

	$("#jogos_andamento").html("");

	if (userLogado)
	{
		$.getJSON( apiURL+"getRounds.php", {id: userLogado.id}).done(function( data ) {
			console.log("----- ROUNDS ------");
			console.log(data);

			if(data.length==0){
				$("#andamento .titulo").html("nenhum jogo em andamento");
			} else if(data.length==1){
				$("#andamento .titulo").html("1 jogo em andamento");
			} else {
				$("#andamento .titulo").html(data.length+" jogos em andamento");
			}

			$("#jogos_andamento").html('');
			for(i=0; i<data.length; i++){
				d = data[i];

				if(d.vez==userLogado.id){
					html = '<li onclick="selJogo('+d.id+')">';
				} else {
					html = '<li onclick="vezAdversario()">';
				}

				if(d.foto!=""){
					html += '		<div class="foto" style="background-image: url(\''+d.foto.replace('http://', 'https://')+'\')"></div>';
				} else {
					html += '		<div class="foto" style="background-image: url(images/profile.png)"></div>';
				}

				html += '	<div class="pontuacao">'+d.placar1+'x'+d.placar2+'</div>';

				html += '	<h2>'+decodeURI(d.nome)+'</h2>';

				if(d.vez==userLogado.id){
					html += '	<p class="destaque">Sua vez</p>';
				} else {
					html += '	<p class="destaque">Vez do seu adversário</p>';
				}

				html += '	<p>'+d.tempo+'</p>';
				html += '	<div class="clear"></div>';

				html += '</li>';

				
				$("#jogos_andamento").append(html);
				
			}

		});
	}
}

function vezAdversario(){
	alerta("Aguarde seu adversário jogar!");
}

var roundAtual;
var iUser;
function selJogo(idRound){

	if( parseInt(localStorage.vidas)==0){
		alerta("Você não possui mais vidas para jogar. Você ganhará 3 vidas 3h após suas vidas terminarem.");
		return;
	}

	$("#loading").fadeIn("fast");

	$.getJSON( apiURL+"getRound.php", {id_user: userLogado.id, id: idRound}).done(function( data ) {
		console.log("----- ROUND ------");
		console.log(data);

		roundAtual = data;

		$("#circuito_foto1, .circuito_foto1").css('background-image', 'url('+roundAtual.user1.foto.replace('http://', 'https://')+')');
		$("#circuito_nome1, .circuito_nome1").html(decodeURI(roundAtual.user1.nome));

		$("#circuito_foto2, .circuito_foto2").css('background-image', 'url('+roundAtual.user2.foto.replace('http://', 'https://')+')');
		$("#circuito_nome2, .circuito_nome2").html(decodeURI(roundAtual.user2.nome));

		$("#circuito_placar, .circuito_placar").html(zeroFill(roundAtual.round.placar1) +" x "+ zeroFill(roundAtual.round.placar2));

		$("#circuito_count").html("Circuito: " + (parseInt(Math.floor(roundAtual.round.circuito_count/2))+1) +" de "+ (parseInt(roundAtual.round.round_count)+1)*5 );

		$(".ico_temas .on").removeClass('on');
		$(".ico_temas .off").removeClass('off');

		if(roundAtual.round.area_cinema1=="s"){	$(".ico_temas1 .ico-cinema").addClass('on'); }
		if(roundAtual.round.area_evento1=="s"){	$(".ico_temas1 .ico-evento").addClass('on'); }
		if(roundAtual.round.area_musica1=="s"){	$(".ico_temas1 .ico-musica").addClass('on'); }
		if(roundAtual.round.area_pintura1=="s"){ $(".ico_temas1 .ico-pintura").addClass('on'); }
		if(roundAtual.round.area_teatro1=="s"){	$(".ico_temas1 .ico-teatro").addClass('on'); }
		if(roundAtual.round.area_cinema2=="s"){	$(".ico_temas2 .ico-cinema").addClass('on'); }
		if(roundAtual.round.area_evento2=="s"){	$(".ico_temas2 .ico-evento").addClass('on'); }
		if(roundAtual.round.area_musica2=="s"){	$(".ico_temas2 .ico-musica").addClass('on'); }
		if(roundAtual.round.area_pintura2=="s"){ $(".ico_temas2 .ico-pintura").addClass('on'); }
		if(roundAtual.round.area_teatro2=="s"){	$(".ico_temas2 .ico-teatro").addClass('on'); }

		if(roundAtual.round.area_cinema1=="n"){	$(".ico_temas1 .ico-cinema").addClass('off'); }
		if(roundAtual.round.area_evento1=="n"){	$(".ico_temas1 .ico-evento").addClass('off'); }
		if(roundAtual.round.area_musica1=="n"){	$(".ico_temas1 .ico-musica").addClass('off'); }
		if(roundAtual.round.area_pintura1=="n"){ $(".ico_temas1 .ico-pintura").addClass('off'); }
		if(roundAtual.round.area_teatro1=="n"){	$(".ico_temas1 .ico-teatro").addClass('off'); }
		if(roundAtual.round.area_cinema2=="n"){	$(".ico_temas2 .ico-cinema").addClass('off'); }
		if(roundAtual.round.area_evento2=="n"){	$(".ico_temas2 .ico-evento").addClass('off'); }
		if(roundAtual.round.area_musica2=="n"){	$(".ico_temas2 .ico-musica").addClass('off'); }
		if(roundAtual.round.area_pintura2=="n"){ $(".ico_temas2 .ico-pintura").addClass('off'); }
		if(roundAtual.round.area_teatro2=="n"){	$(".ico_temas2 .ico-teatro").addClass('off'); }


		iUser = roundAtual.user1.id==userLogado.id ? "1" : "2";

		$("#swiperRoleta .swiper-wrapper").html("");

		count = 0;

		if( $(".ico_temas"+iUser+" .ico-cinema").hasClass('off') ){
			$("#swiperRoleta .swiper-wrapper").append('<div class="swiper-slide cinema" data-tipo="cinema" data-tipoid="11"></div>');
			count++;
		}

		if( $(".ico_temas"+iUser+" .ico-evento").hasClass('off') ){
			$("#swiperRoleta .swiper-wrapper").append('<div class="swiper-slide eventos" data-tipo="eventos" data-tipoid="15"></div>');
			count++;
		}

		if( $(".ico_temas"+iUser+" .ico-musica").hasClass('off') ){
			$("#swiperRoleta .swiper-wrapper").append('<div class="swiper-slide musica" data-tipo="musica" data-tipoid="13"></div>');
			count++;
		}

		if( $(".ico_temas"+iUser+" .ico-teatro").hasClass('off') ){
			$("#swiperRoleta .swiper-wrapper").append('<div class="swiper-slide teatro" data-tipo="teatro" data-tipoid="12"></div>');
			count++;
		}

		if( $(".ico_temas"+iUser+" .ico-pintura").hasClass('off') ){
			$("#swiperRoleta .swiper-wrapper").append('<div class="swiper-slide pintura" data-tipo="pintura" data-tipoid="14"></div>');
			count++;
		}

		if(count>0){
			trocaTela('sel_tema');
		} else {
			$.getJSON( apiURL+"pogRound.php", {id_round: idRound } ).done(function( data ) {
				console.log(data);
				trocaTela('andamento');
			});
			alerta("Erro! Não foi possível conectar com o servidor. Tente novamente mais tarde.");
		}
		
		$("#loading").fadeOut("fast");

	});

	
}


var roletaGirada = false;
function initRoleta(){

	roletaGirada = false;

	itens = $("#swiperRoleta .swiper-wrapper").html();

	t = 100/$("#swiperRoleta .swiper-wrapper .swiper-slide").length;

	for(i=0; i<t; i++){
		$("#swiperRoleta .swiper-wrapper").append(itens);
	}

	swiperRoleta = new Swiper('#swiperRoleta', {
		direction: 'vertical',
		slidesPerView: "auto",
		centeredSlides: true,
		initialSlide: 53,
		onSlideChangeEnd: function(s){

			if(s.activeIndex!=53){
				//trocaTela("jogo");
				temaSelecionado( $(s.slides[s.activeIndex]).data('tipoid') );
			}

		}
	});

	$(".overlay_roleta").swipe({
		swipe:function(event, direction, distance, duration, fingerCount) {
			if(direction=="up"){
				girarRoleta(1);
			} else if(direction=="down"){
				girarRoleta(-1);
			}
		}
	});

}


function girarRoleta(direcao){

	jogadaAtual = 0;
	acertos = new Array();

	if(!roletaGirada){
		$(".roleta .setas").hide();
		i = Math.round(Math.random()*45);
		swiperRoleta.slideTo( 50 + (i*direcao) , 1000);
		roletaGirada = true;
	}


}

function temaSelecionado(tipo){

	$arrAreas = new Array();
	$arrAreas['11'] = "cinema";
	$arrAreas['12'] = "teatro";
	$arrAreas['13'] = "musica";
	$arrAreas['14'] = "pintura";
	$arrAreas['15'] = "evento";

	c = $arrAreas[tipo];
	$("#ico_tema_pergunta").removeClass().addClass('ico_atual '+c);
	$("#overlay .ico-tema").removeClass().addClass('ico-tema '+c);

	loadPerguntas(tipo);

}

var areaAtual;
var perguntasAtual;
var iPergunta = 0;
function loadPerguntas(area){
	areaAtual = area;
	data = {id_user: userLogado.id, area: area };
	loadPerguntasData(data);
}

function loadPerguntasGiro(id_est){
	areaAtual = "giro";
	data = {id_user: userLogado.id, estabelecimento: id_est };
	loadPerguntasData(data);
}

function loadPerguntasData(_d){

	$.getJSON( apiURL+"getQuestions.php", _d).done(function( data ) {

		console.log("----- PERGUNTAS ------");
		console.log(data);

		perguntasAtual = data;
		iPergunta = 0;

		trocaTela("jogo");

	});
}

var jogadaAtual = 0;
var jogou = false;
var acertos = new Array();
function initPergunta(){

	jogou = false;

	t = areaAtual=="giro" ? 15000 : 30000;

	$(".tempo .cor").css('margin-left', '-100%');
	$(".tempo .cor").animate({"margin-left": "0%"}, t, function(){
		mostraOverlay("errou", 0);
	});

	//ADICIONA PERGUNTA
	$("#area_QA").html("");

	$("#area_QA").append('<h2>'+ perguntasAtual[iPergunta].pergunta +'</h2>');

	arr_respostas = new Array();
	arr_respostas.push( '<a href="" class="resposta" data-certa="true">'+ perguntasAtual[iPergunta].certa +'</a>' );
	arr_respostas.push( '<a href="" class="resposta" data-certa="false">'+ perguntasAtual[iPergunta].errada1 +'</a>' );
	arr_respostas.push( '<a href="" class="resposta" data-certa="false">'+ perguntasAtual[iPergunta].errada2 +'</a>' );
	arr_respostas.push( '<a href="" class="resposta" data-certa="false">'+ perguntasAtual[iPergunta].errada3 +'</a>' );

	arr_respostas = shuffle(arr_respostas);

	$("#area_QA").append( arr_respostas.join('') );


	$(".box_jogo .resposta").removeClass('certa').removeClass('errada');

	$(".box_jogo .resposta").on('click', function(event) {

		event.preventDefault();

		if(!jogou){

			iPergunta++;
			

			$(".tempo .cor").stop();

			if($(this).data("certa")==true){

				$(this).addClass('certa');

				if(areaAtual=="giro"){
					mostraOverlay("ganhou_giro", 500);
					return;
				}
				
				acertos[jogadaAtual] = true;

				if(jogadaAtual<2){
					mostraOverlay("acertou", 500);
				} else if(jogadaAtual==2){ 

					if(roundAtual.round.circuito_count==4){
						mostraOverlay("ganhou_cultz_circuito", 500);
					} else if(roundAtual.round.circuitos_24h>=4){
						mostraOverlay("ganhou_5_circuitos", 500);
					} else {
						mostraOverlay("acertou_tudo", 500);
					}

				}/* else if(jogadaAtual>2){ 
					mostraOverlay("ganhou_cultz", 500);
				}*/

			} else {


				$(".box_jogo .resposta").each(function() {
					if($(this).data("certa")) {
						$(this).addClass('certa');
					}
				});
				$(this).addClass('errada');

				if(areaAtual=="giro"){
					mostraOverlay("errou_giro", 500);
					return;
				}

				mostraOverlay("errou", 1000);
				acertos[jogadaAtual] = false;
				updateVidas(-1);
			}

			jogadaAtual++;

			ajustaAcertos();
			jogou = true;
		}

	});

}

function finalizaCircuito(ganhou){
	
	$.getJSON( apiURL+"setCircuitEnd.php", {iUser: iUser, id_user: userLogado.id, id_round: roundAtual.round.id, area: areaAtual, ganhou: (ganhou ? 1 : 0) } ).done(function( data ) {

		if(data.result == true){
			console.log("------- setCircuitEnd --------");

			sendPushTo(
				iUser == 1 ? roundAtual.user2 : roundAtual.user1, //PEGA ADVERSARIO OPOSTO
				"Quiz Cultz",
				"Sua vez de jogar!"
				);

		} else {
			alerta(data.error);
		}

	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});
}

function addCultz(info, qtd){

	$.getJSON( apiURL+"setCultz.php", {id_user: userLogado.id, valor: qtd, info: info} ).done(function( data ) {

		if(data.result == true){
			console.log("------- setCultz --------");
		} else {
			alerta(data.error);
		}

	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});

}

var cultzCount = 0;
function loadCults () {
	if (userLogado)
	{
		$.getJSON( apiURL+"getCultz.php", {id_user: userLogado.id} ).done(function( data ) {

			if(data.result == true){
				console.log("------- getCultz --------");
				cultzCount = data.qtd;
				$("#cultzCount").html(data.qtd);
			} else {
				alerta(data.error);
			}

		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});
	}
}


function ajustaAcertos(){
	$(".parcial .item-certo").removeClass('item-certo');
	$(".parcial .item-errado").removeClass('item-errado');

	for(i=0; i<jogadaAtual; i++){
		$(".parcial .item-"+(i+1) ).addClass( acertos[i] ? 'item-certo' : 'item-errado' );
	}
}

var business;
var estLoaded = false;
function initEstabelecimentos(){

	if(!estLoaded){

		swiperEstabelecimentos = new Swiper('#swiperEstabelecimentos', {
			onSlideChangeEnd: function(s){
				$("#estabelecimentos .guias .sel").removeClass('sel');
				$("#estabelecimentos .guias li").eq(s.activeIndex).addClass('sel');
			}
		});


		$("#estabelecimentos .guias li").click(function(event) {
			swiperEstabelecimentos.slideTo( $(this).index() );
		});


		$.getJSON( apiURL+"getBusiness.php", {id_user: userLogado.id} ).done(function( data ) {

			console.log("------- getBusiness --------");
			business = data;
			loadEstabelecimentos();

		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});

		estLoaded = true;

	}
	
	
}


function loadEstabelecimentos(){

	$("#swiperEstabelecimentos .lista").html("");

	for(i=0; i<business.length;i++){
		d = business[i];
		console.log(d);

		html = "<li>";
		html += '<div class="seta"><img src="images/seta.png" height="40" width="25" /></div>';
		html += '<div class="foto"></div>';
		html += '<div class="info">';
		html += '<h2>'+decodeURI(d.nome)+'</h2>';
		html += '<p class="endereco">'+d.endereco+'</p>';
		html += '<p class="premiacao">'+d.desc_pontos+'</p>';
		html += '</div>';
		html += '<div class="icos">';
		html += '<a href="javascript: openMap(\''+d.endereco+'\')" ><img src="images/est_pin.png" height="63" width="46"></a>';
		html += '<a href="javascript: selEstabelecimento('+d.id+')"><img src="images/est_ticket.png" height="71" width="80"></a>';
		html += '</div>';
		html += '<div class="clear"></div>';
		html += '<div class="programacao">'+d.programacao+'</div>';
		html += "</li>";

		$("#est_"+d.tipo).append(html);

	}

	$("#swiperEstabelecimentos .seta").click(function(){
		if( $(this).hasClass('open') ){
			$(this).removeClass('open');
			$(this).parent().find('.programacao').stop().slideUp();
		} else {
			$(this).addClass('open');
			$(this).parent().find('.programacao').stop().slideDown();
		}
	});

}

var actualBusiness;
function selEstabelecimento(id){
	trocaTela("estabelecimento_info");

	$.getJSON( apiURL+"getBusinessInfo.php", {id: id} ).done(function( data ) {

		console.log("------- getBusinessInfo --------");
		actualBusiness = data;
		loadEstInfo();

	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});
}

var swiperEstInfo;
var scrollAlertReg = false;
function loadEstInfo(){

	$("#estabelecimento_info .guias li").click(function(event) {
		console.log($(this).index());
		swiperEstInfo.slideTo( $(this).index() );
	});
	
	$("#est_info, #est_reg").html("");


	html = "<li class='est_info'>";

	html += '<div class="foto"></div>';
	html += '<div class="info">';
	html += '<h2>'+actualBusiness.nome+'</h2>';
	html += '<p class="endereco">'+actualBusiness.endereco+'</p>';
	html += '<p class="premiacao">'+actualBusiness.desc_pontos+'</p>';
	html += '</div>';

	html += '<div class="clear"></div>';
	html += '<hr />';

	html += "<div class='texto'>"+actualBusiness.informacoes+"</div>";

	html += "</li>";

	$("#est_info").html( html );
	$("#est_reg").html( "<li><div class='texto'>"+actualBusiness.regulamento+"</div><div class='check'><input type='checkbox' id='check_regulamento' /> <label for='check_regulamento'>Aceito o regulamento</label></div></li>" );

	scrollAlertReg = false;

}

function generateVoucher(){

	if(cultzCount<actualBusiness.qtd_pontos){
		alerta("Você não tem Cultz suficiente para adquirir esse voucher!");
		return false;
	}

	if(!$("#check_regulamento").is(':checked')){
		if(!scrollAlertReg){
			swiperEstInfo.slideTo(1);
			$("#est_reg").delay(300).animate({ scrollTop: $("#est_reg li").height() }, 'slow');
			scrollAlertReg = true;
		} else {
			alerta("Aceite o regulamento para gerar o seu voucher!");
		}
	} else {
		$("#loading").fadeIn("fast");

		//trocaTela("voucher_info");
		console.log(actualBusiness);
		data = {
			id_est: actualBusiness.id,
			id_user: userLogado.id,
			programacao: actualBusiness.programacao,
			descricao: actualBusiness.desc_pontos
		};

		$.getJSON( apiURL+"setVoucher.php", data ).done(function( data ) {

			console.log("------- generateVoucher --------");
			console.log(data);

			if(data.success){
				addCultz("Troca de voucher em: "+actualBusiness.nome, -actualBusiness.qtd_pontos);
				openVoucher(data.id);
			} else {
				alerta("Não foi possível gerar o voucher, tente novamente mais tarde");
			}

		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});

	}
}

function openVoucher(id){

	$("#loading").fadeIn("fast");

	$.getJSON( apiURL+"getVoucher.php", {id: id} ).done(function( data ) {

		console.log("------- getVoucher --------");
		console.log(data);

		$("#voucher_info .info h2").html(data.est_nome);
		$("#voucher_info .info .endereco").html(data.est_endereco);
		$("#voucher_info .info .premiacao").html(data.descricao);

		html = "";

		html += "<p class='codigo'>"+data.codigo+"</p>";

		if(data.status=="valido"){
			html += "<p class='valido'><span>VALIDADE:</span> "+data.validade+"</p>";
		} else if(data.status=="expirado"){
			html += "<p class='expirado'><span>EXPIROU!</span>";
			html += "<br>Validade: "+data.validade+"</p>";
		} else if(data.status=="utilizado"){
			html += "<p class='utilizado'><span>UTILIZADO!</span>";
			html += "<br>"+data.validade+"</p>";
		}

		html += "<p><strong>Para a seguinte programação: </strong></p>";
		html += data.programacao;


		$("#voucher_info .texto").html(html);

		$("#loading").fadeOut("fast");

		trocaTela("voucher_info");

	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});
}


function loadStats(){


	$("#swiperStat #stat_cultz").html("");
	$("#swiperStat #stat_vouchers").html("");

	$.getJSON( apiURL+"getStats.php", {id_user: userLogado.id} ).done(function( data ) {

		console.log("------- getStatsCultz --------");
		console.log(data);

		for(i=0; i<data.cultz.length; i++){
			d = data.cultz[i];

			html = '<li class="stats">';

			c = d.valor<0 ? "negativo" : "positivo";

			html += '<p class="txt_valor '+c+'">'+d.valor+' <img src="images/coin.png" height="33" width="33"></p>';
			html += '<p class="txt_info">'+d.info+'</p>';
			html += '<p class="txt_data">'+d.data_cadastro+'</p>';

			html += '</li>';


			$("#stat_cultz").append(html);

		}


		for(i=0; i<data.voucher.length; i++){
			d = data.voucher[i];

			html = '<li class="stats">';

			html += '<a href="javascript: openVoucher('+d.id+')" class="txt_valor"><img src="images/ico_lupa.png" height="66" width="66"></a>';
			html += '<p class="txt_info">'+d.est+'</p>';

			if(d.status=="valido"){
				html += '<p class="txt_data valido">validade: '+d.data+'</p>';
			} else if(d.status=="expirado"){
				html += '<p class="txt_data expirado">expirado: '+d.data+'</p>';
			} else if(d.status=="utilizado"){
				html += '<p class="txt_data utilizado">utilizado: '+d.data+'</p>';
			}
			

			html += '<p class="txt_desc">'+d.desc+'</p>';

			html += '</li>';


			$("#stat_vouchers").append(html);

		}

	}).fail(function( jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});





}



function updateVidas(valor){

	if (localStorage.tempoVida!=undefined) {
		var tempo = (1000 * 60);
		var agora = new Date();
		var t = (agora.getTime()-parseInt(localStorage.tempoVida)) / tempo;

		console.log("t: "+t);

		if(t>limiteTempoVidas){
			localStorage.removeItem("tempoVida");
			localStorage.vidas = parseInt(localStorage.vidas) + 3;
		}
	}

	if(valor!=null){
		localStorage.vidas = parseInt(localStorage.vidas) + valor;
	}

	if(localStorage.tempoVida == undefined && localStorage.vidas==0){
		localStorage.tempoVida = new Date().getTime();
	}

	$(".estrelas li").removeClass('amarela');

	if(parseInt(localStorage.vidas)>5){
		localStorage.vidas = 5;
	}

	if(parseInt(localStorage.vidas)<0){
		localStorage.vidas = 0;
	}

	for(i=0; i<localStorage.vidas; i++){
		$(".estrelas li").eq(i).addClass('amarela');
	}
}

function openMap(dest){	

	var platform = device.platform.toLowerCase();
	if(platform == "android"){
		window.open('geo://0,0?q='+dest, '_system');
	}else if(platform == "ios"){
		window.open('maps://0,0?q='+dest, '_system');
	}else {
		window.open('geo://0,0?q='+dest, '_system');
	}

}

function decodeURI(str) {
   return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}