let util = require('../../utils/util.js');
const app = getApp();
let that;
Page({
	data: {
		user: {},
		wobg_id: 0,
		work_bg: {},
		currentItemId: 1,
		poems: [],
		ifShowPoemStory: 0,
		sponsorShow: 0,
		commentShow: 0,
	},
	onLoad: function (options) {
		that = this;
		if (options.wobg_id == undefined) {
			wx.navigateBack();
		}
		this.setData({
			wobg_id: options.wobg_id
		});

		/////////// test
		this.setData({
			wobg_id: 2
		});
		///////////////

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
		that.getWorkBg();
		that.getPoems();
	},
	getWorkBg() {
		wx.request({
			url: util.svrUrl + '/work_bg.php',
			data: {
				auth_key: util.authKey,
				user_id: that.data.user.user_id,
				wobg_id: that.data.wobg_id,
			},
			success: function (res) {
				// console.log(res);
				that.setData({
					work_bg: res.data,
				});
			}
		});
	},
	getPoems() {
		wx.request({
			url: util.svrUrl + '/poems.php',
			data: {
				auth_key: util.authKey,
				user_id: that.data.user.user_id,
			},
			success: function (res) {
				console.log(res);
				that.setData({
					poems: res.data,
				});
			}
		});
	},
	swiperChange: function (e) {
		var currentItemId = e.detail.currentItemId;
		this.setData({
			currentItemId: currentItemId
		});
	},
	gotoCreateC() {
		let id = that.data.poems[ that.data.currentItemId ].poem_id;
		wx.navigateTo({
			url: '/pages/create_c/create_c?wobg_id=' + id + "&poem_id=" + id,
		})
	},
	clickChange: function (e) {
		var itemId = e.currentTarget.dataset.itemId;
		this.setData({
			currentItemId: itemId
		})
	},
	showPoemStory() {
		that.setData({
			ifShowPoemStory: 1,
		});
	},
	hidePoemStory() {
		that.setData({
			ifShowPoemStory: 0,
		});
	},
	sharePoemStory() {
		
	},
})