let util = require('../../utils/util.js');
let requestFunc = require('../../utils/request.js');
// const { threadId } = require('worker_threads');
const app = getApp();
let that;
let shigeTimeout = null;
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
		commentReplay: '',
		showcengmodel: '',
		isPlay: true
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
		return {
			title: '诗里的童年',
			path: '/pages/index/index?scene=A-' + that.data.user.data.id
		}
	},
	init() {
		that.getWorks();
	},
	getWorks() {
		requestFunc.requestFunc({
			url: '/works/list',
			method: "POST",
			data: {
				userId: that.data.user_id,
				visitId: that.data.user.data.id
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
				that.getComment(data.data[ 0 ])
				that.bgmBofangqi = wx.createInnerAudioContext()
				that.bgmBofangqi.autoplay = true
				that.bgmBofangqi.src = data.data[that.data.currentItemId].bgmUrl;
				shigeTimeout && clearTimeout(shigeTimeout)
				shigeTimeout = setTimeout(() => {
					that.shigeBofangqi = wx.createInnerAudioContext()
					that.shigeBofangqi.autoplay = true
					that.shigeBofangqi.src = data.data[that.data.currentItemId].audioUrl;
					that.shigeBofangqi.onEnded(() => {
						that.pauseTimeOut && clearTimeout(that.pauseTimeOut)
						that.pauseTimeOut = setTimeout(() => {
							that.bgmBofangqi.play()
							that.bgmBofangqi.seek(0)
							that.chongzhishige && clearTimeout(that.chongzhishige)
							that.chongzhishige = setTimeout(() => {
								that.shigeBofangqi.play()
								that.shigeBofangqi.seek(0)
							}, 5000);
						}, 5000);
					})
				}, 5000);
				
				that.bgmBofangqi.onPlay(() => {
					console.log('开始播放')
				})
				that.bgmBofangqi.onError((res) => {
					console.log(res.errMsg)
					console.log(res.errCode)
				})
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
		})
	},
	getCommentOthers() {
		requestFunc.requestFunc({
			url: '/friend-works/create-comment',
			method: "POST",
			data: {
				worksId: that.data.item.worksId,
				authorId: that.data.item.commentatorId,
 				"commentatorId": that.data.user.data.id,   // todo 这个是评论人
				"content": that.data.commentReplay,
				"parentCommentId": that.data.item.id,    // todo 这个是父亲评论id ，也就是你在回复那条评论。(不传说明你在单纯的评论作品) 
				"conversationId": that.data.item.conversationId 
			}
		}).then((data) => {
			that.cancelReplayComment()
			// that.getWorks();
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
			requestFunc.requestFunc({
				url: '/task/complete',
				method: "POST",
				header: {
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
				},
				data: {
					taskTypeEnum: 'FRIENDINTERACT',
					userId: that.data.user.data.id
				},
			}).then((data) => {
				
			})
		})
	},
	goHome() {
		wx.navigateBack({
			delta: 20
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
				if (data.data) {
					wx.showToast({
						title: '还不到时间，请过会再来吧',
						icon: 'none',
						duration: 2000
					})
				} else {
					that.setData({
						showcengmodel: 1
					})
					requestFunc.requestFunc({
						url: '/task/complete',
						method: "POST",
						header: {
							'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
						},
						data: {
							taskTypeEnum: 'STEAL',
							userId: that.data.user.data.id
						},
					}).then((data) => {

					})
				}
				// wx.showToast({
				// 	title: '蹭阳光成功了',
				// 	icon: 'none',
				// 	duration: 2000
				// })
				
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
		that.shigeBofangqi && that.shigeBofangqi.pause();
		that.chongzhishige && clearTimeout(that.chongzhishige)
		that.pauseTimeOut && clearTimeout(that.pauseTimeOut)
		shigeTimeout && clearTimeout(shigeTimeout)
		var currentItemId = e.detail.currentItemId;
		this.setData({
			currentItemId: currentItemId
		});
		that.getComment(that.data.works[currentItemId]);
		that.setData({
			curBg: that.data.works[ currentItemId ].pictureUrl,
			curWork: that.data.works[ currentItemId ],
		});
		if (!that.data.isPlay) return
		that.bgmBofangqi.src = that.data.works[currentItemId].bgmUrl;
		if (that.data.works[currentItemId].audioUrl) {
			shigeTimeout = setTimeout(() => {
				that.shigeBofangqi.src = that.data.works[currentItemId].audioUrl;
				that.shigeBofangqi.play();
				that.shigeBofangqi.onEnded(() => {
					that.pauseTimeOut && clearTimeout(that.pauseTimeOut)
					that.pauseTimeOut = setTimeout(() => {
						that.bgmBofangqi.play()
						that.bgmBofangqi.seek(0)
						that.chongzhishige && clearTimeout(that.chongzhishige)
						that.chongzhishige = setTimeout(() => {
							that.shigeBofangqi.play()
							that.shigeBofangqi.seek(0)
						}, 5000);
					}, 5000);
				})
			}, 5000);
		} else {
			that.shigeBofangqi.src = that.data.works[currentItemId].audioUrl;
			that.shigeBofangqi.pause();
		}
		
		
	},
	toggleMusic() {
		if (that.data.isPlay) {
			that.setData({
				isPlay: false
			})

			that.chongzhishige && clearTimeout(that.chongzhishige)
			that.pauseTimeOut && clearTimeout(that.pauseTimeOut)
			shigeTimeout && clearTimeout(shigeTimeout)
			that.bgmBofangqi && that.bgmBofangqi.pause();
			that.shigeBofangqi && that.shigeBofangqi.pause();
			that.bgmBofangqi.src = ''
			that.shigeBofangqi.src = ''
		} else {
			that.setData({
				isPlay: true
			})
			// that.bgmBofangqi.play();
			// that.shigeBofangqi.play();
			that.bgmBofangqi = wx.createInnerAudioContext()
			that.bgmBofangqi.autoplay = true
			that.bgmBofangqi.src = that.data.works[that.data.currentItemId].bgmUrl;
			shigeTimeout && clearTimeout(shigeTimeout)
			shigeTimeout = setTimeout(() => {
				that.shigeBofangqi = wx.createInnerAudioContext()
				that.shigeBofangqi.autoplay = true
				that.shigeBofangqi.src = that.data.works[that.data.currentItemId].audioUrl;
				that.shigeBofangqi.onEnded(() => {
					that.pauseTimeOut && clearTimeout(that.pauseTimeOut)
					that.pauseTimeOut = setTimeout(() => {
						that.bgmBofangqi.play()
						that.bgmBofangqi.seek(0)
						that.chongzhishige && clearTimeout(that.chongzhishige)
						that.chongzhishige = setTimeout(() => {
							that.shigeBofangqi.play()
							that.shigeBofangqi.seek(0)
						}, 5000);
					}, 5000);
				})
			}, 5000);
		}
	},
	onHide() {
		that.chongzhishige && clearTimeout(that.chongzhishige)
		that.pauseTimeOut && clearTimeout(that.pauseTimeOut)
		shigeTimeout && clearTimeout(shigeTimeout)
		that.bgmBofangqi && that.bgmBofangqi.pause();
		that.shigeBofangqi && that.shigeBofangqi.pause();
		that.bgmBofangqi = ''
		that.shigeBofangqi = ''
		that.setData({
			isPlay: false
		})
	},
	onUnload() {

		that.chongzhishige && clearTimeout(that.chongzhishige)
		that.pauseTimeOut && clearTimeout(that.pauseTimeOut)
		shigeTimeout && clearTimeout(shigeTimeout)
		that.bgmBofangqi && that.bgmBofangqi.pause();
		that.shigeBofangqi && that.shigeBofangqi.pause();
		that.bgmBofangqi = ''
		that.shigeBofangqi = ''
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
			that.getWorks();
			that.getComment(that.data.works[currentItemId]);
			that.hideSell()
			requestFunc.requestFunc({
				url: '/task/complete',
				method: "POST",
				header: {
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
				},
				data: {
					taskTypeEnum: 'FRIENDINTERACT',
					userId: that.data.user.data.id
				},
			}).then((data) => {

			})
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
			showcengmodel: 0
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
				const works = that.data.works
				works[that.data.currentItemId].given = 1
				console.log(works, that.data.currentItemId)
				that.setData({
					works,
					curWork: works[that.data.currentItemId]
				})
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
	},
	async showForward() {

		requestFunc.requestFunc({
			url: '/user/count-creator',
			method: "POST",
			data: {
				userId: that.data.user.data.id,
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			let countCreator = data.data
			console.log(data, '获取用户为第几位创作者')
			// console.log(`${util.svrUrl}/qrcode?path=/pages/index/index?userId=${that.data.user.data.id}&worksId=${this.data.curWork.id}&type=1`);
			wx.showLoading({
				title: '图片生成中',
			})
			console.log(22);
			const ctx = wx.createCanvasContext('myWorkCanvas');
			try {
				wx.downloadFile({
					url: that.data.works[that.data.currentItemId].pictureUrl,
					success: function (res1) {
						ctx.drawImage(res1.tempFilePath, -375, -667, 1500, 2674);
						ctx.save();
						wx.downloadFile({
							url: 'https://wosz.oss-cn-beijing.aliyuncs.com/poetrychildhood/changpian.png',
							success: function(res3) {
								ctx.drawImage(res3.tempFilePath, 0, 60, 750, 658);
								ctx.setGlobalAlpha(0.4)
								ctx.setFillStyle('black')
								ctx.fillRect(0, 0, 750, 1334)
								ctx.setGlobalAlpha(1)
								ctx.drawImage(res1.tempFilePath, 70, 295, 631, 770);
								wx.downloadFile({
									url: that.data.works[that.data.currentItemId].poetryPictureUrl,
									success: function (res2) {
										ctx.drawImage(res2.tempFilePath, 70, 295, 631, 770);
										ctx.setFontSize(24);
										ctx.setFillStyle('#F9C500');
										ctx.setTextAlign('left');
										ctx.fillText(that.data.user.data.nickName, 76, 1100);

										ctx.setFontSize(18);
										ctx.setFillStyle('#FFFFFF');
										ctx.setTextAlign('left');
										ctx.fillText('成为“诗里的童年”艺术馆第' + countCreator + '位创作者，用心演', 76, 1154);
										ctx.setFontSize(18);
										ctx.setFillStyle('#FFFFFF');
										ctx.setTextAlign('left');
										ctx.fillText('绎乡村孩子的诗画作品，用爱照亮他们的童年之路。', 76, 1184);

										// 一个底部logo图
										// 一个二维码图
										wx.downloadFile({
											url: 'https://wosz.oss-cn-beijing.aliyuncs.com/poetrychildhood/sharelogo.png',
											success: function (res2) {
												ctx.drawImage(res2.tempFilePath, 76, 1235, 400, 45);
												ctx.save();
												wx.downloadFile({
													url: 'https://wosz.oss-cn-beijing.aliyuncs.com/poetrychildhood/qrcodebg.png',
													success: function (res4) {
														ctx.drawImage(res4.tempFilePath, 521, 1065, 180, 216);
														wx.downloadFile({
															url: util.svrUrl + '/qrcode?scene=A-' + that.data.user.data.id,
															success: function (res3) {
																ctx.drawImage(res3.tempFilePath, 526, 1110, 170, 170);
																ctx.save();
																ctx.draw(true, function () {
																	wx.canvasToTempFilePath({
																		x: 0,
																		y: 0,
																		width: 750,
																		height: 1334,
																		destWidth: 750,
																		destHeight: 1334,
																		fileType: 'png',
																		canvasId: 'myWorkCanvas',
																		success(res) {
																			console.log(res.tempFilePath)
																			wx.hideLoading()
																			wx.previewImage({
																				current: res.tempFilePath, // 当前显示图片的http链接
																				urls: [res.tempFilePath] // 需要预览的图片http链接列表
																			})
																		}
																	})
																})
															}
														})
													}
												})
											}
										})
									}
								})
							}
						})
					},
					fail: function (err) {
						console.log(err, 'err');
					}
				})
			} catch (error) {
				wx.hideLoading()
			}
			
		})
		// wx.downloadFile({
		// 	url: '',
		// 	success: function (res1) {
				
		// 	},
		// 	fail: function (err) {
				
		// 	}
		// })
	}
})