import config from './config.js'
import {login} from './accessor/request.js'
import request from './accessor/request.js'

// app.js
App({
	onLaunch() {
		// 展示本地存储能力
		const logs = wx.getStorageSync("logs") || [];
		logs.unshift(Date.now());
		wx.setStorageSync("logs", logs);

		config.initSystemInfo();

		login();//.then((userInfo) => {
			//wx.setStorageSync("appUserInfo", userInfo);
		//});
	},


	getUserInfo: function () {
		var that = this;
		var times = 0;
		return new Promise((resolve, reject) => {
			//var interval = setInterval(function () {
				//var userInfo = wx.getStorageSync("appUserInfo");
				if (typeof userInfo !== "undefined" && !!userInfo) {
					//clearInterval(interval);
					if (!userInfo.access_token || userInfo.expire_time <= new Date().getTime()) {
						that.login().then((userInfo) => {
							//wx.setStorageSync("appUserInfo", userInfo);
							resolve(userInfo);
						});
					} else {
						resolve(userInfo);
					}
				} else {
					//clearInterval(interval)
					login().then((userInfo) => {
						//wx.setStorageSync("appUserInfo", userInfo);
						resolve(userInfo);
					});
				}
				//if (times++ > 10) {
				//	clearInterval(interval);
				//	reject("cannot get user Info");
				//}
			//}, 1000);
		});
	},

	globalData: {},
});
