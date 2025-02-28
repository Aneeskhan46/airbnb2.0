
//bootstrap
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()


//toggle switch
let  taxswitch = document.querySelector("#flexSwitchCheckDefault");


  taxswitch.addEventListener("click",()=>{
    let gsttag=document.querySelectorAll(".gst")   //doucment queryselectorAll means it selects all
      for(gst of gsttag){
        if(gst.style.display != "inline"){
          gst.style.display ="inline"    ///  element.style.display ="inline"  means it shows in browser 
        }else{
          gst.style.display ="none"  //it hide 
        }
      }
  })