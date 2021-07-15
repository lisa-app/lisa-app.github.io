// JavaScript Document
	
	
$(document).ready(function () {
	function dilea_google(){
	//		gtag('config', 'UA-135901351-1', {
	//		  'page_title' : 'Contacto OK',
	//		  'page_path': '/solicitud-contacto-ok',
	//		  'send_to': 'UA-135901351-1', 
	//		});
		}
    
	/*window.addEventListener('scroll', function(e){ /**** SMALLER ***** /
		var distanceY = window.pageYOffset || document.documentElement.scrollTop,
			shrinkOn = 20,
			header = document.querySelector("header");
		if (distanceY > shrinkOn) {
			classie.add(header,"smaller");
		} else {
			if (classie.has(header,"smaller")) {
				classie.remove(header,"smaller");
			}
		}
	});*/
    
	$('.to_top').click(function() {
        $('body,html').animate({scrollTop: 0}, 800);
        return false;
    });
	
	
	$('#mostrarmenu a').click(function(event){
		event.preventDefault();
		if ($(this).hasClass('is-active')){
			$(this).removeClass('is-active');
			$('.nav').css('display', 'none');
            $('.idiomas').css('display', 'none');
			$('.menu').css('display', 'none');
            $('.accesos').removeClass('open');
            $('HEADER').css("background-color","transparent");
		} else {
			$(this).addClass('is-active');
			$('.nav').css('display', 'block');
            $('.idiomas').css('display', 'block');
			$('.menu').fadeIn();
            $('.accesos').addClass('open');
            $('HEADER').css("background-color","rgba(0,0,0,0.8)");
		}
	});
	
	$(document).keyup(function(event){
		if(event.which==27)
		{
			$(".popover").hide();
			$('.modal-backdrop').fadeOut();
		}
		event.preventDefault();
	});
	
	$('.btn-newsletter').click(function(event){
		event.preventDefault();
		$(".popover-newsletter").removeClass('hide');
		$(".popover-newsletter").show();
		//$('.popover-newsletter .popover-contenido').load('/es/actualidad/suscripcion-include.php');
		$('#modalNewsletter').removeClass('hide');
		$('#modalNewsletter').fadeIn();
	});
	$('.popover-cerrar').click(function(event){
		event.preventDefault();
		$(".popover").hide();
		$('.modal-backdrop').fadeOut();
	});
	$('.modal-backdrop').click(function(event){
			event.preventDefault();
			$(".popover").hide();
			$('.modal-backdrop').fadeOut();
			$('.popover-video .popover-contenido').html('');
		});
		
	/* **** CARRUSELES **** */
	
	$('.carrusel').slick({
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 2800,
        arrows:true,
        dots: true,
        dotsClass:'slick-dots main',
        fade: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        //lazyLoad: 'progressive',
	});
	
	

	/* **** APARICIONES **** */
	
	
}); // FIN document.ready
