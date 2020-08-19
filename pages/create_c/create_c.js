let util = require('../../utils/util.js');
let requestFunc = require('../../utils/request.js');
const app = getApp();
let that;

const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
Page({
	data: {
		user: {},
		wobg_id: 0,
		work_bg: {},
		poem_id: 0,
		poem: {},
		currentItemId: 0,
		bgms: [],
		// curBg: "http://westsunshine.sapet.cn/static/work_bg/work_bg1.png",
		ifShowRecord: 0,
		recordFile: "",
		recordStatus: "stop",
		recordIcon: "/img/mic.png", //录音按钮图标：开始录音和停止录音
		currentMusicIndex: -1,
		mp3Url: '',
		bgmId: '',
		inCreate: false,
		showCreatemodel: false,
		playRecording: false,
		currentBgmUrl: '',
		currentRecordIndex: -1
	},
	gotoCreateC: function() {
		if(that.data.inCreate) return
		that.setData({
			inCreate: true
		})
		requestFunc.requestFunc({
			url: '/works/create',
			method: "POST",
			data: {
				"userId": that.data.user.data.id,
				"audioUrl": that.data.mp3Url,
				"bgMusicId": Number(that.data.bgmId),
				"bgPictureId": Number(that.data.wobg_id),
				"bgPoetryId": Number(that.data.poem_id),
			}
		}).then((data) => {
			that.setData({
				inCreate: false
			})
			requestFunc.requestFunc({
				url: '/task/complete',
				method: "POST",
				header: {
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
				},
				data: {
					taskTypeEnum: 'CREATEWORKS',
					userId: that.data.user.data.id
				},
			}).then((data) => {
				wx.navigateTo({
					url: '/pages/work/work?user_id=' + that.data.user.data.id + '&pageAttribution=mine',
				})
				wx.stopBackgroundAudio()
				// this.innerAudioContext && this.innerAudioContext.pause()
				// this.innerAudioContext = ''
			})
			
		})
	},
	goHome() {
		wx.navigateBack({
			delta: 20
		})
	},
	hideSell() {
		that.setData({
			showCreatemodel: false
		})
		wx.navigateTo({
			url: '/pages/work/work?user_id=' + that.data.user.data.id + '&pageAttribution=mine',
		})
		wx.stopBackgroundAudio()
		// this.innerAudioContext && this.innerAudioContext.pause()
		// this.innerAudioContext = ''
	},
	onLoad: function (options) {
		that = this;
		if (options.wobg_id == undefined || options.poem_id == undefined) {
			wx.navigateBack();
		}
		console.log(options, 'options')
		this.setData({
			wobg_id: options.wobg_id,
			poem_id: options.poem_id,
		});

		/////////// test
		// this.setData({
		// 	wobg_id: 2,
		// 	poem_id: 2,
		// });
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
		that.init();
	},
	onUnload: function() {
		wx.stopBackgroundAudio()
		// this.innerAudioContext && this.innerAudioContext.pause()
		// this.innerAudioContext = ''
	},
	onReady: function () {},
	onShow: function () {},
	onShareAppMessage: function () {
		return {
			title: '诗里的童年',
			path: '/pages/index/index'
		}
	},
	init() {
		that.getWorkBg();
		that.getPoem();
		that.getBgms();
	},
	getWorkBg() {
		requestFunc.requestFunc({
			url: '/multimedia/bg-pictures',
			method: "GET",
			data: {
				userId: that.data.user.data.id
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
	getPoem() {
		requestFunc.requestFunc({
			url: '/multimedia/bg-poetry',
			method: "GET",
			data: {
				userId: that.data.user.id
			}
		}).then((data) => {
			for (let index = 0; index < data.data.length; index++) {
				if (data.data[index].id == that.data.poem_id) {
					that.setData({
						poem: data.data[index],
					});
				}
			}
		})
	},
	hideCert() {
		// this.data.ifShowRecord = false
		if (that.data.currentRecordIndex >=0 ) {
			wx.playBackgroundAudio({
				dataUrl: that.data.currentBgmUrl
			})
			that.setData({
				currentMusicIndex: that.data.currentRecordIndex,
				currentRecordIndex: -1,
				ifShowRecord: false
			})
		} else {
			that.setData({
				ifShowRecord: false
			})
		}
		
	},
	getBgms() {
		requestFunc.requestFunc({
			url: '/multimedia/bgms',
			method: "POST",
			data: {
				userId: that.data.user.id,
				"order": "",
				"pageNum": 0,
				"pageSize": 10
			}
		}).then((data) => {
			console.log(data.data, ' data.data')
			that.setData({
				bgms: data.data,
			});
		})
		// wx.request({
		// 	url: util.svrUrl + '/bgms.php',
		// 	data: {
		// 		auth_key: util.authKey,
		// 		user_id: that.data.user.user_id,
		// 	},
		// 	success: function (res) {
		// 		console.log(res);
		// 		that.setData({
		// 			bgms: res.data,
		// 		});
		// 	}
		// });
	},
	play(e) {
		if (e.currentTarget.dataset.currentmusicindex == this.data.currentMusicIndex) {
			wx.stopBackgroundAudio()
			this.setData({
				currentMusicIndex: -1
			})
			return
		}
		this.setData({
			currentMusicIndex: e.currentTarget.dataset.currentmusicindex
		})
		if (this.innerAudioContext) {
			wx.playBackgroundAudio({
				dataUrl: e.currentTarget.dataset.bgmurl
			})
			that.setData({
				currentBgmUrl: e.currentTarget.dataset.bgmurl
			})
		} else {
			wx.playBackgroundAudio({
				dataUrl: e.currentTarget.dataset.bgmurl
			})
			that.setData({
				currentBgmUrl: e.currentTarget.dataset.bgmurl
			})
			// this.innerAudioContext = wx.createInnerAudioContext()
			// this.innerAudioContext.autoplay = true
			// this.innerAudioContext.src = e.currentTarget.dataset.bgmurl;
			// this.innerAudioContext.onPlay(() => {
			// 	console.log('开始播放')
			// })
			// this.innerAudioContext.onError((res) => {
			// 	console.log(res.errMsg)
			// 	console.log(res.errCode)
			// })
		}
	},
	record(e) {
		const bgmId = e.currentTarget.dataset.bgmid;
		const cuurentIndex = that.data.currentMusicIndex
		// this.innerAudioContext && this.innerAudioContext.pause()
		wx.stopBackgroundAudio()
		that.setData({
			ifShowRecord: 1,
			bgmId: bgmId,
			currentMusicIndex: -1,
			currentRecordIndex: cuurentIndex
		});
	},
	clickChange: function (e) {
		var itemId = e.currentTarget.dataset.itemId;
		this.setData({
			currentItemId: itemId
		})
	},
	toggleRecord() {
		if ( that.data.recordStatus == "stop" ) {
			that.startRecord();
		} else {
			that.stopRecord(); 
			if (that.data.currentRecordIndex >= 0) {
				// wx.playBackgroundAudio({
				// 	dataUrl: that.data.currentBgmUrl
				// })
				that.setData({
					currentMusicIndex: that.data.currentRecordIndex,
					currentRecordIndex: -1
				})
			}
		}
	},
	startRecord() {
		wx.stopBackgroundAudio()
		wx.getSystemInfo({
			success: function (res) {
				that.setData({
					shutRecordingdis: "block",
					openRecordingdis: "none"
				})
			}
		})
		const options = {
			duration: 600000, //指定录音的时长，单位 ms，最大为10分钟（600000），默认为1分钟（60000）
			sampleRate: 16000, //采样率
			numberOfChannels: 1, //录音通道数
			encodeBitRate: 96000, //编码码率
			format: 'mp3', //音频格式，有效值 aac/mp3
			frameSize: 50, //指定帧大小，单位 KB
		}
		//开始录音计时   
		// that.recordingTimer();
		//开始录音
		recorderManager.start(options);
		recorderManager.onStart(() => {
			console.log('。。。开始录音。。。')
		});
		//错误回调
		recorderManager.onError((res) => {
			console.log(res);
		});
		recorderManager.onStop((res) => {
			console.log('。。停止录音。。', res.tempFilePath)
			that.setData({
				recordFile: res.tempFilePath 
			});
		});
		that.setData({
			recordStatus: "recording",
			recordIcon: "/img/stoprecord.png",
		});
	},
	stopRecord: function () {
		// wx.getSystemInfo({
		// 	success: function (res) {
		// 		that.setData({
		// 			shutRecordingdis: "none",
		// 			openRecordingdis: "block"
		// 		})
		// 	}
		// })
		wx.playBackgroundAudio({
			dataUrl: that.data.currentBgmUrl
		})
		recorderManager.stop();
		that.setData({
			recordStatus: "stop",
			recordIcon: "/img/mic.png",
		});
	},
	playRecord: function() {
		if (that.data.playRecording) {
			that.stopPlayRecordFile()
			that.setData({
				playRecording: false
			})
		} else {
			that.playRecordFile()
			that.setData({
				playRecording: true
			})
		}
	},
	playRecordFile: function (e) {
		innerAudioContext.src = that.data.recordFile; //"http://soundpreview.ohipic.com/preview/sound/00/29/33/515ppt-S293364-183B1F2B.mp3";
		innerAudioContext.startTime = 0; //播放起始位置
		// innerAudioContext.autoplay = true; //是否自动播放
		//播放事件
		innerAudioContext.onPlay(() => {
			console.log('开始播放录音文件');
		})
		innerAudioContext.onPause(() => {
			console.log('暂停播放录音文件');
		})
		innerAudioContext.onEnded(() => {
			that.stopPlayRecordFile()
			that.setData({
				playRecording: false
			})
		})
		innerAudioContext.play();
	},
	stopPlayRecordFile() {
		innerAudioContext.stop();
	},
	uploadRecordFile() {
		// wx.showLoading({
		// 	title: '上传中，请稍后',
		// });
		console.log(that.data.recordFile)
		wx.uploadFile({
			url: util.svrUrl + '/upload',
			filePath: that.data.recordFile,
			name: "file", //后台要绑定的名称
			// header: { "Content-Type": "multipart/form-data" },
			success: function (res) {
				// console.log( res );
				console.log(res, '上传cheng')
				const data = res.data && JSON.parse(res.data)
				if (data) {
					that.setData({
						mp3Url: data.data.fileUrl,
						ifShowRecord: false
					})
					that.gotoCreateC()
				}
			},
			fail: function(err) {
				console.log(err)
			}
		});
	}
})