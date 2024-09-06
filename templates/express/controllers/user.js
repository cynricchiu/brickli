const CONFIG = require('../bin/config');
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 验证token是否有效
const checkToken = async (req, res) => {
	const { authorization } = req.headers;
	const token_raw = String(authorization).split(' ').pop();
	try {
		const { id } = jwt.verify(token_raw, CONFIG.PRIVATEKEY);
		const user = await User.findById(id);
		if (user) {
			return res.status(200).send({ data: user, message: '验证通过' });
		}
		return res.status(422).send({ data: null, message: '验证失败:用户不存在' });
	} catch (err) {
		return res.status(422).send({ data: null, message: '验证失败:token过期' });
	}
};

// 查询所有用户信息
const getAll = async (req, res) => {
	const users = await User.find();
	return res.status(200).send({ data: users, message: '查询完成' });
};

// 查询某一用户信息
const getProfile = async (req, res) => {
	const { username } = req.body;
	const user = await User.findOne({ username });
	if (user) {
		return res.status(200).send({ data: user, message: '查询成功' });
	}
	return res.status(422).send({ data: null, message: '查询失败:用户不存在' });
};

// 注册新用户
const register = async (req, res) => {
	const { username, password } = req.body;
	const user = await User.exists({ username });
	if (!user) {
		const newUser = await User.create({
			username,
			password,
		});
		console.log('新用户已创建');
		return res.status(200).send({ data: newUser, message: '新用户已创建' });
	} else {
		console.log('用户名已存在');
		return res.status(200).send({ data: null, message: '用户名已存在' });
	}
};

// 无token登录
const login = async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username });
	if (!user) {
		console.log('用户名不存在');
		return res.status(422).send({ data: null, message: '用户名不存在' });
	} else {
		const isPasswordValid = bcrypt.compareSync(password, user.password);
		if (isPasswordValid) {
			// token
			const token_short = jwt.sign(
				{
					id: String(user._id),
				},
				CONFIG.PRIVATEKEY,
				{ expiresIn: CONFIG.expiresInShort }
			);
			const token_long = jwt.sign(
				{
					id: String(user._id),
				},
				CONFIG.PRIVATEKEY,
				{ expiresIn: CONFIG.expiresInLong }
			);
			console.log('登录成功');
			return res.status(200).send({ data: { user, token_short, token_long }, message: '登录成功' });
		} else {
			console.log('密码错误');
			return res.status(422).send({ data: null, message: '密码错误' });
		}
	}
};

module.exports = {
	checkToken,
	getAll,
	getProfile,
	register,
	login,
};
