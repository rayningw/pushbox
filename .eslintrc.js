module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es6": true
	},
	"extends": ["eslint:recommended", "plugin:react/recommended"],
	"installedESLint": true,
	"parserOptions": {
		"ecmaFeatures": {
			"experimentalObjectRestSpread": true,
			"jsx": true
		}
	},
	"plugins": [
		"react"
	],
	"rules": {
		"indent": [
			"error",
			2
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"semi": [
			"error",
			"always"
		],
		// TODO(ray): Remove override once we inject a logger
		"no-console": [
			"error",
			{ "allow": ["log", "error"] }
		],
		"no-mixed-spaces-and-tabs": [
			"error",
			"smart-tabs"
		]
	}
};
