let util = require('../../utils/util.js');
let requestFunc = require('../../utils/request.js');
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
		curContent: {},
		showBuyModal: false
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
		console.log(that.data,"that.data");
		requestFunc.requestFunc({
			url: '/multimedia/bg-pictures',
			method: "GET",
			data: {
				userId: that.data.user.data.id
			}
		}).then((data) => {
				that.setData({
					work_bgs: data.data,
				});
				that.setData({
					curBg: that.data.work_bgs[0].pictureUrl,
					curContent: that.data.work_bgs[0]
				});
		})
		// wx.request({
		// 	url: util.svrUrl + '/work_bgs.php',
		// 	data: {
		// 		auth_key: util.authKey,
		// 		user_id: that.data.user.user_id,
		// 	},
		// 	success: function (res) {
		// 		console.log(res);
		// 		that.setData({
		// 			work_bgs: res.data,
		// 		});
		// 		that.setData({
		// 			curBg: that.data.work_bgs[ 0 ].wobg_url,
		// 		});
		// 	}
		// });
	},
	swiperChange: function (e) {
		var currentItemId = e.detail.currentItemId;
		console.log(currentItemId, 'currentItemId')
		this.setData({
			currentItemId: currentItemId
		});
		that.setData({
			curBg: that.data.work_bgs[currentItemId].pictureUrl,
			curContent: that.data.work_bgs[currentItemId]
		});
	},
	gotoCreateB() {
		requestFunc.requestFunc({
			url: '/works/count',
			method: "POST",
			data: {
				userId: this.data.user.data.id
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			if (data.result == 0) {
				let id = that.data.work_bgs[that.data.currentItemId].id;
				wx.navigateTo({
					url: '/pages/create_b/create_b?wobg_id=' + id,
				});
			} else {
				if (that.data.work_bgs[that.data.currentItemId].used == 0) {
					let id = that.data.work_bgs[that.data.currentItemId].id;
					wx.navigateTo({
						url: '/pages/create_b/create_b?wobg_id=' + id,
					});
				} else {
					wx.showToast({
						title: '请先购买背景画作',
						icon: 'none',
						duration: 2000
					})
				}
			}
			this.setData({showBuyModal: false})
		})
	},
	clickChange: function (e) {
		var itemId = e.currentTarget.dataset.itemId;
		that.setData({
			curBg: that.data.work_bgs[itemId].pictureUrl,
			curContent: that.data.work_bgs[itemId],
			currentItemId: itemId
		});
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
	buyPicStory() {
		this.setData({showBuyModal: true})
	},
	onConfirm() {
		console.log("购买画作");
		requestFunc.requestFunc({
			url: '/works/buy-bg-picture',
			method: "POST",
			data: {
				userId: this.data.user.data.id,
				pictureId: this.data.work_bgs[this.data.currentItemId].id
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			if (data.result == 0) {
				let work_bgs = this.data.work_bgs
				work_bgs[this.data.currentItemId].used = 0
				this.setData({work_bgs})
				let id = this.data.work_bgs[this.data.currentItemId].id;
				wx.navigateTo({
					url: '/pages/create_b/create_b?wobg_id=' + id,
				});
			} else {
				wx.showToast({
					title: '购买失败，请重试',
					icon: 'none',
					duration: 2000
				})
			}
			this.setData({showBuyModal: false})
		})
	},
	onCancal() {
		this.setData({showBuyModal: false})
	}
})