$(document).ready(function() {
  AOS.init();

  //OUR WORK FILTER & LIGHTBOX
  let filterButton = document.querySelectorAll('#box-filter li a');
  let productsArray = document.querySelectorAll('#box-products .item');
  let headerFilter = document.getElementsByClassName('header-section')[0];
  let URLHastag = location.href.split('#')[1];
  let total = 0;

  //Aparición de Casos por URL de llegada
  for(let i = 0; i < productsArray.length; i++){
    productsArray[i].classList.remove('active');

    if( URLHastag == 'todos') {
      productsArray[i].classList.add('active')
      headerFilter.id = ('');

      total++;
    } else if(productsArray[i].getAttribute('data-category') == URLHastag){
      productsArray[i].classList.add('active');
      headerFilter.id = (URLHastag);
      total++;
    } 
  }

  //Funcionamaiento de filtros buttons
  for(let i = 0; i < filterButton.length; i++){
    filterButton[i].classList.remove('active');
    if( filterButton[i].getAttribute('data-filter') == URLHastag) filterButton[i].classList.add('active');
    filterButton[i].onclick = function(e){
      let dataFilter = filterButton[i].getAttribute('data-filter');
      for(let j = 0; j < filterButton.length; j++){
        filterButton[j].classList.remove('active');
      }
      filterButton[i].classList.add('active');
      if(dataFilter == 'todos'){
        headerFilter.id = ('');
        let total1 = 0;
        productsArray.forEach(item => {
          item.classList.remove('special');
          item.classList.add('active');
          total1++;
        });
      } else{   
        let total2 = 0;
        headerFilter.id = (dataFilter);
        productsArray.forEach(item =>  {
          item.classList.remove('active');
          item.classList.remove('special');
          if(item.getAttribute('data-category') == dataFilter) {
            total2++;
            item.classList.add('active')
          }
        })
      }
    }
  }

  //  HEADER NAVIGATION
  $(".submenu").click(function(event){
    if( $(".submenu").children("ul").hasClass('active') ){
      $(".submenu").children("ul").removeClass('active');
      $(".submenu").children("ul").hide(500);
    } 
    $(this).children("ul").slideToggle(1000);
    $(this).children("ul").addClass('active');
  });

  $(".submenu ul").click(function(ev){
    ev.stopPropagation();
  });  

  //  CLIP BUTTON SCROLL UP
  const mybutton = $("#button-top")
  
  mybutton.click(function(event){
    event.preventDefault();
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  });
  
  //  SHOW HIDE BUTTON SCROLL UP
  window.onscroll = function() {scrollFunction(mybutton)};
  
  function scrollFunction(mybutton) {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      mybutton.show();
    } else {
      mybutton.hide();
    }
  }
  
});
