let util = require('../../utils/util.js');
let requestFunc = require('../../utils/request.js');
const app = getApp();
let that;
Page({
	data: {
		visitId: '',
	},
	onLoad: function (options) {
		that = this;
		if (options.visitId == undefined) {
			wx.navigateBack();
		}
		console.log(options.visitId, 'options.visitId')
		this.setData({
			visitId: options.visitId
		});

		if ( app.globalData.user != null ) {
			that.setData({ user: app.globalData.user }); 
			that.init();
		} else {
			app.employIdCallback = res => {
				that.setData({ user: res });
				that.init();
			};
		}
	},
	onReady: function () {
	},
	onShow: function () {
	},
	onShareAppMessage: function () {
	},
	init() {
		that.getFriendsInfo();
	},
	getFriendsInfo() {
		requestFunc.requestFunc({
			url: '/works/list',
			method: "POST",
			data: {
        userId: this.data.user.data.id,
        visitId: "1283642307770343424" || that.data.visitId
			}
		}).then((data) => {
      console.log(data, "data");
			// for (let index = 0; index < data.data.length; index++) {
			// 	if (data.data[index].id == that.data.wobg_id) {
			// 		that.setData({
			// 			work_bg: data.data[index],
			// 		});
			// 	}
			// }
		})
	},
})