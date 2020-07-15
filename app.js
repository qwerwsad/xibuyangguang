var util = require('./utils/util.js');
App({
	data: {
		// 自定义titlebar相关设置

    },
	onLaunch: function () {
		let that = this;
		// 登录
		util.loginSync().then(function ( res ) {
			console.log(res, 'onLaunch', that.employIdCallback )
			if ( that.employIdCallback ) {
				that.employIdCallback( res );
			}
		});
	},
	globalData: {
		user: null,
	},
})