const ENV = require('./env');

// 全局变量配置
module.exports = {
	HOST: 'localhost',
	PORT: '8088',
	expiresInShort: 2 * 3600, // token短期过期时间2h
	expiresInLong: 14 * 24 * 3600, // token长期过期时间14天
	PRIVATEKEY: ENV.PRIVATEKEY,
};
