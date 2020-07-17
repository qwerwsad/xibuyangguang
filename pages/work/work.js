let util = require('../../utils/util.js');
let requestFunc = require('../../utils/request.js');
const app = getApp();
let that;
Page({
	data: {
		user: {},
		currentItemId: 0,
		works: [],
		curWork: {},
		curBg: "",
		poems: [],
		sponsorShow: 0,
		commentShow: 0,
		comment: "",
		ifShowSell: 0,
	},
	onLoad: function (options) {
		that = this;
		if ( app.globalData.user != null ) {
			that.setData({ user: app.globalData.user }); 
			if ( options.user_id != undefined && options.user_id > 0 ) {
				this.setData({
					owner_id: options.user_id,
				});
			} else {
				this.setData({
					owner_id: that.data.user.user_id,
				});
			}
			that.init();
		} else {
			app.employIdCallback = res => {
				that.setData({ user: res });
				if ( options.user_id != undefined && options.user_id > 0 ) {
					this.setData({
						owner_id: options.user_id,
					});
				} else {
					this.setData({
						owner_id: that.data.user.user_id,
					});
				}
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
		that.getWorks();
	},
	getWorks() {
		requestFunc.requestFunc({
			url: '/works/list',
			method: "POST",
			data: {
				userId: that.data.user.data.id
			}
		}).then((data) => {
			console.log(data)
			that.setData({
				works: data.data,
			});
			if (data.data.length > 0 ) {
				that.setData({
					curBg: that.data.currentItemId ? data.data[that.data.currentItemId].wobg_url :data.data[ 0 ].wobg_url,
					curWork: that.data.currentItemId ? data.data[that.data.currentItemId] : data.data[0],
				});
			}
		})
		// wx.request({
		// 	url: util.svrUrl + '/works/list',
		// 	method: 'POST',
		// 	data: {
		// 		userId: that.data.user.data.id,
		// 	},
		// 	success: function (res) {
		// 		that.setData({
				// 	works: res.data,
				// });
				// if ( that.data.works.length > 0 ) {
				// 	that.setData({
				// 		curBg: that.data.works[ that.data.currentItemId ].wobg_url,
				// 		curWork: that.data.works[ that.data.currentItemId ],
				// 	});
				// }
				
		// 	}
		// });
		// wx.request({
		// 	url: util.svrUrl + '/work.php',
		// 	data: {
		// 		auth_key: util.authKey,
		// 		user_id: that.data.owner_id,
		// 	},
		// 	success: function (res) {
				
		// 	}
		// });
	},
	swiperChange: function (e) {
		var currentItemId = e.detail.currentItemId;
		this.setData({
			currentItemId: currentItemId
		});
		that.setData({
			curBg: that.data.works[ currentItemId ].wobg_url,
			curWork: that.data.works[ currentItemId ],
		});
	},
	clickChange: function (e) {
		var itemId = e.currentTarget.dataset.itemId;
		this.setData({
			currentItemId: itemId
		});
	},
	showSponsor: function() {
		that.setData({
			sponsorShow: 1,
		});
	},
	hideSponsor: function() {
		that.setData({
			sponsorShow: 0,
		});
	},
	submitSponsor() {
		that.hideSponsor();
	},
	cancelSponsor() {
		that.hideSponsor();
	},
	showComment: function() {
		that.setData({
			commentShow: 1,
		});
	},
	commentInput( e ) {
		that.setData({
			comment: e.detail.value
		});
	},
	hideComment: function() {
		that.setData({
			commentShow: 0,
		});
	},
	submitComment() {
		wx.showLoading({ mask: true, title: '上传中' });
		wx.request({ method: "POST", dataType: "json", header: { 'content-type': 'application/x-www-form-urlencoded' },
		url: util.svrUrl + '/save_comment.php',
			data: {
				auth_key: util.authKey,
				user_id: that.data.user.user_id,
				work_id: that.data.curWork.work_id,
				comment: that.data.comment,
			},
			success: function(res) {
				console.log( res );
				wx.hideLoading();
				wx.showToast({
					title: res.data.msg,
				});
				if ( res.data.status == 1) {
					that.init();
				}
				wx.hideLoading();
			}
		});
		that.hideComment();
	},
	cancelComment() {
		that.hideComment();
	},
	showSell() {
		that.setData({
			ifShowSell: 1,
		});
	},
	hideSell() {
		that.setData({
			ifShowSell: 0,
		});
	},
})