var modal = document.getElementsByClassName('modal')[0];
var jumbotron = document.getElementsByClassName('jumbotron');
var form = document.forms[0];
//var cart = {};

//renderIndex();

function login() {
	var form = document.forms[1];
	displayError('');
	var emptyFields = checkRequired(form);
	if (emptyFields.length)
		return emptyFields.forEach(error);
	var data = {
		email: form.email.value,
		password: form.password.value
	};

	fetch('/login', {
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		body: JSON.stringify(data)
	}).then(function(res) {
		if (!res.ok) return errorHandler(res);
		res.json().then(loginSuccess);
	}).catch(errorHandler);
}

function loginSuccess(res) {
	$("#login-modal").modal("hide");
	$("#register-modal").modal("hide");
	localStorage.token = res.token;
	var x = atob(res.token.split('.')[1]);
	var payload = JSON.parse(x);
	if(payload["isAdmin"]){
		for(var i = 0; i < document.getElementsByClassName("user-view").length; i++){
			var userViewClass = (document.getElementsByClassName("user-view")[i]).classList;
			userViewClass.add("hidden");
			var adminViewClass = (document.getElementsByClassName("admin-view")[i]).classList;
			adminViewClass.remove("hidden");

		}
	}
	loginInit(payload);
}




function loginInit(info) {
	var navbar = document.getElementById('navbar');
	// greet
	if (info.firstName || info.email) {
		var greeting = document.createElement('navbar-left');
		greeting.setAttribute('class', 'h2');
		greeting.innerHTML = 'Hello, ' + (info.firstName || info.email) + '!';
		if (info.isAdmin) {
			// var users = document.createElement('a');
			// users.setAttribute('class', 'quiet-link navbar-item');
			// users.href = '/admin/users';
			// users.innerHTML = 'Manage Users'
			// navbar.insertBefore(users, navbar.firstChild);

   //          var pending = document.createElement('seePending');
   //          pending.setAttribute('class', 'quiet-link navbar-item');
   //          pending.innerHTML = 'See Pending'
   //          pending.onclick = fetchPending();
   //          navbar.insertBefore(pending, navbar.firstChild);
		}
		navbar.appendChild(greeting);

	}

	//replace register/login with logout
	var elem = document.getElementById('register');
    elem.parentNode.removeChild(elem);
    var elem = document.getElementById('login');
    elem.parentNode.removeChild(elem);

	var logout = document.createElement('button');
	logout.setAttribute('class', 'button btn btn-lg pull-right navbar-btn');
	logout.setAttribute('id', 'logout');
	logout.setAttribute('onclick', 'location.href = "/logout"')
	logout.innerHTML = 'Logout';
	navbar.appendChild(logout);

	var history = document.createElement('button');
	history.setAttribute('class', 'button btn btn-lg pull-right navbar-btn');
	history.innerHTML = 'History';
	history.setAttribute('data-target','#history-modal');
	history.setAttribute('data-toggle','modal');
	navbar.appendChild(history);

	var editUser = document.createElement('button');
	editUser.setAttribute('class', 'button btn btn-lg pull-right navbar-btn');
	editUser.innerHTML = 'Edit Account';
	editUser.setAttribute('data-target', '#editUser-modal');
	editUser.setAttribute('data-toggle', 'modal');
	navbar.appendChild(editUser);


	console.log("adminView is run");
	var x = atob((localStorage.token).split('.')[1]);
	var payload = JSON.parse(x)
	if(payload["isAdmin"]){
		console.log("isAdmin is returning true")
		for(var i = 0; i < document.getElementsByClassName("user-view").length; i++){
			var userViewClass = (document.getElementsByClassName("user-view")[i]).classList;
			userViewClass.add("hidden");
			var adminViewClass = (document.getElementsByClassName("admin-view")[i]).classList;
			adminViewClass.remove("hidden");
			}
		}
}


