'use strict';

// DB
const { getUser } = require('../../stores/user');

const checkUsernameHandler = async ({ message }, next) => {
	if (!message.entities) {
		return next();
	}
	const messageArr = message.text ? message.text.split(' ') : '';
	const isCommand = /^\/\w+/.test(messageArr[0]);
	const hasMention = message.entities.some(entity =>
		entity.type === 'mention');
	const hasTextMention = message.entities.some(entity =>
		entity.type === 'text_mention');

	if (!isCommand) {
		return next();
	}

	if (hasMention) {
		const [ , username ] = messageArr;
		const isUsername = /^@\w+/.test(username);
		if (!isUsername) {
			return next();
		}
		const user = await getUser({ username: username.replace('@', '') });
		if (user) {
			message.text = message.text.replace(` ${username}`, '');
			message.commandMention = user;
		}
		return next();
	}

	if (hasTextMention) {
		const [ { user } ] = message.entities.filter(entity => entity.user);
		const name = user.first_name;
		if (name.split(' ')[0] !== messageArr[1]) {
			return next();
		}
		message.text = message.text.replace(` ${name}`, '');
		message.commandMention = user;
		return next();
	}
	return next();
};

module.exports = checkUsernameHandler;
