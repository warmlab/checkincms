import config from '../config.js'
//import {login} from '../accessor/login.js'

var request = {
	header: {
		'X-VERSION': config.api_version,
		'X-TERMINAL-TYPE': config.terminal_type,
		//'X-ACCESS-TOKEN': '',
		'Content-Type': 'application/json'
	},

	_request: function (url, data, method) {
		var userInfo = wx.getStorageSync('appUserInfo')
		if (!!userInfo && !!userInfo.access_token) {
			this.header['X-ACCESS-TOKEN'] = userInfo.access_token
		}

		var that = this
		var promise = new Promise((resolve, reject) => {
			that.do_request(url, data, method, resolve, reject)
		})

		return promise;
	},

	do_request: function(url, data, method, resolve, reject) {
		var that = this
		wx.request({
			url: `${[config.base_url, url].join('/')}`,
			method: method,
			header: that.header,
			data: data,
			success: res => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					//console.log(url, data, res.data);
					resolve(res)
				} else if (res.statusCode == 406) {
					login().then(_ => {
						var userInfo = wx.getStorageSync('appUserInfo')
						if (!!userInfo && !!userInfo.access_token) {
							that.header['X-ACCESS-TOKEN'] = userInfo.access_token
						}
						console.log('aaa', that.header)
						//that.do_request(url, data, method, resolve, reject)
		wx.request({
			url: `${[config.base_url, url].join('/')}`,
			method: method,
			header: that.header,
			data: data,
			success: res => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					//console.log(url, data, res.data);
					resolve(res)
				} else {
					reject(res.data)
				}
			},
			fail: err => {
				//if (res.statusCode == 406) { // access token check error
					// do login again
					//login()
				//}
				reject(err)
			}
		})



					}).catch(err => {
						reject(err)
					})
				} else {
					reject(res.data)
				}
			},
			fail: err => {
				console.error('error from server', url, err)
				//if (res.statusCode == 406) { // access token check error
					// do login again
					//login()
				//}
				console.log(reject)
				reject(err)
			}
		})
	},

	get: function (url, data) {
		return this._request(url, data, 'GET')
	},

	post: function (url, data) {
		return this._request(url, data, 'POST')
	},

	delete: function (url, data) {
		return this._request(url, data, 'DELETE')
	},

	put: function (url, data) {
		return this._request(url, data, 'PUT')
	}
}

const wxLogin = function (resolve, reject) {
	// 登录
	wx.login({
		success: (res) => {
			var userInfo = wx.getStorageSync('appUserInfo')
			var openid
			if (userInfo != undefined && userInfo != null &&
				  userInfo.openid != undefined && userInfo.openid != null) {
				openid = userInfo.openid
			} else {
				openid = ""
			}
			// 发送 res.code 到后台换取 openId, sessionKey, unionId
			request.post("login", {
					code: res.code,
					openid: openid
				}).then((res) => {
					//wx.setStorageSync('appUserInfo', res.data)
					//console.log("wx.login", res.data);
					resolve(res.data);
				}).catch((err) => {
					//console.error("weixin login error:", err);
					wx.showModal({
						content: "系统正在升级中，请稍后...",
						showCancel: false,
						confirmText: "我知道了",
						confirmColor: "#841FFD",
					});
					reject(err);
				});
		},
	});
}

export const login = function () {
	var tokenChecker =	new Promise((resolve, reject) => {
		wxLogin((userInfo) => {
			if (userInfo.avatar_url != undefined && userInfo.avatar_url != null &&
				  !userInfo.avatar_url.startsWith('http')) {
				userInfo.avatar_url =  `${[config.base_image_url, userInfo.avatar_url].join('/')}`
			}
			wx.setStorageSync("appUserInfo", userInfo);
			resolve(userInfo);
		}, (err) => {
			reject(err);
		});
	});

	return tokenChecker;
}

const check_token = () => {
	var userInfo = wx.getStorageSync("appUserInfo");
	if ((!!userInfo && !!userInfo.access_token) || userInfo.expire_time > Date.now()/1000) {
		request.post("tokencheck").then((res) => {
			console.log("tokencheck OK", res);
			if (!userInfo.avatar_url.startsWith('http')) {
				userInfo.avatar_url =  `${[config.base_image_url, userInfo.avatar_url].join('/')}`
			}
			wx.setStorageSync("appUserInfo", userInfo);
			//resolve(res.data);
		}).catch((err) => {
			console.error("tokencheck ERR and to do weixin login", err);
			//that.wxLogin(resolve, reject);
			//that.wxLogin().then((userInfo) => {
			//	wx.setStorageSync("appUserInfo", userInfo);
			//	resolve(userInfo)
			//}).catch((err) => {
			//	reject(err)
			//});
		});
	} else {
		console.log("to do wxlogin", userInfo);
		wxLogin((userInfo) => {
			if (!userInfo.avatar_url.startsWith('http')) {
				userInfo.avatar_url =  `${[config.base_image_url, userInfo.avatar_url].join('/')}`
			}
			wx.setStorageSync("appUserInfo", userInfo);
			//resolve(userInfo);
		}, (err) => {
			//reject(err);
		});
	}
}

export const upload_image = (url, path, form_data={}) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
			url: `${[config.base_url, url].join('/')}`,
      filePath: path,
      name: "upload-image",
      formData: form_data,
      header: request.header,
      success: function (res) {
        //var data;
        try {
					console.log(res)
					var data = JSON.parse(res.data);
					resolve(data)
        } catch (err) {
          reject(err);
        }
      },
      fail: function (err) {
        console.log("upload image failed", err);
        reject(err);
      },
    });
  });
};

///module.exports = {
export default request;
///upload_image
///}
