let util = require('../../utils/util.js');
let requestFunc = require('../../utils/request.js');
const app = getApp();
let that;
Page({
	data: {
		currentDate: '',
		levelWid: 0,
		user: {},
		getWechatInfoViewShow: 0,
		currentItemId: 0,
		ifShowRank: 0, //排行榜
		ifShowTask: 0, //任务
		ifShowFriend: 0, //好友
		ifShowAchievement: 0, //成就
		ifShowDonate: 0, //捐赠
		ifShowGoDonate: 0, //去捐赠（在捐赠之上）
		ifShowIDonate: 0, //我要捐赠（在去捐赠之上）
		ifShowDonateCert: 0, //捐赠证书（在我要捐赠之上）
		ifShowGetSunshineValue: 0, //领取阳光值窗口
		// sponsorShow: 0,
		// commentShow: 0,
		friendRanks: [],
		totalRanks: [],
		ranks: [],
		myFriendRank: "",
		myTotalRank: "",
		myRank: "",
		recipients: [],
		curRecipient: {},
		friendAsync: [],
		medalsData: []
	},
	onLoad: function (options) {
		that = this;
		console.log(app.globalData.user, 'app.globalData.user')
		if ( app.globalData.user != null ) {
			let levelWid = 0
			levelWid = app.globalData.user.data.givePoint / app.globalData.user.data.point
			that.setData({ user: app.globalData.user, levelWid }); 
			if ( that.data.user.user_if_geted_weixin_info == 0 ) {
				that.shouQuan();
			}
			that.init();
		} else {
			app.employIdCallback = res => {
				let levelWid = 0
				if (res) {
					levelWid = res.data.givePoint / app.globalData.user.data.point
				}
				that.setData({ user: res, levelWid});
				console.log(that.data.user, 'that.data.user')
				if (that.data.user.data.accessed == 0 ) {
					that.shouQuan();
				}
				that.init();
			};
		}
		// that.ShowGetSunshineValue();
	},
	onReady: function () {
	},
	onShow: function () {
	},
	onShareAppMessage: function () {
	},
	move: function() {

	},
	init() {
		that.getWorks();
		that.getRanks();
		that.getFriends();
		that.getRecipients();
		that.getMedals();
	},
	getMedals() {
		console.log(12111)
		requestFunc.requestFunc({
			url: '/medal/medals',
			method: "GET",
			data: {
				userId: that.data.user.data.id,
			},
		}).then((data) => {
			that.setData({
				medalsData: data.data
			});
		})
	},
	getWorks() {
		wx.request({
			url: util.svrUrl + '/works.php',
			data: {
			},
			success: function (res) {
				console.log(res);
				that.setData({
					works: res.data,
				});
				if ( that.data.works.length > 0 ) {
					that.setData({
						curBg: that.data.works[0].wobg_url,
					});
				}
			}
		});
	},
	getRanks() {
		requestFunc.requestFunc({
			url: '/friend/alluser',
			method: "GET",
			data: {
			}
		}).then((data) => {
			that.setData({
				totalRanks: data.data
			});
		})
	},
	getFriends() {
		requestFunc.requestFunc({
			url: '/friend/friends',
			method: "POST",
			data: {
				userId: that.data.user.data.id,
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			that.setData({
				friends: data.data
			});
		})
		// wx.request({ method: "GET", dataType: "json",
		// 	url: util.svrUrl + '/get_friends.php',
		// 	data: {
		// 		auth_key: util.authKey,
		// 		user_id: that.data.user.user_id,
		// 	},
		// 	success: function (res) {
		// 		// console.log( res );
		// 		that.setData({
		// 			friends: res.data,
		// 		});
		// 	}
		// });
	},
	getRecipients() {
		requestFunc.requestFunc({
			url: '/medal/receives',
			method: "GET",
			data: {
				userId: that.data.user.data.id,
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			that.setData({
				recipients: data.data,
			});
		})
		// wx.request({ method: "GET", dataType: "json",
		// 	url: util.svrUrl + '/recipients.php',
		// 	data: {
		// 		auth_key: util.authKey,
		// 		user_id: that.data.user.user_id,
		// 	},
		// 	success: function (res) {
		// 		console.log( res );
		// 		that.setData({
		// 			recipients: res.data,
		// 		});
		// 	}
		// });
	},
	shouQuan() {
		this.setData({
			getWechatInfoViewShow: true
		});
	},
	hideShouQuan() {
		this.setData({
			getWechatInfoViewShow: false
		});
	},
	saveWechatUserInfo: function (e) {
		var that = this
		wx.showLoading({ mask: true, title: '加载中' });
		console.log(e.detail.userInfo)
		requestFunc.requestFunc({
			url: '/system/add-user-basic',
			method: "POST",
			data: {
				id: that.data.user.data.id,
				avatar: e.detail.userInfo.avatarUrl,
				nickName: '111' || e.detail.userInfo.nickName,
				gender: e.detail.userInfo.gender,
				country: e.detail.userInfo.country,
				province: e.detail.userInfo.province,
				city: e.detail.userInfo.city,
				area: e.detail.userInfo.area,
				address: e.detail.userInfo.address,
				"accessed": 0,
				"givePoint": 0,
				"leftPoint": 0,
				"level": 0,
				"levelId": 0,
				"openId": "",
				"phoneNumber": "",
				"pictureUrl": "",
				"point": ""
			}
		}).then((data) => {
			if (data.result == 0) {
				wx.showToast({
					title: data.msg,
				});
				util.loginSync().then(function (res2) {
					// console.log( res2 );
					that.setData({
						user: app.globalData.user,
						getWechatInfoViewShow: false
					});
					wx.hideLoading();
				});
			} else {
				wx.showToast({
					title: '授权失败，请重试',
					icon: 'none',
					duration: 1500
				});
			}
			
		})
		// wx.request({ method: "POST", dataType: "json", header: { 'content-type': 'application/x-www-form-urlencoded' },
		// 	url: util.svrUrl + '/system/add-user-basic',
		// 	data: {
		// 		auth_key: util.authKey,
		// 		user_id: that.data.user.user_id,
		// 		openid: that.data.user.openid,
		// 		portrait: e.detail.userInfo.avatarUrl,
		// 		nickname: e.detail.userInfo.nickName,
		// 		gender: e.detail.userInfo.gender,
		// 		country: e.detail.userInfo.country,
		// 		province: e.detail.userInfo.province,
		// 		city: e.detail.userInfo.city,
		// 		area: e.detail.userInfo.area,
		// 		address: e.detail.userInfo.address,
		// 		ifGetedWeixinInfo: 1,
		// 		encryptedData: e.detail.encryptedData,
		// 		iv: e.detail.iv,
		// 	},
		// 	success: function (res) {
		// 		console.log( res );
		// 		wx.showToast({
		// 			title: res.data.msg,
		// 		});
		// 		util.loginSync().then(function ( res2 ) {
		// 			// console.log( res2 );
		// 			that.setData({
		// 				user: app.globalData.user,
		// 				getWechatInfoViewShow: false
		// 			});
		// 			wx.hideLoading();
		// 		});
		// 	}
		// });
	},
	ShowGetSunshineValue() {
		that.setData({
			ifShowGetSunshineValue: 1,
		});
	},
	confirmGetShunshineValue() {
		that.setData({
			ifShowGetSunshineValue: 0,
		});
	},
	hideGetShunshineValue() {
		that.setData({
			ifShowGetSunshineValue: 0,
		});
	},
	gotoCreate() {
		wx.navigateTo({
		  url: '/pages/create_a/create_a',
		});
	},
	showRank() {
		if ( that.data.ifShowRank == 1 ) {
			that.setData({
				ifShowRank: 0,
			});
		} else {
			that.setData({
				ifShowRank: 1,
				ifShowTask: 0,
				ifShowFriend: 0,
				ifShowAchievement: 0,
				ifShowDonate: 0,
			});
		}
	},
	showTask() {
		if ( that.data.ifShowTask == 1 ) {
			that.setData({
				ifShowTask: 0,
			});
		} else {
			that.setData({
				ifShowRank: 0,
				ifShowTask: 1,
				ifShowFriend: 0,
				ifShowAchievement: 0,
				ifShowDonate: 0,
			});
		}
	},
	showFriend() {
		if ( that.data.ifShowFriend == 1 ) {
			that.setData({
				ifShowFriend: 0,
			});
		} else {
			that.setData({
				ifShowRank: 0,
				ifShowTask: 0,
				ifShowFriend: 1,
				ifShowAchievement: 0,
				ifShowDonate: 0,
			});
		}
	},
	showAchievement() {
		if ( that.data.ifShowAchievement == 1 ) {
			that.setData({
				ifShowAchievement: 0,
			});
		} else {
			that.setData({
				ifShowRank: 0,
				ifShowTask: 0,
				ifShowFriend: 0,
				ifShowAchievement: 1,
				ifShowDonate: 0,
			});
		}
	},
	showDonate() {
		if ( that.data.ifShowDonate == 1 ) {
			that.setData({
				ifShowDonate: 0,
			});
		} else {
			that.setData({
				ifShowRank: 0,
				ifShowTask: 0,
				ifShowFriend: 0,
				ifShowAchievement: 0,
				ifShowDonate: 1,
			});
		}
	},
	hideDonate() {
		that.setData({
			ifShowDonate: 0,
		});
	},
	donate( e ) {
		that.setData({
			curRecipient: that.data.recipients[ e.currentTarget.dataset.index ],
			ifShowGoDonate: 1,
		});
	},
	iDonate() {
		that.setData({
			ifShowIDonate: 1,
		});
	},
	confirmGoDonate() {
		requestFunc.requestFunc({
			url: '/medal/receive-point',
			method: "POST",
			data: {
				userId: that.data.user.data.id,
				receiveId: that.data.curRecipient.id
			}
		}).then((data) => {
			var date = new Date();
			var currentDate = date.getFullYear() + '年' + date.getMonth() + '月' + date.getDate() + '日'
			if (data.result == 1) {
				wx.showToast({
					title: '捐赠失败',
					icon: 'none',
					duration: 2000
				})
				that.setData({
					currentDate: currentDate,
					ifShowDonateCert: 1,
					ifShowGoDonate: 0,
					ifShowIDonate: 0,
				});
			} else {
				that.setData({
					currentDate: currentDate,
					ifShowDonateCert:1,
					ifShowGoDonate: 0,
					ifShowIDonate: 0,
				});
			}
		})
		// that.setData({
		// 	ifShowDonateCert:1,
		// 	ifShowGoDonate: 0,
		// 	ifShowIDonate: 0,
		// });
	},
	hideGoDonate() {
		that.setData({
			ifShowGoDonate: 0,
			ifShowIDonate: 0,
		});
	},
	hideCert() {
		that.setData({
			ifShowDonateCert:0
		});
	},
	toWork() {
		wx.navigateTo({
		  url: '/pages/work/work',
		});
	},
	switchFriendRank() {
		that.setData({
			ranks: that.data.friendRanks,
			myRank: that.data.myFriendRank,
		});
	},
	switchTotalRank() {
		that.setData({
			ranks: that.data.totalRanks,
			myRank: that.data.myFriendRank,
		});
	},
})