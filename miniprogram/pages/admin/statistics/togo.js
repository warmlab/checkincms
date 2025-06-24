import {currentTogoRecord} from '../../../accessor/statistics.js'
import {updateTogoStatus} from '../../../accessor/api.js'

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
	
	statusChange(e) {
		var that = this
		updateTogoStatus(e.currentTarget.dataset.id, e.currentTarget.dataset.index).then(data => {
			console.log(data)
			var records = this.data.records
			var item = records[data.index]
			if (item.id == data.id) {
				records[data.index].togo_status = data.togo_status
				that.setData({
					records: records
				})
			}
		}).catch(err => {

		})
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
		// get company info from server
		wx.showNavigationBarLoading()
    currentTogoRecord().then((data) => {
			console.log(data)
			that.setData({
				records: data,
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
