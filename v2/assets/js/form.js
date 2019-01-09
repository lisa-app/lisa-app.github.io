'use strict';

//Mask input
$('.js-field__phone').mask('( 999 ) 999 - 9999');

//Submiting form
let form = document.querySelector('.js-form');
let formName = '.js-form';

form.addEventListener('submit', function (e) {
  submitForm(e, formName);
});

//Send data to mail.php
function submitForm(e, formName) {
  e.preventDefault();
  let name = $(formName + ' .js-field__first-name').val();
  //let lastName = $(formName + ' .js-field__last-name').val();
  let email = $(formName + ' .js-field__email').val();
  let phone = $(formName + ' .js-field__phone').val();
  let company = $(formName + ' .js-field__company').val();
  let size = $(formName + ' .radio-btn__radio[name=\'company-size\']:checked').val();
  
  
  let formData = {
    name: name,
    //lastName: lastName,
    email: email,
    phone: phone,
    company: company,
    size: size
  };
  
  $.ajax({
    type: 'POST',
    url: 'https://script.google.com/macros/s/AKfycbxxK4j39b8JWVvju6fKBrXXtqVyVOaOgbut4nZ3w5ssi9zZrJ0/exec',
    data: formData,
    success: function () {
      console.log('success');
            document.getElementById("mensaje_ok").style.display = "block";
      //...
    },
    error: function () {
      console.log('error');
      //...
    }
  });
}