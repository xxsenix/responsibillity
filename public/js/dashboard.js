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

function handleCollapsible() {
 $('#dashboard-body').on('click', '.collapsible', function() {
      this.classList.toggle("active");
      let content = this.nextElementSibling;
      if (content.style.maxHeight){
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      } 
    });
  }

function renderData(data) {
  $('.js-bill-list').append(
    `
    <li class="js-bill-item">
    <button class="collapsible">${data.billName}</button>
    <div class="content">
        <p>Due date: ${data.dueDate}</p>
        <p>Amount: ${data.billAmount}</p>
        <p>Bill Website: ${data.billWebsite}</p>
        <button class="js-bill-item-delete">Delete</button>
        <button class="js-bill-item-edit">Edit</button>
    </div>
    </li>`
  );
}

function handleSubmit() {
  $('form').on('click', '#submit-button', function(event) {
    event.preventDefault();
    const data = {
      billName: $('#billName').val(),
      billAmount: $('#billAmount').val(),
      billWebsite: $('#billWebsite').val(),
      dueDate: $('#date-input').val()
    }
    console.log(data);
    renderData(data)
    closeModal();
  });
}

function handleBillDelete() {
  $('.js-bill-list').on('click', '.js-bill-item-delete', function(e) {
    e.preventDefault();
    $(e.currentTarget).closest('.js-bill-item').remove();
  });
}

function handleApp() {
  handleCollapsible();
  handleSubmit();
  handleBillDelete();
}
$(handleApp);

