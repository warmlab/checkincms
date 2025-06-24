import {getCompanyInfo, updateCompanyInfo, deleteCompanyInfo} from '../../../accessor/company.js'

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
					company: {id: 0, name: ""}
				})
			return;
		}
		var that = this
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
			// get company info from server
		getCompanyInfo(options.id).then(data => {
			console.log(data);
			that.setData({
				company: data
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
	
	onNameChange(e) {
		console.log(e)
		var company = this.data.company;
		company.name = e.detail.value

		this.setData({
			company: company
		})
	},

	updateCompanyInfo(e) {
		var that = this;
		if (that.data.company.name == undefined || that.data.company.name == null || that.data.company.name.trim() == "") {
			wx.showToast({
				title: '请输入公司名称',
			})
			return
		}
		updateCompanyInfo(that.data.company).then(data => {
			console.log(data)
			that.setData({
				company: data
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

	deleteCompanyInfo(e) {
		var that = this;
		deleteCompanyInfo(that.data.company).then(data => {
			console.log(data)
			that.setData({
				company: data
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