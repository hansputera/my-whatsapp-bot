module.exports = {
	'env': {
		'es2021': true,
		'node': true,
	},
	'extends': ['google', 'prettier'],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 13,
		'sourceType': 'module',
	},
	'plugins': ['@typescript-eslint'],
	'rules': {
		'max-len': [
			'error',
			{
				'ignoreTemplateLiterals': true,
			},
		],
	},
};
