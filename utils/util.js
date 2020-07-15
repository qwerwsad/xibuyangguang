// const svrUrl = "http://123.57.180.141";
const svrUrl = "http://westsunshine.sapet.cn/_minipro"
const authKey = "484F215F522B6B7B2A60265D5C4C266F28654A6B4B225835202D41584F673B2C";

const Promise = require('../utils/bluebird.core.min.js')

const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

function loginSync() {
	return new Promise((reslove, reject) => {
		wx.login({
			success: function (res) {
				console.log(res.code);
				if (res.code) {
					wx.request({
						url: svrUrl + "/login.php",
						method:'POST',
						data: {
							auth_key: authKey,
							code: res.code
						},
						header: {
							'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' // 默认值
						},
						success: function ( res ) {
							// console.log( res.data );

							getApp().globalData.user = res.data;
							getApp().globalData.ifShowAddToMyMiniproTip = res.data.ifShowAddToMyMiniproTip;
							getApp().globalData.ifShowShareTip = res.data.ifShowShareTip;
							getApp().globalData.ifShowFollowTeacherTip = res.data.ifShowFollowTeacherTip;
							getApp().globalData.ifShowFollowShopTip = res.data.ifShowFollowShopTip;
							getApp().globalData.ifShowSearchTypeTip = res.data.ifShowSearchTypeTip;

							// 测试几个引导框
							// getApp().globalData.ifShowAddToMyMiniproTip = 1;
							// getApp().globalData.ifShowShareTip = 1;
							// getApp().globalData.ifShowFollowTeacherTip = 1;
							// getApp().globalData.ifShowFollowShopTip = 1;
							// getApp().globalData.ifShowSearchTypeTip = 1;
							//END

							reslove( res.data );
						}
					});
				};
			}
		});
	});
}

function getUserInfo() {
	return new Promise((reslove, reject) => {
		wx.request({
			url: svrUrl + 'user_info.php',
			data: {
				authKey: authKey,
				user_id: getApp().globalData.user.user_id,
			},
			success: function (res) {
				// console.log(res.data);
				getApp().globalData.user = res.data;
				reslove(res.data);
			},
		});
	});
}

function saveViewCount(type, id) {
	wx.request({
		url: apiUrl.saveViewCount,
		data: {
			authKey: authKey,
			type: type,
			id: id,
		},
		success: function (res) {
			console.log(res);
		},
	});
}

function randomString(len) {
	len = len || 32;
	var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
	var maxPos = $chars.length;
	var pwd = '';
	for (var i = 0; i < len; i++) {
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}

function randomInt(m, n) {
	var num = Math.floor(Math.random() * (m - n) + n);
	return num;
}


function isDate(dateString) {

	if (dateString.trim() == "") {
		return false;
	}
	var r = dateString.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
	if (r == null) {
		return false;
	}
	var d = new Date(r[1], r[3] - 1, r[4]);
	var num = (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d.getDate() == r[4]);

	return (num != 0);
}

function isPhoneNum(phone) {
	if (!(/^\d{11}$/.test(phone))) {
		return false;
	} else {
		return true;
	}
}

String.prototype.endWith = function (endStr) {
	var d = this.length - endStr.length;
	return (d >= 0 && this.lastIndexOf(endStr) == d);
}

module.exports = {
	formatTime: formatTime,
	svrUrl: svrUrl,
	authKey: authKey,
	loginSync: loginSync,
	getUserInfo: getUserInfo,
	randomString: randomString,
	isDate: isDate,
	isPhoneNum: isPhoneNum,
	randomInt: randomInt,
	saveViewCount: saveViewCount,
}