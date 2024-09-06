const express = require('express');
const router = express.Router();
const UserCtrl = require('../controllers/user');

const api = {
	user: {
		checkToken: '/get/api/user/checkToken',
		getAll: '/get/api/user/getAll',
		getProfile: '/get/api/user/getProfile',
		register: '/post/api/user/register',
		login: '/post/api/user/login',
	},
};

router.get(api.user.checkToken, UserCtrl.checkToken);
router.get(api.user.getAll, UserCtrl.getAll);
router.get(api.user.getProfile, UserCtrl.getProfile);
router.post(api.user.register, UserCtrl.register);
router.post(api.user.login, UserCtrl.login);

module.exports = router;
