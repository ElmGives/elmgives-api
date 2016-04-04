'use strict';

const email = require('./mandrill');

email.listTemplates()
	.then(msg => console.log(msg))
	.then(() => {
		return email.send('testtemplateone', {
			email: 'hurtado.fernando@gmail.com',
		});
	})
	.then(msg => console.log(msg))
	.catch(err => console.log(err));