function orderHistory() {
	fetch('/history', {
		headers: headers(),
		method: 'GET',
	}).then(function(res) {
		if (!res.ok) {
			var messageBlock = document.createElement("h3");
			var message = document.createTextNode("No Order History Found")
			messageBlock.appendChild(message);
			var modalMessage = document.getElementsById("history-list");
			modalMessage.appendChild(messageBlock);
		}
		if (document.getElementById("history-list")) {
			document.getElementById("modal-form-submit").click();
		} else {
			res.json().then(loginSuccess);
		}
	}).catch(errorHandler);
}

// allows us to submit with enter key
function submitOnEnterKey(submitFunction, targetForm) {
    targetForm = targetForm || form;
    var runOnKeydown = function(e) { if (e.keyCode === 13) submitFunction(); }
    var children = targetForm.childNodes;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.getAttribute('class') === 'form')
            submitOnEnterKey(submitFunction, child);
        var type = child.getAttribute('type');
        if (type === 'text' || type === 'email' || type === 'password' ||
                type === 'number' || type === 'phone')
            child.onkeydown = runOnKeydown;
    }
}

function register() {
	var form = document.forms[0];
	clearError(form.firstName);
	clearError(form.email);
	clearError(form.password);
	clearError(form.repassword);
	clearError(form.phone);
	clearError(form.phoneProvider);
	clearError(form.venmo);

	var data = getFormData(form);
	if(!validateEmail(form.email) && document.getElementById('email').value){
		document.getElementById('emailError2').classList.remove('hidden');
	}

	if (data.password !== form.repassword.value) {
		var errorMessage = "<br />Passwords don't match";
		error(form.password);
		error(form.repassword);
		document.getElementById('passwordMatchError').classList.remove('hidden');

	}
	else var errorMessage = '';

	var alertText = document.getElementsByClassName('help-block');
	for(var i = 0; i < alertText.lenght; i++) {
		alertText[i].classList.add('hidden');
	}


	var emptyFields = checkRequired(form);
	if (emptyFields.length) {
		emptyFields.forEach(function(element) {
			document.getElementById(element.getAttribute('missingError')).classList.remove('hidden');
		});
	}
	//
	// if(!validateEmail(form.email)){
	// 	//document.getElementById('emailError2').classList.remove('hidden');
	// }

	if (errorMessage)
		return displayError(errorMessage.substr(6));

	fetch('/register', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify(data)
	}).then(function(res) {
		if (!res.ok) return errorHandler(res);
		res.json().then(loginSuccess);
		renderIndex();
	}).catch(errorHandler);
}

function successHandler(res) {
	if (!res.ok) return errorHandler(res);
	location.reload(true);
}

function errorHandler(err, message) {
	if (err.status >= 400 && err.status < 500)
		return err.text().then(function(message) { displayError(message) });
	if (message) return displayError(message);
	return displayError('There was a problem submitting your form. Please try again later');
}

function validateElement(target, showError) {
	if (target.hasAttribute('data-regex'))
		var regex = new RegExp(target.getAttribute('data-regex').replace('\\', '\\\\'));
	else var regex = /^.+/;
	var isValid = regex.test(target.value);
	if (showError && !isValid) {
		error(target);
		displayError(target.getAttribute('data-message'));
	}
	return isValid;
}

function displayError(message) {
	var errorDiv = document.getElementById('js-error-message');
	if(!displayError) {
		return errorDiv.style.visibility = ''
	}
	if (!errorDiv) return console.log(message);
	errorDiv.innerHTML = message;
	errorDiv.style.visibility = 'visible';
}

function checkRequired(target, emptyFields) {
	var emptyFields = emptyFields || [];
	var children = target.childNodes;
	for (var i = 0; i < children.length; i++) {
		var c = children[i];
		if (c.nodeType !== 1) continue;
		if (c.hasAttribute('data-regex'))
			var regex = new RegExp(c.getAttribute('data-regex').replace('\\', '\\\\'));
		else var regex = /^.+/;
		if (c.hasAttribute('required') && !regex.test(c.value)) emptyFields.push(c);
		checkRequired(c, emptyFields);
	};
	return emptyFields;
}

function error(target) {
	target.style.border = '3px solid #f00';
}

function clearError(target, alsoClearError) {
	target.style.border = '';
	if (alsoClearError) displayError('');
}

