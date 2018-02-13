

function setHeights() {
    var windowHeight = $(window).height();
    $('.slide').height(windowHeight);
}

setHeights();

$(window).resize(function() {
  setHeights();
});

function addSticky() {
  $('.slide').each(function() {
    var scrollerAnchor = $(this).offset().top;
    if (window.scrollY >= scrollerAnchor) {
      $(this).addClass('fix-it');
    } else {
      $(this).removeClass('fix-it');
    }
  });
}

$(window).scroll(function() {
  addSticky();
});

var video = document.getElementById('video-background')
document.addEventListener('click', function () {
    video.muted = !video.muted;
    return false;
});
video.addEventListener('timeupdate', function () {
  //console.log(video.currentTime);
  if (video.currentTime>31) {
    $('.content').fadeOut()
  }else{
    $('.content').fadeIn()
  }
});

(function(){

  if(document.getElementById('slideshow')==null) return;

  // we set the 'fx' class on the first image when the page loads
  document.getElementById('slideshow').getElementsByTagName('img')[0].className = "fx";
  
  // this calls the kenBurns function every 4 seconds
  // you can increase or decrease this value to get different effects
  window.setInterval(kenBurns, 8000);   
  
  // the third variable is to keep track of where we are in the loop
  // if it is set to 1 (instead of 0) it is because the first image is styled when the page loads
  var images          = document.getElementById('slideshow').getElementsByTagName('img'),
      numberOfImages  = images.length,
      i               = 1;

  function kenBurns() {
  if(i==numberOfImages){ i = 0;}
  images[i].className = "fx";

  // we can't remove the class from the previous element or we'd get a bouncing effect so we clean up the one before last
  // (there must be a smarter way to do this though)
  if(i===0){ images[numberOfImages-2].className = "";}
  if(i===1){ images[numberOfImages-1].className = "";}
  if(i>1){ images[i-2].className = "";}
  i++;

  }
  
})();


$("#header_slide").owlCarousel({
    items: 1,
    loop:true,
    autoplay: true,
    autoplaySpeed: 1500
});


$('#subscription-form').submit(function(e) {

    e.preventDefault();
    var $form           = $('#subscription-form');
    var submit          = $('#subscribe-button');
    var ajaxResponse    = $('#subscription-response');
    var email           = $('#subscriber-email').val();

    $.ajax({
        type: 'POST',
        url: '././php/subscribe.php',
        dataType: 'json',
        data: {
            email: email
        },
        cache: false,
        beforeSend: function(result) {
            submit.val("Enviando...");
        },
        success: function(result) {
            if(result.sendstatus == 1) {
                ajaxResponse.html(result.message);
                $form.fadeOut(500);
            } else {
                ajaxResponse.html(result.message);
                submit.val("LISTO!");
            }
        }
    });

});