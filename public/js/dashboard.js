let coll = $('.collapsible')

for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}

let modal = $('.modal');
let modalBtn = $('#new-bill');
let closeBtn = $('.closeBtn');

modalBtn.on('click', openModal);

closeBtn.on('click', closeModal);

$(window).on('click', outsideClick);

function openModal() {
    modal.show();
}

function closeModal() {
    modal.hide();
}

function outsideClick(e) {
    if (e.target == modal[0]) {
        modal.hide();
    }
}

$('form').on('click', '#submit-button', function(event) {
  event.preventDefault();
  closeModal();
});
