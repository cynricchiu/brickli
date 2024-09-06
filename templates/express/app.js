const CONFIG = require('./bin/config');
const express = require('express');
const indexRouter = require('./routes/indexRouter');
const apiUserRouter = require('./routes/apiUserRouter');
const app = express();

// 中间件
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// routes
// app.use((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	next();
// });
app.use('/', apiUserRouter);
// app.use('/', indexRouter);
app.use((req, res, next) => {
	res.status(500).json({
		message: '访问错误',
	});
});

// server
app.listen(CONFIG.PORT, () => {
	console.log(`http://${CONFIG.HOST}:${CONFIG.PORT}`);
});
