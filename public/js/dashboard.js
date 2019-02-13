let dayInMilliseconds = 1000 * 60 * 60 * 24;

let state = {
  token: ""
}

function getAuthToken() {
  state.token = localStorage.getItem("authToken");
  setInterval(refreshToken, dayInMilliseconds);

  if (state.token) {
    refreshToken();
  }
  else {
    window.location.href = "/";
  }
}

function refreshToken() {
  fetch('/api/auth/refresh',
      {   
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        }   
      })
      .then(response =>{
          if (response.status === 401) {
            clearAuth()
          }
          else {
            return response.json()
          }
      })
      .then(data => {
          localStorage.setItem('authToken', data.authToken);   
     
      })
      .catch(err=>{
          console.log(err)
      });
  }

function handleSignOut() {
  $('#js-signout-link').on('click', function(event) {
    event.preventDefault();
    clearAuth();
  });
}  

function clearAuth() {
  localStorage.setItem("authToken", "");
  window.location.href = "/";
}

// GET bills

function fetchBills(callback) {
  fetch('/api/bills',
  {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
    },
    method: "GET"
  })
  .then(response => response.json())
  // .then(responseJson => {
  //   return responseJson
  // })
  .then(responseJson => {
    renderAllBills(responseJson)
  })
  .catch(err => {
    console.log("Something went wrong.")
  });
}

function renderBill(bill) {
  return `<li class="js-bill-item">
  <span class="hidden" id="bill-id"></span>
  <button class="collapsible">${bill.billName}</button>
    <div class="content">
        <p>Due date: ${bill.dueDate}</p>
        <p>Amount: ${bill.amount}</p>
        <p>Website: ${bill.billWebsite}</p>
        <button class="js-bill-item-delete" data-billID="${bill.id}"><i class="far fa-trash-alt"></i></button>
        <button class="js-bill-item-edit" data-billID="${bill.id}"><i class="fas fa-edit"></i></button>
    </div>
  </li>`
}

function renderAllBills(responseJson) {
  $('.js-bill-list').empty();
  for (let i = 0; i < responseJson.length; i++) {
    let bill = responseJson[i];
    $('.js-bill-list').append(renderBill(bill));
  }
}

// POST bills


// Listen for new bill submit
function submitNewBill() {
  $('#new-bill-form').on('submit', function(event) {
    event.preventDefault();
    const newBill = {
      billName: $('#billName').val().trim(),
      amount: $('#billAmount').val(),
      billWebsite: $('#billWebsite').val().trim(),
      dueDate: $('#date-input').val().trim()
    }
    postBill(newBill)
    closeModal();
  });
}

// posts bill
function postBill(newBill) {
  fetch('/api/bills',
  {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
    },
    method: "POST",
    body: JSON.stringify(newBill)
  })
  .then(response => {
    fetchBills();
    return response.json()
  })
  .catch(error => console.log('Bad request'));
}

// PUT bill

function getIdtoEditBill() {
  $('.js-bill-list').on('click', '.js-bill-item-edit', function(event) {
    event.preventDefault();
    const billId = $(event.currentTarget)[0].attributes[1].nodeValue;
    getOneBill(billId);
    openEditableModal();
  })
}

function getOneBill(billId) {
  fetch(`api/bills/${billId}`,
  {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
    },
    method: "GET"
  })
  .then(response => {
    return response.json()
  })
  .then(responseJson => {
    console.log('responseJson', responseJson);
    populateModal(responseJson);
  })
  .catch(error => console.log('Bad request'));
}

function populateModal(responseJson) {
  $("#bill-id").text(`${responseJson.id}`);
  $('#edit-billName').val(`${responseJson.billName}`)
  $('#edit-billAmount').val(`${responseJson.amount}`)
  $('#edit-billWebsite').val(`${responseJson.billWebsite}`)
}

function handleEditSubmit() {
  $('#edit-form').on('submit', function(event) {
    event.preventDefault();
    const editedBill = {
      id: $('#bill-id').text(),
      billName: $('#edit-billName').val().trim(),
      amount: $('#edit-billAmount').val(),
      billWebsite: $('#edit-billWebsite').val().trim(),
      dueDate: $('#edit-date-input').val().trim()
    }
    submitEditedBill(editedBill);  
  });
}

function submitEditedBill(editedBill) {
  fetch(`api/bills/${editedBill.id}`,
  {
    headers : {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
    },
    method: "PUT",
    body: JSON.stringify(editedBill)
  })
  .then(response => {
    closeModal();
    fetchBills();
  })
  .catch(error => console.log('error'));
}

let modal = $('#new-bill-modal');
let editableModal = $('#editable-modal')
let modalBtn = $('#new-bill');
let closeBtn = $('.closeBtn');

modalBtn.on('click', openModal);

closeBtn.on('click', closeModal);

$(window).on('click', outsideClick);

function openModal() {
  modal.show();
}

function openEditableModal() {
  editableModal.show();
}

function closeModal() {
  modal.hide();
  editableModal.hide();
}

function outsideClick(e) {
  if (e.target == modal[0]) {
    modal.hide();
  }
  else if (e.target == editableModal[0]) {
    editableModal.hide();
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

function handleBillDelete() {
  $('.js-bill-list').on('click', '.js-bill-item-delete', function(e) {
    e.preventDefault();
    $(e.currentTarget).closest('.js-bill-item').remove();
  });
}

function handleApp() {
  getAuthToken();
  fetchBills();
  getIdtoEditBill();
  handleEditSubmit();
  handleSignOut();
  handleCollapsible();
  submitNewBill();
  handleBillDelete();
}

$(handleApp);

