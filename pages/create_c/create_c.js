let util = require('../../utils/util.js');
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
	},
	onLoad: function (options) {
		that = this;
		if (options.wobg_id == undefined || options.poem_id == undefined) {
			wx.navigateBack();
		}
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
	onReady: function () {},
	onShow: function () {},
	onShareAppMessage: function () {},
	init() {
		that.getWorkBg();
		that.getPoem();
		that.getBgms();
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
				console.log(res);
				that.setData({
					work_bg: res.data,
				});
			}
		});
	},
	getPoem() {
		wx.request({
			url: util.svrUrl + '/poem.php',
			data: {
				auth_key: util.authKey,
				user_id: that.data.user.user_id,
				poem_id: that.data.poem_id,
			},
			success: function (res) {
				console.log(res);
				that.setData({
					poem: res.data,
				});
			}
		});
	},
	getBgms() {
		wx.request({
			url: util.svrUrl + '/bgms.php',
			data: {
				auth_key: util.authKey,
				user_id: that.data.user.user_id,
			},
			success: function (res) {
				console.log(res);
				that.setData({
					bgms: res.data,
				});
			}
		});
	},
	play(e) {
		const innerAudioContext = wx.createInnerAudioContext()
		innerAudioContext.autoplay = true
		innerAudioContext.src = e.currentTarget.dataset.bgmurl;
		innerAudioContext.onPlay(() => {
			console.log('开始播放')
		})
		innerAudioContext.onError((res) => {
			console.log(res.errMsg)
			console.log(res.errCode)
		})
	},
	record() {
		that.setData({
			ifShowRecord: 1,
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
		}
	},
	startRecord() {
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
		recorderManager.stop();
		that.setData({
			recordStatus: "stop",
			recordIcon: "/img/mic.png",
		});
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
		innerAudioContext.play();
	},
	stopPlayRecordFile() {
		innerAudioContext.stop();
	},
	uploadRecordFile() {
		wx.showLoading({
			title: '上传中，请稍后',
		});
		wx.uploadFile({
			url: util.svrUrl + '/upload_record_file.php',
			filePath: that.data.recordFile,
			name: "file", //后台要绑定的名称
			header: { "Content-Type": "multipart/form-data" },
			// header: { 'content-type': 'application/x-www-form-urlencoded' },
			formData: {
				auth_key: util.authKey,				
				user_id: that.data.user.user_id,
				wobg_id: that.data.wobg_id,
				poem_id: that.data.poem_id,
			},
			success: function (res) {
				// console.log( res );
				let data = res.data && JSON.parse( res.data );
				wx.hideLoading();
				wx.showToast({
					title: data.msg,
				});
				setTimeout( function() {
					wx:wx.navigateTo({
						url: '/pages/work/work?id=' + data.newId,
					});
				}, 1000 );
			}
		});
	}
})