let util = require('../../utils/util.js');
let requestFunc = require('../../utils/request.js');
const app = getApp();
let that;
Page({
	data: {
    visitId: '',
    avatar: '',
    nickname: '',
    level: '',
    donate: '',
	worksList: [],
	pictureUrl: ''
	},
	onLoad: function (options) {
		that = this;
		if (options.visitId == undefined) {
			wx.navigateBack();
		}
    console.log(options.visitId, 'options.visitId')
    this.onHandleOptions(options)
		this.setData({
			visitId: options.visitId
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
  onHandleOptions(options) {
    this.setData({
      avatar: options.avatar,
      nickname: options.nickname,
      level: options.level,
	  donate: options.donate,
	  pictureUrl: options.pictureUrl
    })
  },
	onReady: function () {
	},
	onShow: function () {
	},
	onShareAppMessage: function () {
		return {
			title: '诗里的童年',
			path: '/pages/index/index?shareUserId=' + that.data.user.data.id,
			imageUrl: 'https://wosz.oss-cn-beijing.aliyuncs.com/poetrychildhood/share.png'
		}
	},
	init() {
		that.getFriendsInfo();
	},
	getFriendsInfo() {
		requestFunc.requestFunc({
			url: '/works/list',
			method: "POST",
			data: {
				visitId: that.data.user.data.id,
        		userId: that.data.visitId
			}
		}).then((data) => {
      this.setData({worksList: data.data})
      console.log(data, "data");
			// for (let index = 0; index < data.data.length; index++) {
			// 	if (data.data[index].id == that.data.wobg_id) {
			// 		that.setData({
			// 			work_bg: data.data[index],
			// 		});
			// 	}
			// }
		})
  },
  gowork(e) {
		var picture = e.currentTarget.dataset.picture
		if (picture.length > 0) {
			wx.navigateTo({
				url: '/pages/work/work?user_id=' + that.data.visitId + '&pageAttribution=others'
			})
		} else {
			wx.showToast({
				title: '好友暂无画作',
				icon: 'none',
				duration: 2000
			})
		}
  }
})