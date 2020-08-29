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
			path: '/pages/index/index?shareUserId=' + that.data.user.data.id
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
  gowork() {
    wx.navigateTo({
      url: '/pages/work/work?user_id=' + that.data.visitId + '&pageAttribution=others'
    })
  }
})