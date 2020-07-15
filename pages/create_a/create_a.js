let util = require('../../utils/util.js');
const app = getApp();
let that;
Page({
	data: {
		user: {},
		currentItemId: 0,
		work_bgs: [],
		curBg: "",
		sponsorShow: 0,
		commentShow: 0,
		ifShowPicStory: 0,
	},
	onLoad: function (options) {
		that = this;
		if ( app.globalData.user != null ) {
			that.setData({ user: app.globalData.user }); 
			that.init();
		} else {
			app.employIdCallback = res => {
				that.setData({ user: res });
				that.init();
			};
		}
		
		that.init();
	},
	onReady: function () {
	},
	onShow: function () {

	},
	onShareAppMessage: function () {
	},
	init() {
		that.getWorkBgs();
	},
	getWorkBgs() {
		wx.request({
			url: util.svrUrl + '/work_bgs.php',
			data: {
				auth_key: util.authKey,
				user_id: that.data.user.user_id,
			},
			success: function (res) {
				console.log(res);
				that.setData({
					work_bgs: res.data,
				});
				that.setData({
					curBg: that.data.work_bgs[ 0 ].wobg_url,
				});
			}
		});
	},
	swiperChange: function (e) {
		var currentItemId = e.detail.currentItemId;
		this.setData({
			currentItemId: currentItemId
		});
		that.setData({
			curBg: that.data.work_bgs[ currentItemId ].wobg_url,
		});
	},
	gotoCreateB() {
		let id = that.data.work_bgs[ that.data.currentItemId ].wobg_id;
		wx.navigateTo({
			url: '/pages/create_b/create_b?wobg_id=' + id,
		});
	},
	clickChange: function (e) {
		var itemId = e.currentTarget.dataset.itemId;
		this.setData({
			currentItemId: itemId
		})
	},
	showPicStory() {
		that.setData({
			ifShowPicStory: 1,
		});
	},
	hidePicStory() {
		that.setData({
			ifShowPicStory: 0,
		});
	},
	sharePicStory() {
		
	},
	
})