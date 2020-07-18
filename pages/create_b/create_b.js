let util = require('../../utils/util.js');
let requestFunc = require('../../utils/request.js');
const app = getApp();
let that;
Page({
	data: {
		user: {},
		wobg_id: 0,
		work_bg: {},
		currentItemId: 0,
		poems: [],
		ifShowPoemStory: 0,
		sponsorShow: 0,
		commentShow: 0,
		showBuyModal: false
	},
	onLoad: function (options) {
		that = this;
		if (options.wobg_id == undefined) {
			wx.navigateBack();
		}
		console.log(options.wobg_id, 'options.wobg_id')
		this.setData({
			wobg_id: options.wobg_id
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
		that.getWorkBg();
		that.getPoems();
	},
	getWorkBg() {
		// wx.request({
		// 	url: util.svrUrl + '/work_bg.php',
		// 	data: {
		// 		auth_key: util.authKey,
		// 		user_id: that.data.user.user_id,
		// 		wobg_id: that.data.wobg_id,
		// 	},
		// 	success: function (res) {
		// 		// console.log(res);
		// 		that.setData({
		// 			work_bg: res.data,
		// 		});
		// 	}
		// });
		requestFunc.requestFunc({
			url: '/multimedia/bg-pictures',
			method: "GET",
			data: {
				userId: that.data.user.id
			}
		}).then((data) => {
			for (let index = 0; index < data.data.length; index++) {
				if (data.data[index].id == that.data.wobg_id) {
					that.setData({
						work_bg: data.data[index],
					});
				}
			}
		})
	},
	getPoems() {
		requestFunc.requestFunc({
			url: '/multimedia/bg-poetry',
			method: "GET",
			data: {
				userId: that.data.user.id
			}
		}).then((data) => {
			for (let index = 0; index < data.data.length; index++) {
				console.log(data.data[index].pictureUrl.indexOf('https:w'))
				if (data.data[index].pictureUrl.indexOf('https:w') >= 0) {
					console.log(data.data[index].pictureUrl.replace('https:', 'https://'))
					data.data[index].pictureUrl = data.data[index].pictureUrl.replace('https:', 'https://')
				}
			}
			that.setData({
				poems: data.data,
			});
		})
		// wx.request({
		// 	url: util.svrUrl + '/poems.php',
		// 	data: {
		// 		auth_key: util.authKey,
		// 		user_id: that.data.user.user_id,
		// 	},
		// 	success: function (res) {
		// 		console.log(res);
		// 		that.setData({
		// 			poems: res.data,
		// 		});
		// 	}
		// });
	},
	swiperChange: function (e) {
		var currentItemId = e.detail.currentItemId;
		this.setData({
			currentItemId: currentItemId
		});
	},
	gotoCreateC() {
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
				let id = that.data.poems[ that.data.currentItemId ].id;
				wx.navigateTo({
					url: '/pages/create_c/create_c?wobg_id=' + that.data.wobg_id + "&poem_id=" + id,
				})
			} else {
				if (that.data.poems[that.data.currentItemId].used == 0) {
					let id = that.data.poems[ that.data.currentItemId ].id;
					wx.navigateTo({
						url: '/pages/create_c/create_c?wobg_id=' + that.data.wobg_id + "&poem_id=" + id,
					})
				} else {
					wx.showToast({
						title: '请先购买诗歌',
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
	buyPoemStory() {
		this.setData({showBuyModal: true})
	},
	onCancal() {
		this.setData({showBuyModal: false})
	},
	onConfirm() {
		console.log("购买诗歌");
		requestFunc.requestFunc({
			url: '/works/buy-bg-poetry',
			method: "POST",
			data: {
				userId: this.data.user.data.id,
				poetryId: this.data.poems[this.data.currentItemId].id
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			if (data.result == 0) {
				let poems = this.data.poems
				poems[this.data.currentItemId].used = 0
				this.setData({poems})
				let id = that.data.poems[ that.data.currentItemId ].id;
				wx.navigateTo({
					url: '/pages/create_c/create_c?wobg_id=' + that.data.wobg_id + "&poem_id=" + id,
				})
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
})