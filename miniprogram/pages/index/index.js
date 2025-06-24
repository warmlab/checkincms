import config from '../../config.js'

let app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
		base_image_url: config.base_image_url,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {
		app.getUserInfo().then(info => {
			if (!info.is_active) {
				wx.showModal({
					title: '尚未注册',
					content: '您尚未注册，请移步至注册页面',
					complete: (res) => {
						if (res.cancel) {
							//console.log('exit')
							wx.exitMiniProgram({
								//success: res => {
								//	console.log('aaa')
								//},
								//fail: err => {
								//	console.log('bb', err)
								//}
							})
						}
				
						if (res.confirm) {
              wx.navigateTo({
                url: "/pages/my/info",
                success: (result) => {},
                fail: (res) => {},
                complete: (res) => {},
              });
            }
					}
				})
			}
		});
	},
	
	makePhoneCall() {
		wx.makePhoneCall({
			phoneNumber: '+1403-613-7773', // 杜哥电话
			success: () => {
			},
			fail: (err) => {
				console.log(err)
			}
		})
	},

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  }
})
