const router = require('express').Router();
const request = require('request');
const config = require('../app/models/config');

request.get(config.apiUrl + '/trucks', (err, response, body) => {
        if (!err && response.statusCode == 200)
            return response.render('index', {trucks: JSON.parse(body)});
        else return response.render('index', {trucks: []});
});


router.post('/login', (req, res, next) => {
    request.post(config.apiUrl + '/auth/token', { form: req.body }).pipe(res);
});

router.get('/logout', (req, res, next) => {
    return res.render('logout');
});

router.get('/register', (req, res, next) => {
    return res.render('register');
});

router.post('/register', (req, res, next) => {
    request.post(config.apiUrl + '/users', {form: req.body}).pipe(res);
});

router.post('/admin/makeadmin', (req, res, next) => {
    if (!req.body.id) return res.sendStatus(400);
    request.post(config.apiUrl + '/admins/' + req.body.id, {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.post('/admin/removeadmin', (req, res, next) => {
    if (!req.body.id) return res.sendStatus(400);
    request.delete(config.apiUrl + '/admins/' + req.body.id, {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.post('/admin/deleteuser', (req, res, next) => {
    if (!req.body.id) return res.sendStatus(400);
    request.delete(config.apiUrl + '/users/' + req.body.id, {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.get('/admin/users', (req, res, next) => {
    return res.render('users');
});

router.get('/admin/getusers', (req, res, next) => {
    request.get(config.apiUrl + '/users', {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.get('/admin/pending', (req, res, next) => {
    return res.render('pending');
});

router.get('/admin/getpending', (req, res, next) => {
    request.get(config.apiUrl + '/users/pending', {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.get('/getMenu', (req, res, next) => {
    request.post(config.apiUrl + '/trucks/'+ { form: req.body }).pipe(res);
});

module.exports = router;
