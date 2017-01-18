var modal = document.getElementsByClassName('modal')[0];
var form = document.forms[0];

document.body.onclick = function(e) {
    if (e.target === modal)
        modal.style.display = '';
}

function showModal() { modal.style.display = 'block'; }
function hideModal() { modal.style.display = ''; }

function submitItem() {
    // validation goes here
    
    var data = {
        name: form.name.value,
        img: form.img.value,
        price: form.price.value
    };
    if (form.description.value)
        data.description = form.description.value;
    if (form.inventory.value)
        data.inventory = form.inventory.value;

    // use fetch() to submit a post request to our reverse proxy
    fetch('/items', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    })
    // check to make sure the request was okay. if so, extract the text from
    // the response body
    .then(function(res) {
        if (!res.ok) console.log('Error!');
        return res.text();
    })
    // take the response body and replace the current body with it. the response
    // body is the rendered pug template with either "Success" or "Error" as the
    // title
    .then(function(res) {
        console.log('Success!');
        document.body.innerHTML = res;
    })
    // console.log any error if they occur
    .catch(function(err) {
        console.log('Error!');
        console.log(err);
    });
}

// =============================================================
// Form submit functions
// =============================================================

function submitOnEnterKey(submitFunction, targetForm) {
    targetForm = targetForm || form;
    var runOnKeydown = function(e) { if (e.keyCode === 13) submitFunction(); }
    var children = targetForm.childNodes;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.id && child.id === 'js-admin-info')
            submitOnEnterKey(submitFunction, child);
        var type = child.getAttribute('type');
        if (type === 'text' || type === 'email' || type === 'password' ||
                type === 'number' || type === 'phone')
            child.onkeydown = runOnKeydown;
    }
}

function submitForm() {
    var data = {};
    var errorMessage = '';
    if (form.firstName.value) data.firstName = form.firstName.value;
    if (form.lastName.value) data.lastName = form.lastName.value;
    if (form.classYear.value) data.classYear = form.classYear.value;
    if (form.email.value && !validateEmail(form.email)) {
        errorMessage += 'Email address is invalid.';
    }
    data.email = form.email.value;

    var phone = validatePhone(form.phone, true);
    if (!phone) {
        if (errorMessage) errorMessage += '</br>';
        errorMessage += 'Please enter valid phone number.';
    }
    if (!validateProvider(true)) {
        if (errorMessage) errorMessage += '</br>';
        errorMessage += 'Please select phone provider.';
    }
    if (errorMessage) return displayError(errorMessage);
    data.phone = phone;
    data.phoneProvider = form.phoneProvider.value;
    if (data.phoneProvider === 'other')
        data['other-provider'] = form['other-provider'].value;

    fetch('/', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(submitSuccess)
    .catch(submitError);
}

// TODO
function submitLogin() {
    var errorMessage = ''
    if (!form.email.value) {
        error(form.email);
        errorMessage += 'Missing email!'
    }
    if (!form.password.value) {
        error(form.password);
        if (errorMessage) errorMessage += '<br />'
        errorMessage += 'Missing password!'
    }
    if (errorMessage) return displayError(errorMessage);
    
    var data = {
        email: form.email.value,
        password: form.password.value
    };

    fetch('/login', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(function(res) {
        console.log(res);
        if (!res.ok) return submitError(res);
        else return res.json().then(function(result) {
            localStorage.token = result.token;
            // if(result.isAdmin){
            //     sendToAdminHome();
            // }
            // else{
            //     sendToUserHome();
            // }
        });
    }).catch(submitError);
}

function submitCouponForm() {
}

// =============================================================
// Form submit callbacks
// =============================================================

function submitSuccess(res) {
    if (!res.ok) return submitError(res);
    modal.style.display = 'block';
    clearForm();
}

function submitError(res, message) {
    if (res.status >= 400 && res.status < 500)
        return res.text().then(function(message) {displayError(message)});
    if (message)
        return displayError(message);
    return displayError('There was a problem submitting your form. Please try again later.');
}

function displayError(message) {
    var errorDiv = document.getElementById('js-error-message');
    errorDiv.innerHTML = message;
    errorDiv.style.visibility = 'visible';
}
