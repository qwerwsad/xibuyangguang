
let requestFunc = require('../../utils/request.js');
const app = getApp();
Page({
  data: {
    user: ''
  },
  onLoad: function () {
    this.setData({ user: app.globalData.user}); 
  },
  searchEvent(value) {
    console.log(value.detail)
    requestFunc.requestFunc({
			url: '/system/update-nickname',
			method: "POST",
			data: {
        userId: this.data.user.data.id,
        nickName: value.detail
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
			}
		}).then((data) => {
			if (data.result == 0) {
				wx.redirectTo({
          url: '/pages/index/index'
        })
			} else if(data.result > 0) {
				wx.showToast({
          title: '修改失败，请重试',
          icon: 'none',
          duration: 1500
        })
			}
		})
  }
})