function getFormData(form, data) {
	data = data || {};
	var children = form.childNodes;
	for (var i = 0; i < children.length; i++) {
		var c = children[i];
		if (c.nodeType !== 1) continue;
		if (c.value && c.name && !data[c.name]) data[c.name] = c.value;
		getFormData(c, data);
	};
	return data;
}

function fetchUsers() {
	if(!localStorage.token) window.location = '/';
	fetch('/admin/getusers', { headers: { 'x-access-token': localStorage.token } })
		.then(function(res) {
			if (!res.ok)
				return adminErrorHandler(res, document.getElementById('js-users'));
			res.json().then(function(users) { populateUsersPage(users) })
		}).catch(adminErrorHandler);
}

function populateUsersPage(users) {
	var userDiv = document.getElementById('js-users');
	users.forEach(function(u) {
		var div = document.createElement('div');
		div.setAttribute('class', 'user');
		var email = document.createElement('div');
		email.setAttribute('class', 'user-email');
		email.innerHTML = u.email;
		div.appendChild(email);
		var admin = document.createElement('div');
		admin.setAttribute('class', 'user-button button button-inline');
		if (u.isAdmin) {
			admin.innerHTML = 'Remove Admin';
			admin.setAttribute('onclick', 'removeAdmin("' + u._id + '", this)');
		} else {
			admin.innerHTML = 'Make Admin';
			admin.setAttribute('onclick', 'makeAdmin("' + u._id + '", this)');
		}
		div.appendChild(admin);
		var del = document.createElement('div');
		del.setAttribute('class', 'user-button button button-inline warning');
		del.innerHTML = 'Delete';
		del.setAttribute('onclick', 'deleteUser("' + u._id + '", this)');
		div.appendChild(del);
		userDiv.appendChild(div);
	});
}

function fetchItems() {
	if(!localStorage.token) window.location = '/';
	fetch('/admin/getitems', { headers: { 'x-access-token': localStorage.token } })
		.then(function(res) {
			if (!res.ok)
				return adminErrorHandler(res, document.getElementById('items'));
			res.json().then(function(users) { populateItemsPage(users) })
		}).catch(adminErrorHandler);
}

// function populateItemsPage(items) {
// 	var itemDiv = document.getElementById('items');
// 	items.forEach(function(i) {
// 		var div = document.createElement('div');
// 		div.setAttribute('class', 'item');
// 		var imgWrap = document.createElement('div')
// 		imgWrap.setAttribute('class', 'item-img-wrap');
// 		var img = document.createElement('img');
// 		img.setAttribute('class', 'item-img');
// 		img.src = i.img || defaultImg;
// 		imgWrap.appendChild(img);
// 		div.appendChild(imgWrap);
// 		var info = document.createElement('div');
// 		info.setAttribute('class', 'item-info-wrap');
// 		var name = document.createElement('div');
// 		name.setAttribute('class', 'item-name');
// 		name.innerHTML = i.name;
// 		info.appendChild(name);
// 		var price = document.createElement('div');
// 		price.setAttribute('class', 'item-price');
// 		price.innerHTML = '$' + i.price;
// 		info.appendChild(price);
// 		var edit = document.createElement('div');
// 		edit.setAttribute('class', 'item-buy-button button button-inline');
// 		edit.onclick = function() { editItem(i); };
// 		edit.innerHTML = 'Edit';
// 		info.appendChild(edit);
// 		var del = document.createElement('div');
// 		del.setAttribute('class', 'item-buy-button button button-inline warning');
// 		del.setAttribute('onclick', 'deleteItem("' + i._id + '", this)');
// 		del.innerHTML = 'Delete';
// 		info.appendChild(del);
// 		div.appendChild(info);
// 		itemDiv.appendChild(div);
// 	});
// }

function fetchPending() {
	//if(!localStorage.token) window.location = '/';
	fetch('/admin/getpending', { headers: { 'x-access-token': localStorage.token } })
		.then(function(res) {
			if (!res.ok)
				return adminErrorHandler(res, document.getElementById('js-pending'));
			return res.json().then(function(pending) { populatePendingPage(pending) })
		}).catch(adminErrorHandler);
}

