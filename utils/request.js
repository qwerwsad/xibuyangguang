const svrUrl = "http://123.57.180.141";
// const svrUrl = "http://westsunshine.sapet.cn/_minipro"
// const authKey = "484F215F522B6B7B2A60265D5C4C266F28654A6B4B225835202D41584F673B2C";

const Promise = require('../utils/bluebird.core.min.js')
function requestFunc({url, method, data} ) {
    return new Promise((reslove, reject) => {
        wx.request({
            url: svrUrl + url,
            method: method || 'GET',
            data,
            header: {
                'content-type': 'application/json;charset=UTF-8' // 默认值
            },
            success: function (res) {
                reslove(res.data);
            },
            error: function (err) {
                reject(err)
            }
        });
    });
}

module.exports = {
    requestFunc,
}