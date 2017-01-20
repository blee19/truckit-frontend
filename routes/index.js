const router = require('express').Router();
const request = require('request');
const config = require('../app/models/config');

router.get('/', (req, res, next) => {
    request.get(config.apiUrl + '/trucks', (err, response, body) => {
        if (!err && response.statusCode == 200)
            return res.render('index', {trucks: JSON.parse(body)});
        else return res.render('index', {trucks: []});
    });
});

router.get('/getTruckById/:id', (req, res, next) => {
    request.get(config.apiUrl + '/trucks/'+ req.params.id, (err, response, body) => {
        if (!err && response.statusCode == 200){
            console.log(body);
            return res.json(body);
        }
        else return res.json([]);
    });
});

router.post('/buy', (req, res, next) => {
    if (!req.body) {
        return res.sendStatus(400);
    }
    console.log('req.body:', req.body);
    
    request.post({
        url: config.apiUrl + '/orders/',
        headers: { 'x-access-token': req.headers['x-access-token'] },
        form: req.body
    }).pipe(res);
});

router.post('/login', (req, res, next) => {
    request.post(config.apiUrl + '/auth/token', { form: req.body }).pipe(res);
});

router.get('/logout', (req, res, next) => {
    return res.render('logout');
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

router.get('/history', (req, res, next) => {
    request.get(config.apiUrl + '/orders/' + req.body.id, {
        headers: {'x-access-token': req.headers['x-access-token']}
    }).pipe(res);
});

router.get('/admin/getpending', (req, res, next) => {
    request.get(config.apiUrl + '/users/pending', {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

// THIS NEEDS TO WORK AND DOESNT - maybe not returning anything?
// router.get('/getActiveTrucks', (req, res, next) => {
//     request.get(config.apiUrl + '/trucks', (err, response, body) => {
//         if (!err && response.statusCode == 200)
//             return res.json({trucks: JSON.parse(body)});
//     });
// });

module.exports = router;
