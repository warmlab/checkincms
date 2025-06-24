import config from '../../config.js'
import {getRecipeInfo} from '../../accessor/recipe.js'

Page({
  /**
   * Page initial data
   */
  data: {
		base_image_url: config.base_image_url
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
		// get company info from server
    wx.showLoading({
      title: "信息加载中...",
      mask: true,
    });
		wx.showNavigationBarLoading()
    getRecipeInfo().then((data) => {
			console.log(data)
			that.setData({
				recipe: data.recipe,
				dishes: data.dishes
			});
			wx.hideLoading()
			wx.hideNavigationBarLoading()
		}).catch((err) => {
			wx.hideLoading()
			wx.hideNavigationBarLoading()
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