function populatePendingPage(pending) {
	var pendingDiv = document.getElementById('js-pending');
	console.log(pending);
	pending.forEach(function(u) {
		var div = document.createElement('div');
		div.setAttribute('class', 'pending-user');
		var email = document.createElement('h3');
		email.setAttribute('class', 'pending-user-email center');
		email.innerHTML = u.email;
		div.appendChild(email);
		var wrap = document.createElement('div');
		wrap.setAttribute('class', 'pending-wrap');
		u.purchases.forEach(function(p) {
			var pending = document.createElement('div');
			pending.setAttribute('class', 'pending');
			var item = document.createElement('h4');
			item.setAttribute('class', 'pending-item');
			item.innerHTML = p.name;
			var quantity = document.createElement('div');
			quantity.setAttribute('class', 'pending-quantity');
			quantity.innerHTML = 'x' + p.quantity;
			var price = document.createElement('div');
			price.setAttribute('class', 'pending-price');
			price.innerHTML = 'Total: $' + (p.quantity * p.price);
			var paid = document.createElement('div');
			paid.setAttribute('class', 'button button-inline pending-button');
			paid.innerHTML = 'Mark Paid';
			var delivered = document.createElement('div');
			delivered.setAttribute('class', 'button button-inline pending-button');
			delivered.innerHTML = 'Mark Delivered';
			pending.appendChild(item);
			pending.appendChild(quantity);
			pending.appendChild(price);
			pending.appendChild(paid);
			pending.appendChild(delivered);
			wrap.appendChild(pending);
		});
		div.appendChild(wrap);
		pendingDiv.appendChild(div);
	});
}

function adminErrorHandler(err, target) {
	if (err.status && err.status >= 400 && err.status < 500)
		return window.location = '/';

	var error = document.createElement('h2');
	error.setAttribute('class', 'error center');
	error.innerHTML = 'Error fetching data';
	target.appendChild(error);
}

function showAddItem() {
	showModal(true);
	document.forms[0].firstChild.innerHTML = 'Add Item';
}

function submitItem() {
	var form = document.forms[0];
	displayError('');
	var emptyFields = checkRequired(form);
	if (emptyFields.length)
		return emptyFields.forEach(error);
	var data = getFormData(form);

	if (!data.id) {
		fetch('/admin/items', {
			headers: headers(),
			method: 'POST',
			body: JSON.stringify(data)
		}).then(successHandler)
			.catch(errorHandler);
	} else {
		fetch('/admin/items', {
			headers: headers(),
			method: 'PUT',
			body: JSON.stringify(data)
		}).then(successHandler)
			.catch(errorHandler);
	}
}

function editItem(item) {
	showModal(true);
	var form = document.forms[0];
	form.firstChild.innerHTML = 'Edit Item';
	form.name.value = item.name;
	form.img.value = item.img || '';
	form.description.value = item.description || '';
	form.price.value = item.price;
	// TODO fix race condition using relative numbers
	form.inventory.value = item.inventory || '';
	form.id.value = item._id;
}

function deleteItem(id, div) {
	fetch('/admin/deleteitem', {
		headers: headers(),
		method: 'POST',
		body: JSON.stringify({ id: id })
	}).then(function(res) {
		if (!res.ok) throw new Error('There was an error deleting that item');
		var removeNode = div.parentNode.parentNode;
		removeNode.parentNode.removeChild(removeNode);
	}).catch(function(err) { console.log(err); });
}

function makeAdmin(id, button) {
	fetch('/admin/makeadmin', {
		headers: headers(),
		method: 'POST',
		body: JSON.stringify({ id: id })
	}).then(function(res) {
		if (!res.ok) throw new Error('There was an error removing admin privs');
		button.innerHTML = 'Remove Admin';
		button.setAttribute('onclick', 'removeAdmin("' + id + '", this)');
	}).catch(function (err) { console.log(err); });
}

