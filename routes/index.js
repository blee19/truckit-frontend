const router = require('express').Router();
const request = require('request');
const config = require('../app/models/config');

router.get('/', (req, res, next) => {
<<<<<<< HEAD
    request.get(config.apiUrl + '/trucks', (err, response, body) => {
=======
    request.get(config.apiUrl + '/items', (err, response, body) => {
>>>>>>> bae66aa7e5873c122b850e6bcb4b625f4e5673bb
        if (!err && response.statusCode == 200)
            return res.render('index', {items: JSON.parse(body)});
        else return res.render('index', {items: []});
    });
});


router.post('/login', (req, res, next) => {
    request.post(config.apiUrl + '/auth/token', { form: req.body }).pipe(res);
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

router.get('/getActiveTrucks', (req, res, next) => {
    request.post(config.apiUrl + '/trucks/').pipe(res);
});

module.exports = router;
