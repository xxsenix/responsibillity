let dayInMilliseconds = 86400000;

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
        <p>Amount: $${bill.amount}</p>
        <p>Website: <a href="http://www.${bill.billWebsite}" target="_blank">${bill.billWebsite}</a></p>
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
      dueDate: convertDate($('#date-input').val())
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
  $('#edit-date-input').val(`${responseJson.dueDate}`)
}

function handleEditSubmit() {
  $('#edit-form').on('submit', function(event) {
    event.preventDefault();
    const editedBill = {
      id: $('#bill-id').text(),
      billName: $('#edit-billName').val().trim(),
      amount: $('#edit-billAmount').val(),
      billWebsite: $('#edit-billWebsite').val().trim(),
      dueDate: convertDate($('#edit-date-input').val())
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

// DELETE bill
function getIdtoDeleteBill() {
  $('.js-bill-list').on('click', '.js-bill-item-delete', function(event) {
    event.preventDefault();
    const billId = $(event.currentTarget)[0].attributes[1].nodeValue;
    if (confirm("Are you sure you want to delete this bill?")) {
      deleteBill(billId);
    }
  });
}

function deleteBill(billId) {
  fetch(`/api/bills/${billId}`,
  {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`
    },
    method: "DELETE",
    body: JSON.stringify(billId)
  })
  .then(response => {
    fetchBills();
    return response.json();
  })
  .catch(error => console.log('Bad request'));
}

// Modal section - handle open and closing of it

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

// Expands the bill when clicked

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

  function convertDate(date) {
    return date.slice(5) + '-' + date.substring(0,4);
  }

function handleApp() {
  getAuthToken();
  fetchBills();
  getIdtoEditBill();
  handleEditSubmit();
  getIdtoDeleteBill();
  handleSignOut();
  handleCollapsible();
  submitNewBill();
}

$(handleApp);

