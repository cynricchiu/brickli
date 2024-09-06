const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.send('主页');
});

// router.get('/login', (req, res) => {
// 	console.log(req.query);
// 	res.send('登录页');
// });

router.post('/login', (req, res) => {
	// req.headers['content-type'] = '"application/x-www-form-urlencoded"';
	console.log(req.body);
	res.send({ OK: 0 });
});

module.exports = router;
