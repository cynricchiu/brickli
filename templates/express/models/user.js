const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost:27017/express-user');

const UserSchema = new mongoose.Schema({
	username: { unique: true, type: String },
	password: {
		type: String,
		set(val) {
			return bcrypt.hashSync(val, 10);
		},
	},
});
const User = mongoose.model('User', UserSchema);

module.exports = { User };