// removes admin privs
function removeAdmin(id, button) {
	fetch('/admin/removeadmin', {
		headers: headers(),
		method: 'POST',
		body: JSON.stringify({ id: id })
	}).then(function(res) {
		if (!res.ok) throw new Error('There was an error remove admin privs');
		button.innerHTML = 'Make Admin';
		button.setAttribute('onclick', 'makeAdmin("' + id + '", this)');
	}).catch(function (err) { console.log(err); });
}

function deleteUser(id, button) {
	fetch('/admin/deleteuser', {
		headers: headers(),
		method: 'POST',
		body: JSON.stringify({ id: id })
	}).then(function(res) {
		if (!res.ok) throw new Error('There was an error deleting the user');
		var removeNode = button.parentNode;
		removeNode.parentNode.removeChild(removeNode);
	}).catch(function(err) { console.log(err) });
}

function headers() {
	return {
		'x-access-token': localStorage.token,
		'Content-Type': 'application/json'
	};
}

// ==========================================================
// Buy page
// ==========================================================

function buy() {
    var c = sessionStorage.getItem('cart');

    console.log('this is c:', c);
	fetch('/buy', {
		method: 'POST',
		headers: headers(),
		body: c,
	}).then(buySuccess)
	.catch(buyError);
}

function buySuccess(res) {
    $("#cart-modal").modal("hide");
    $("#purchased-modal").modal();
	if (!res.ok) return buyError(res);
}

function buyError(err) {
	if (err.status >= 400 && err.status < 500)
		return err.text().then(function(message) { console.log(message) });
	return console.log('There was a problem submitting your form. Please try again later');
}

// ==========================================================
// Modal
// ==========================================================

function showModal(toClearForm) {
	modal.style.display = 'block';
	if (toClearForm) document.forms[0].reset();
}
function hideModal() { modal.style.display = ''; }

// ==========================================================
// Rendering
// ==========================================================
function renderIndex(){
    // var ul = dropdowns.createElement("ul");  // Create with DOM
    // ul.class = "list-group";
    // for(var i = 0; i<activeTrucks[0].length; i++){
    //     var list = ul.createElement("li");
    //     list.class = "list-group-item justify-content-between";
    //     list.innerHTML = activeTrucks[0].menu[i].name;
    //     var select = list.createElement("span");
    //     select.innherHTML = "Order"
    // }
    jumbotron.show();
    dropdowns.show();
}

function renderRegister(){
    register.show();
}

function createCart(){
    if (!localStorage.token){
        return $("#login-modal").modal();
        //return modal.style.display = 'block';
    }
    var selected = [];
    var totalPrice = 0;
    var truckId = event.target.id;
    var truck;
    var menus = document.getElementsByClassName(truckId+'menuItem');
    // console.log("menu: " +menus);
    for(var i = 0; i<menus.length; i++){
        console.log("menu: " +menus[i]);
        //console.log(menus);
        //if(menus[i].id===)
        var itemName = menus[i].innerText.split(' ')[0];
        var itemPrice = +menus[i].innerText.split(' ')[1].slice(1).trim();
        console.log('itemPrice: ' + itemPrice);
        var quant = $('#'+truckId+itemName).val();
        if (+quant !== 0){
            selected.push({
                    price: itemPrice,
                    name: itemName,
                    quantity: +quant
                });
            totalPrice += (itemPrice)*(+quant);
        }
    }
    var cart = {
            truck: truckId,
            purchasedItems: selected,
			purchasedItemsLength: selected.length,
            paid: new Date,
            totalPrice: +totalPrice
    };

    sessionStorage.setItem('cart', JSON.stringify(cart));

    var data = sessionStorage.getItem('cart');
    console.log("data in createcart: " + data);
    //onlcik ord
    populateCartModal(data);
    }

