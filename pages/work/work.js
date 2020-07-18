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

		pageAttribution: 'others',
		commentData: [],
		point: 0,
		commentReplayShow: false,
		commentReplay: ''
	},
	onLoad: function (options) {
		that = this;
		if ( app.globalData.user != null ) {
			that.setData({ user: app.globalData.user, pageAttribution: options.pageAttribution }); 
			if ( options.user_id != undefined && options.user_id > 0 ) {
				this.setData({
					user_id: options.user_id,
				});
			} else {
				this.setData({
					user_id: that.data.user.user_id,
				});
			}
			that.init();
		} else {
			app.employIdCallback = res => {
				that.setData({ user: res, pageAttribution: options.pageAttribution });
				if ( options.user_id != undefined && options.user_id > 0 ) {
					this.setData({
						user_id: options.user_id,
					});
				} else {
					this.setData({
						user_id: that.data.user.user_id,
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
				userId: that.data.user_id
			}
		}).then((data) => {
			console.log(data)
			that.setData({
				works: data.data,
			});
			if (data.data.length > 0 ) {
				that.setData({
					curBg: that.data.currentItemId ? data.data[that.data.currentItemId].pictureUrl :data.data[ 0 ].pictureUrl,
					curWork: that.data.currentItemId ? data.data[that.data.currentItemId] : data.data[0],
				});
				this.getComment(data.data[ 0 ])
			}
		})
	},
	getComment(list) {
		requestFunc.requestFunc({
			url: '/friend-works/search-comment',
			method: "POST",
			data: {
				worksId: list.id,
				authorId: list.userId,
				pageSize: 30
			}
		}).then((data) => {
			console.log(data)
			this.setData({
				commentData: data && data.data
			})
			// that.setData({
			// 	works: data.data,
			// });
			// if (data.data.length > 0 ) {
			// 	that.setData({
			// 		curBg: that.data.currentItemId ? data.data[that.data.currentItemId].pictureUrl :data.data[ 0 ].pictureUrl,
			// 		curWork: that.data.currentItemId ? data.data[that.data.currentItemId] : data.data[0],
			// 	});
			// }
		})
	},
	getCommentOthers() {
		requestFunc.requestFunc({
			url: '/friend-works/create-comment',
			method: "POST",
			data: {
				worksId: that.data.item.worksId,
				authorId: that.data.item.authorId,
 				"commentatorId": that.data.item.commentatorId,   // todo 这个是评论人
				"content": that.data.commentReplay,
				"parentCommentId": that.data.item.id,    // todo 这个是父亲评论id ，也就是你在回复那条评论。(不传说明你在单纯的评论作品) 
				"conversationId": that.data.item.conversationId 
			}
		}).then((data) => {
			console.log(data, "回复评论")
			that.cancelReplayComment()
			that.getComment(that.data.curWork)
			// this.setData({
				// commentData: data && data.data
			// })
			// that.setData({
			// 	works: data.data,
			// });
			// if (data.data.length > 0 ) {
			// 	that.setData({
			// 		curBg: that.data.currentItemId ? data.data[that.data.currentItemId].pictureUrl :data.data[ 0 ].pictureUrl,
			// 		curWork: that.data.currentItemId ? data.data[that.data.currentItemId] : data.data[0],
			// 	});
			// }
		})
	},
	onLike() {
		requestFunc.requestFunc({
			url: '/friend-works/like',
			method: "POST",
			data: {
				userId: that.data.user.data.id,
				worksId: that.data.curWork.id,
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			console.log(data)
			let tempCurWork = this.data.curWork
			tempCurWork.likeCount = tempCurWork.like == 1 ? tempCurWork.likeCount - 1 : tempCurWork.likeCount + 1
			tempCurWork.like = tempCurWork.like == 1 ? '0' : '1'

			let tempWork = this.data.works
			tempWork[this.data.currentItemId] = tempCurWork
			// 把心图改变，数量
			this.setData({
				curWork: tempCurWork,
				works: tempWork
			})
		})
	},
	receiveSun() {
		requestFunc.requestFunc({
			url: '/friend/steal-point',
			method: "GET",
			data: {
				userId: that.data.user.data.id,
				friendId: that.data.user_id,
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			console.log(data)
			if (data.result == 0) {
				wx.showToast({
					title: '蹭阳光成功了',
					icon: 'none',
					duration: 2000
				})
			} else {
				wx.showToast({
					title: '蹭阳光失败，稍后再试',
					icon: 'none',
					duration: 2000
				})
			}
		})
	},
	swiperChange: function (e) {
		var currentItemId = e.detail.currentItemId;
		this.setData({
			currentItemId: currentItemId
		});
		that.setData({
			curBg: that.data.works[ currentItemId ].pictureUrl,
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
	sponsorCount(e) {
		this.setData({
			point: e.detail.value
		})
	},
	submitSponsor() {
		requestFunc.requestFunc({
			url: '/friend/reward',
			method: "POST",
			data: {
				friendId: that.data.user_id,
				userId: that.data.user.data.id,
				point: that.data.point,
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			console.log(data, '打赏')
			if (data.result == 0) {
				wx.showToast({
					title: '打赏成功了',
					icon: 'none',
					duration: 2000
				})
			} else {
				wx.showToast({
					title: '打赏失败',
					icon: 'none',
					duration: 2000
				})
			}
		})
		that.hideSponsor()
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
		requestFunc.requestFunc({
			url: '/friend-works/create-comment',
			method: "POST",
			data: {
				content: that.data.comment,
				authorId: that.data.user_id,
				worksId: this.data.curWork.id,
				commentatorId: that.data.user.data.id,
			},
			// header: {
			// 	'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			// }
		}).then((data) => {
			console.log(data, '留言')
			if (data.result == 0) {
				wx.showToast({
					title: '恭喜你，留言成功',
					icon: 'none',
					duration: 2000
				})
			} else {
				wx.showToast({
					title: '留言失败了，稍后再试',
					icon: 'none',
					duration: 2000
				})
			}
			that.getComment(that.data.curWork)
			that.hideSell()
		})
		// wx.showLoading({ mask: true, title: '上传中' });
		// wx.request({ method: "POST", dataType: "json", header: { 'content-type': 'application/x-www-form-urlencoded' },
		// url: util.svrUrl + '/save_comment.php',
		// 	data: {
		// 		auth_key: util.authKey,
		// 		user_id: that.data.user.user_id,
		// 		work_id: that.data.curWork.work_id,
		// 		comment: that.data.comment,
		// 	},
		// 	success: function(res) {
		// 		console.log( res );
		// 		wx.hideLoading();
		// 		wx.showToast({
		// 			title: res.data.msg,
		// 		});
		// 		if ( res.data.status == 1) {
		// 			that.init();
		// 		}
		// 		wx.hideLoading();
		// 	}
		// });
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
	confirmSell() {
		requestFunc.requestFunc({
			url: '/works/donation',
			method: "POST",
			data: {
				userId: that.data.user.data.id,
				worksId: this.data.curWork.id,
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			console.log(data, '拍卖')
			if (data.result == 0) {
				wx.showToast({
					title: '恭喜你，拍卖成功',
					icon: 'none',
					duration: 2000
				})
			} else {
				wx.showToast({
					title: '拍卖失败了，稍后再试',
					icon: 'none',
					duration: 2000
				})
			}
			that.hideSell()
		})
	},
	commentReplayInput(e) {
		that.setData({
			commentReplay: e.detail.value
		});
	},
	submitReplayComment(e) {
		let item = e.currentTarget.dataset.item
		this.setData({commentReplayShow: true, item: item});
	},
	cancelReplayComment() {
		this.setData({commentReplayShow: false});
	}
})