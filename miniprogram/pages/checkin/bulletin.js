import {getBulletinsInfo} from '../../accessor/bulletin.js'

Page({
  /**
   * Page initial data
   */
  data: {},

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
		this.onPullDownRefresh()
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {},

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {
	},

  navigateToInfo(e) {
    wx.navigateTo({
      url: `info?id=${e.currentTarget.dataset.id}`,
    });
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {},

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {},

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {
		var that = this
    wx.showLoading({
      title: "信息加载中...",
      mask: true,
    });
		// get bulletin info from server
		wx.showNavigationBarLoading()
    getBulletinsInfo().then((data) => {
			that.setData({
				bulletins: data,
			});
			wx.hideNavigationBarLoading()
			wx.hideLoading()
		}).catch((err) => {
			wx.hideNavigationBarLoading()
			wx.hideLoading()
		});
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {},

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {},
});