function populateCartModal(cart) {

	// console.log("data json.stringify: " + JSON.stringify(cart));
	console.log("data json.parse: " + JSON.parse(cart));

    var cartModal = document.getElementById('cart-modal-header');
    var cartData = JSON.parse(cart);
    console.log('cartdata purchased items:', cartData["purchasedItems"]);
    cartData["purchasedItems"].forEach(function(item) {
        console.log("for each item:");
        console.log(item);
        var div = document.createElement('div');
        div.setAttribute('class', 'item');
            var quantity = document.createElement('span');
            quantity.setAttribute('class', 'left');
            quantity.innerHTML = item.quantity+' ';
            div.appendChild(quantity);

            var name = document.createElement('span');
            name.setAttribute('class', 'left');
            name.innerHTML = item.name+'.................';
            div.appendChild(name);

            var price = document.createElement('span');
            price.setAttribute('class', 'right');
            price.innerHTML = '$'+(item.price*item.quantity);
            div.appendChild(price);

        cartModal.appendChild(div);
        var cartSubmit = document.getElementById('buy');
        cartSubmit.onclick = buy(cart);

    });
    var total= document.createElement('div');
    total.setAttribute('class', 'center');
    total.innerHTML = 'Total................$'+ cartData["totalPrice"];
    cartModal.appendChild(total);

    $("#cart-modal").modal();
}

    //find truck where id = truck id
    //FETCH REQUEST TO GET TRUCK OBJECT to get menu

    // fetch('/getTruckById/'+truckId, { headers: { 'x-access-token': localStorage.token } })
    //     .then(function(res) {
    //         if (!res.ok) return;
    //             //return adminErrorHandler(res, document.getElementById('trucks'));//will probably error
    //         res.json()
    //         .then(function(truckJson) {
    //             console.log(truckJson);
    //             for(var i=0; i<truckJson.menu.length; i++){
    //                 var quant = $('#'+truck.menu[i]._id).val();
    //                 if ($('#'+quant).val() !== 0){
    //                     selected.push({
    //                         item: {
    //                             price: truck.menu[i].price,
    //                             name: truck.menu[i].name,
    //                             quantity: quant
    //                         }
    //                     })
    //                 }

    //             }
    //             var cart = {
    //                 truck: truckId,
    //                 purchasedItems: selected,
    //                 paid: new Date
    //             }
    //         })
    //     }).catch(adminErrorHandler);


    // for(var i=0; i<activeTrucks.length; i++){
    //     console.log("active: " + activeTrucks[i]);
    //     if(activeTrucks[i]._id === truckId){
    //         truck = activeTrucks[i];
    //         console.log(truck);
    //     }
    // }



// function renderMenu(truckId){
//     if(!localStorage.token) renderIndex();
//     fetch('/getMenu', { headers: { 'x-access-token': localStorage.token } })
//         .then(function(res) {
//             if (!res.ok) return
//                 // return adminErrorHandler(res, document.getElementById('items'));
//             res.json().then(function(users) { populateItemsPage(users) })
//         }).catch(adminErrorHandler);
//     register.show();
// }

$(document).on('click', '.btn-number', function (e) {
	console.log("button was hit");
	e.preventDefault();

	itemName  = $(this).attr('qid');
    fieldName = $(this).attr('data-field');
    type      = $(this).attr('data-type');
	console.log(itemName);
    var input = $("input[bid='"+itemName+"']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if(type == 'minus') {

            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            }
            if(parseInt(input.val()) == input.attr('min')) {
                return;
            }

        } else if(type == 'plus') {

            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if(parseInt(input.val()) == input.attr('max')) {
				return;
            }

        }
    } else {
        input.val(0);
    }
});
$(document).on('focusin', '.input-number', function (e) {
	console.log("focus thing is working");
   $(this).data('oldValue', $(this).val());
});

$(document).on('change', '.input-number', function (e) {
	console.log("reset is working");
    minValue =  parseInt($(this).attr('min'));
    maxValue =  parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());

    name = $(this).attr('name');
    if(valueCurrent >= minValue) {
        $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the minimum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    if(valueCurrent <= maxValue) {
        $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the maximum value was reached');
        $(this).val($(this).data('oldValue'));
    }


});
$(document).on('keydown', '.input-number', function (e) {
		console.log("keydown thing is working")
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
});

$(document).on('click', "#testbtn", function() {
console.log("test button things works");
});

function validateEmail(mail)
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
}
