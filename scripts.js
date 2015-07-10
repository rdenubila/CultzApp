
if( $(window).width()<640 ){
	$('meta[name=viewport]').attr('content','width=device-width initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no, minimal-ui=1');
}

var swiperInstrucao;
var swiperRoleta;

$( document ).ready(function() {

	$("#swiperInstrucao .swiper-wrapper").load("instrucoes.html", function() {
		
	});

	$("#overlay").on('click', function(event) {
		fechaOverlay();
	});
    
    initAndamento();
	initAddAmigos();

	initApp();

});

function initApp(){
	trocaTela("instrucao");
}

var telaAtual = "home";
function trocaTela(novaTela){

	if(novaTela=="andamento"){
		$("#topo_circuito").fadeOut();
		$("#topo_fixo").fadeIn();
	}

	if(novaTela=="sel_tema"){
		$("#topo_circuito").fadeIn();
		$("#topo_fixo").fadeOut();
	}

	$("#"+telaAtual).delay(telaAtual=="home" ? 1000 : 0).fadeOut('fast', function() {
		$("#"+novaTela).fadeIn("fast", function(){

			//console.log(telaAtual);


			if(telaAtual=="instrucao"){
				swiperInstrucao = new Swiper('#swiperInstrucao', {
					pagination: "#swiperInstrucaoPag"
				});
			}

			if(telaAtual=="sel_tema"){
				initRoleta();
			}

			if(telaAtual=="jogo"){
				initPergunta();
			}

		});
	});

	telaAtual = novaTela;

}

var ultimaTelaOverlay;
function mostraOverlay(id, d){

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
		case "acertou":
		case "acertou_tudo":
			initPergunta();
			break;
		case "errou":
		case "ganhou_cultz":
			trocaTela("andamento");
			break;
	}
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

	$("#add_amigos .guias a").on('click', function(event) {
		event.preventDefault();
		$("#add_amigos .guias .sel").removeAttr('class');
		$(this).parent().addClass('sel');
		$("#add_amigos .lista").hide();
		$($(this).attr('href')).show();
	});

	$("#add_amigos .guias a").eq(0).click();

}


var roletaGirada = false;
function initRoleta(){

	roletaGirada = false;

	itens = $("#swiperRoleta .swiper-wrapper").html();
	for(i=0; i<20; i++){
		$("#swiperRoleta .swiper-wrapper").append(itens);
	}

	swiperRoleta = new Swiper('#swiperRoleta', {
		direction: 'vertical',
		slidesPerView: "auto",
		centeredSlides: true,
		initialSlide: 53,
		onSlideChangeEnd: function(s){

			if(s.activeIndex!=53){
				trocaTela("jogo");
			}

		}
	});

	$(".overlay").swipe({
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
		i = 10+Math.round(Math.random()*35);
		swiperRoleta.slideTo( 50 + (i*direcao) , 1000);
		roletaGirada = true;
	}


}


var jogadaAtual = 0;
var jogou = false;
var acertos = new Array();
function initPergunta(){

	jogou = false;

	$(".tempo .cor").css('margin-left', '-100%');
	$(".tempo .cor").animate({"margin-left": "0%"}, 30000, function(){
		mostraOverlay("errou", 0);
	});

	$(".box_jogo .resposta").removeClass('certa').removeClass('errada');

	$(".box_jogo .resposta").on('click', function(event) {

		event.preventDefault();

		if(!jogou){
			

			$(".tempo .cor").stop();

			if($(this).data("certa")==true){
				$(this).addClass('certa');
				acertos[jogadaAtual] = true;

				if(jogadaAtual<2){
					mostraOverlay("acertou", 500);
				} else if(jogadaAtual==2){ 
					mostraOverlay("acertou_tudo", 500);
				} else if(jogadaAtual>2){ 
					mostraOverlay("ganhou_cultz", 500);
				}

			} else {
				$(".box_jogo .resposta").each(function() {
					if($(this).data("certa")) {
						$(this).addClass('certa');
					}
				});
				$(this).addClass('errada');
				mostraOverlay("errou", 1000);
				acertos[jogadaAtual] = false;
			}

			jogadaAtual++;

			ajustaAcertos();
			jogou = true;
		}

	});

}


function ajustaAcertos(){
	$(".parcial .item-certo").removeClass('item-certo');
	$(".parcial .item-errado").removeClass('item-errado');

	for(i=0; i<jogadaAtual; i++){
		$(".parcial .item-"+(i+1) ).addClass( acertos[i] ? 'item-certo' : 'item-errado' );
	}
}