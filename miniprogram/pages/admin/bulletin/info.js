import {getBulletinInfo, updateBulletinInfo, deleteBulletinInfo} from '../../../accessor/bulletin.js'

Page({

  /**
   * Page initial data
   */
  data: {

  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
		console.log(options)
		if (options.id == null || options.id <= 0) {
				this.setData({
					bulletin: {id: 0, content: "", begin_date: "", end_date: ""}
				})
			return;
		}
		var that = this
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
		// get bulletin info from server
		getBulletinInfo(options.id).then(data => {
			console.log(data);
			that.setData({
				bulletin: data
			})
			wx.hideLoading()
		}).catch(err => {
			wx.hideLoading()
		})
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

	bindDateChange(e) {
		var bulletin = this.data.bulletin;
		if (e.currentTarget.id == 'begin') {
			// begin date
			bulletin.begin_date = e.detail.value
		} else if (e.currentTarget.id == 'end') {
			// end date
			bulletin.end_date = e.detail.value
		}
		this.setData ({
			bulletin: bulletin
		})
	},

	bindTitleChange(e) {
		var bulletin = this.data.bulletin;
		bulletin.title = e.detail.value
		this.setData ({
			bulletin: bulletin
		})
	},

	bindContentChange(e) {
		console.log(e)
		var bulletin = this.data.bulletin;
		bulletin.content = e.detail.value
		this.setData ({
			bulletin: bulletin
		})
	},

	updateBulletinInfo(e) {
		var that = this;
		//var content = e.detail.value.content;
		var bulletin = this.data.bulletin;
		bulletin.title = e.detail.value.title
		bulletin.content = e.detail.value.content;

		updateBulletinInfo(bulletin).then(data => {
			console.log(data)
			that.setData({
				bulletin: data
			})
			that.showSuccessInfo()
		}).catch(err => {
			console.error(err)
			wx.showToast({
				title: '操作失败',
				icon: 'error'
			})
		})
	},

	deleteBulletinInfo(e) {
		var that = this;
		deleteBulletinInfo(that.data.bulletin).then(data => {
			console.log(data)
			that.setData({
				bulletin: data
			})
			that.showSuccessInfo()
		}).catch(err => {
			console.error(err)
			wx.showToast({
				title: '操作失败',
				icon: 'error'
			})
		})
	},

	showSuccessInfo() {
		wx.showToast({
			title: '操作成功',
			icon: 'success',
			duration: 1500,
			complete: () => {
				setTimeout(() => {
					wx.navigateBack({
						delta: 1,
						success: (e) => {
							var pages = getCurrentPages();
							var former_page = pages[pages.length - 2];
							console.log(former_page)
							if (former_page == undefined || former_page == null) return;
							else former_page.onPullDownRefresh();
						}
					})
				}, 1500)
			}
		});
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
