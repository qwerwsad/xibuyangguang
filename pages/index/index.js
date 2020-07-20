let util = require('../../utils/util.js');
let requestFunc = require('../../utils/request.js');
const app = getApp();
let that;
Page({
	data: {
		zhengshubianhao: '',
		currentDate: '',
		levelWid: 0,
		user: {},
		showFriend: true,
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
		friendDynamic: [],
		friendRanks: [],
		totalRanks: [],
		ranks: [],
		myFriendRank: "",
		myTotalRank: "",
		myRank: "",
		recipients: [],
		curRecipient: {},
		friendAsync: [],
		medalsData: [],
		userFriendRank: 0,
		userAllRank: 0,
		taskData: [],
		signInData: {
			times: 1,
			state: false
		},
		showSignIn: false,
		showsignmodel: false,
		showCreateFriendmodel: false,
		worksList: []
	},
	gotoTask(e) {
		const index = e.currentTarget.dataset.taskindex
		if (index == 1) {
			that.setData({
				showSignIn: true
			})
		} else if (index == 2) {
			wx.navigateTo({
				url: '/pages/create_a/create_a',
			});
		} else if (index == 3) {
			that.setData({
				ifShowFriend: 1,
				ifShowTask: 0
			})
		} else if (index == 5) {
			that.setData({
				ifShowFriend: 1,
				ifShowTask: 0
			})
		}
	},
	closeSignin() {
		that.setData({
			showSignIn: false
		})
	},
	toFriendHome(e) {
		const friend = e.currentTarget.dataset.frienddata
		wx.navigateTo({
			url: `/pages/friend_home/friend_home?pictureUrl=${friend.pictureUrl}&visitId=${friend.id}&avatar=${friend.avatar}}&nickname=${friend.nickName}&level=${friend.level}&donate=${friend.givePoint}`,
		});
	},
	huizhicanvas() {
		wx.showLoading('图片生成中')
		const ctx = wx.createCanvasContext('ruleCanvas');
		wx.downloadFile({
			url: 'http://westsunshine.sapet.cn/static/cert/cert.png',
			success: function (res) {
				ctx.drawImage(res.tempFilePath, 0, 0, 634, 859);
				ctx.save();
				ctx.beginPath();
				ctx.arc(217, 180, 44, 0, Math.PI * 2, false);
				ctx.clip();
				wx.downloadFile({
					url: that.data.user.data.avatar,
					success: function (res) {
						ctx.drawImage(res.tempFilePath, 173, 136, 88, 88);
						ctx.restore();
						ctx.setFontSize(32);
						ctx.setFillStyle('yellow');
						ctx.setTextAlign('left');
						ctx.fillText(that.data.user.data.nickName + '，谢谢你！', 280, 190);
						ctx.setFontSize(12);
						ctx.setFillStyle('black');
						ctx.setTextAlign('left');
						ctx.fillText('THANK YOU FOR YOUR DONATION!', 280, 210);
						var date = new Date();
						var currentDate = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
						var lineWidth = 0;
						var initHeight = 262
						var str = '你于' + currentDate + '给西部阳光捐赠了' + that.data.curRecipient.point + '阳光值，汇丰银行将给予项目同等价值的支持。因为有你，孩子们能在梦想中的教室中玩耍！'
						var lastSubStrIndex = 0; //每次开始截取的字符串的索引 
						ctx.setFontSize(12);
						ctx.setFillStyle('black');
						ctx.setTextAlign('left');
						for (let i = 0; i < str.length; i++) {
							lineWidth += ctx.measureText(str[i]).width;
							if (lineWidth > 429) {
								ctx.fillText(str.substring(lastSubStrIndex, i), 112, initHeight); //绘制截取部分                
								initHeight += 25; //16为字体的高度                
								lineWidth = 0;
								lastSubStrIndex = i;
								// titleHeight += 30;
							}
							if (i == str.length - 1) { //绘制剩余部分                
								ctx.fillText(str.substring(lastSubStrIndex, i + 1), 112, initHeight);
							}
						}
						ctx.setFontSize(16);
						ctx.setFillStyle('#C56330');
						ctx.setTextAlign('center');
						ctx.fillText('证书编号：' + that.data.zhengshubianhao, 317, 373);
						ctx.setFontSize(16);
						ctx.setFillStyle('#000000');
						ctx.setTextAlign('left');
						ctx.fillText(currentDate, 433, 457);
						ctx.draw(true, function() {
							wx.canvasToTempFilePath({
								x: 0,
								y: 0,
								width: 634,
								height: 860,
								destWidth: 634,
								destHeight: 860,
								canvasId: 'ruleCanvas',
								success(res) {
									console.log(res.tempFilePath)
									wx.hideLoading()
									wx.previewImage({
										current: res.tempFilePath, // 当前显示图片的http链接
										urls: [res.tempFilePath] // 需要预览的图片http链接列表
									})
								}
							})
						});
					}
				})
			}, fail: function (fres) {

			}
		})
	},
	onLoad: function (options) {
		that = this;
		console.log(options, app.globalData.user, 'app.globalData.user')
		if ( app.globalData.user != null ) {
			let levelWid = 0
			levelWid = (app.globalData.user.data.givePoint / app.globalData.user.data.point) * 100
			that.setData({ user: app.globalData.user, levelWid }); 
			if ( that.data.user.user_if_geted_weixin_info == 0 ) {
				that.shouQuan();
			}
			that.init(options);
		} else {
			app.employIdCallback = res => {
				let levelWid = 0
				if (res) {
					levelWid = (app.globalData.user.data.givePoint / app.globalData.user.data.point) * 100
				}
				that.setData({ user: res, levelWid});
				console.log(that.data.user, 'that.data.user')
				if (that.data.user.data.accessed == 0 ) {
					that.shouQuan();
				}
				that.init(options);
			};
		}
		// that.ShowGetSunshineValue();
	},
	onReady: function () {
	},
	onShareAppMessage: function (res) {
		if (res.from === 'button') {
			return {
				title: '快来和我一起制作吧',
				path: '/pages/index/index?shareUserId=' + that.data.user.data.id
			}
		}
		return {
			title: '自定义转发标题',
			path: '/page/user?id=123'
		}
	},
	move: function() {

	},
	init(options) {
		// that.getWorks();
		that.getRanks();
		that.getFriends();
		that.getRecipients();
		that.getMedals();
		that.getUserPaiming();
		that.getTask();
		that.getFriendUpdates();
		that.getSignData();
		that.getWorkss();
		that.data.user.data.accessed !=0 && that.route(options)
	},
	getWorkss() {
		requestFunc.requestFunc({
			url: '/works/list',
			method: "POST",
			data: {
				visitId: '',
				userId: that.data.user.data.id
			}
		}).then((data) => {
			this.setData({ worksList: data.data })
		})
	},
	onShow: function () {
		util.loginSync().then(function (res2) {
			that.setData({
				user: app.globalData.user
			});
		});
		app.globalData.user && that.getTask();
		app.globalData.user && that.getFriendUpdates();
		app.globalData.user && that.getWorkss();
	},
	signFunction(e) {
		if (e.currentTarget.dataset.issignin) {
			return
		}
		requestFunc.requestFunc({
			url: '/task/complete',
			method: "POST",
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			},
			data: {
				taskTypeEnum: 'SIGNIN',
				userId: that.data.user.data.id
			},
		}).then((data) => {
			if (data.result == 0) {
				that.setData({
					showsignmodel: true
				})
			}
		})
	},
	getSignData() {
		requestFunc.requestFunc({
			url: '/task/check-sign',
			method: "GET",
			// header: {
			// 	'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			// },
			data: {
				userId: that.data.user.data.id
			},
		}).then((data) => {
			that.setData({
				signInData: data.data
			})
		})
	},
	getFriendUpdates() {
		requestFunc.requestFunc({
		url: '/friend/friend-dynamic',
		method: "GET",
		header: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
		},
		data: {
			userId: that.data.user.data.id
		},
		}).then((data) => {
			that.setData({
				friendDynamic: data.data
			})
		})
	},
	hideSell () {
		that.setData({
			showsignmodel: false,
			showSignIn: false,
			showCreateFriendmodel: false
		})
		that.getSignData();
		that.getTask();
	},
	route(options) {
		if (options.shareUserId) {
			if (options.shareUserId == that.data.user.data.id) return
			requestFunc.requestFunc({
				url: '/friend/create',
				method: "POST",
				header: {
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
				},
				data: {
					applicantPersonId: options.shareUserId,
					throughPersonId: that.data.user.data.id,
				},
			}).then((data) => {
				if (data.result == 0) {
					requestFunc.requestFunc({
						url: '/task/complete',
						method: "POST",
						header: {
							'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
						},
						data: {
							taskTypeEnum: 'INVITE',
							userId: that.data.user.data.id
						},
					}).then((data) => {
						that.setData({
							showCreateFriendmodel: true
						})
					})
				}
			})
		}
		if (options.scene) {
			if (options.scene.indexOf('A-') >= 0) {
				console.log(options.scene.slice(2))
				wx.navigateTo({
					url: '/pages/work/work?user_id=' + options.scene.slice(2),
				});
			}
		}
	},
	getTask() {
		console.log(that.data.user.data.id, 'that.data.user.data.id')
		requestFunc.requestFunc({
			url: '/task/tasks',
			method: "GET",
			data: {
				userId: that.data.user.data.id,
			},
		}).then((data) => {
			console.log(data, 'task')
			that.setData({
				taskData: data.data
			})
		})
	},
	getUserPaiming() {
		requestFunc.requestFunc({
			url: '/friend/user-friend-rank',
			method: "GET",
			data: {
				userId: that.data.user.data.id,
			},
		}).then((data) => {
			that.setData({
				userFriendRank: data.data.rownum > 99 ? '99+' : 'No.' + data.data.rownum
			})
		})
		requestFunc.requestFunc({
			url: '/friend/user-all-rank',
			method: "GET",
			data: {
				userId: that.data.user.data.id,
			},
		}).then((data) => {
			that.setData({
				userAllRank: data.data.rownum > 99 ? '99+' : 'No.' + data.data.rownum
			})
		})
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
			url: '/friend/users',
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
		// this.setData({
		// 	getWechatInfoViewShow: false
		// });
		wx.showToast({
			title: '授权用户信息才能开启创作之路',
			icon: 'none',
			duration: 2000
		})
	},
	saveWechatUserInfo: function (e) {
		var that = this
		// wx.showLoading({ mask: true, title: '加载中' });
		console.log(e.detail.userInfo)
		requestFunc.requestFunc({
			url: '/system/add-user-basic',
			method: "POST",
			data: {
				id: that.data.user.data.id,
				avatar: e.detail.userInfo.avatarUrl,
				nickName: e.detail.userInfo.nickName || '用户甲',
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
					that.init()
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
	closeModel() {
		that.setData({
			ifShowRank: 0, ifShowTask: 0, ifShowFriend: 0, ifShowAchievement: 0, ifShowDonate: 0,
			ifShowGoDonate: 0, ifShowDonateCert: 0
		})
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
		that.getRanks();
		that.getFriends();
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
			that.getTask()
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
			that.getFriends()
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
			that.getMedals()
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
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			var date = new Date();
			var currentDate = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
			if (data.result == 1) {
				wx.showToast({
					title: '捐赠失败',
					icon: 'none',
					duration: 2000
				})
				that.setData({
					currentDate: currentDate,
					ifShowDonateCert: 0,
					ifShowGoDonate: 0,
					ifShowIDonate: 0,
				});
			} else {
				that.getMedals();
				requestFunc.requestFunc({
					url: '/medal/count-donation',
					method: "GET",
					data: {
					},
					// header: {
					// 	'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
					// }
				}).then((data) => {
					that.setData({
						zhengshubianhao: data.data,
						currentDate: currentDate,
						ifShowDonateCert: 1,
						ifShowGoDonate: 0,
						ifShowIDonate: 0,
					});
					util.loginSync().then(function (res2) {
						that.setData({
							user: app.globalData.user
						});
					});
				})
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
			url: '/pages/work/work?user_id=' + that.data.user.data.id + '&pageAttribution=mine',
		});
	},
	switchFriendRank() {
		that.setData({
			showFriend: true,
			// ranks: that.data.friendRanks,
			// myRank: that.data.myFriendRank,
		});
	},
	switchTotalRank() {
		that.setData({
			showFriend: false,
			// ranks: that.data.totalRanks,
			// myRank: that.data.myFriendRank,
		});
	},
})