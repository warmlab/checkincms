let app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
		hasUserInfo: false,
		canIUseGetUserProfile: false,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
		this.onPullDownRefresh()
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

  },

	toEditProfile() {
		wx.navigateTo({
			url: 'info',
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
		var that = this
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
		app.getUserInfo().then(info => {
			if (info.avatar_url == null || info.avatar_url.trim() == "") {
				info.avatar_url = "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0"
			}

			that.setData({
				userInfo: info,
				is_admin: info.is_admin
			});
			wx.stopPullDownRefresh()
			wx.hideLoading();
		}).catch(err => {
			wx.stopPullDownRefresh()
			wx.hideLoading()
		});
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
