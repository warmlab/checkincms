import {getNotesInfo} from '../../../accessor/note.js'
import {getCompaniesInfo} from '../../../accessor/company.js'

Page({

  /**
   * Page initial data
   */
  data: {
		name: "",
		time_period_option: 1
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {    var that = this;
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
      title: "信息加载中...",
      mask: true,
    });
		wx.showNavigationBarLoading()
			getCompaniesInfo().then((data) => {
			  wx.hideNavigationBarLoading()
				data.map((item) => item.checked=true)
				var company_ids = [];
				data.forEach ((ele) => {
					ele.checked = true;
					company_ids.push(ele.id);
				});
				that.setData({
					companies: data,
					company_ids: company_ids
				})
				wx.hideLoading()
			}).catch(err => {
				wx.hideNavigationBarLoading()
				wx.hideLoading()
			});
	},

	bindStaffName(e) {
		this.setData({
			name: e.detail.value
		})
	},

	companiesChange(e) {
		var company_ids = e.detail.value.map((x) => parseInt(x))
		this.setData({
			company_ids: company_ids
		})
	},

	timePeriodOptionChange(e) {
		this.setData({
			time_period_option: parseInt(e.detail.value)
		})

		if (this.data.time_period_option == 3 &&
			(this.data.begin_date == null || this.data.end_date == null)) {
			return
		}

		//this.getCheckinData(this.data.time_period_option, this.data.begin_date, this.data.end_date)
	},
	
	bindDateChange(e) {
		if (e.currentTarget.id == 'begin') {
			// begin date
			this.setData ({
				begin_date: e.detail.value
			})
		} else if (e.currentTarget.id == 'end') {
			// end date
			this.setData ({
				end_date: e.detail.value
			})
		}

		/*
		if (this.data.begin_date !=null && this.data.end_date!=null) {
			this.getCheckinData(this.data.time_period_option, this.data.begin_date, this.data.end_date);
		}*/
	},

	toGetNotes() {
		var that = this
		// get note info from server
    wx.showLoading({
      title: "信息加载中...",
      mask: true,
    });
    getNotesInfo(this.data.name, this.data.company_ids, this.data.time_period_option, this.data.begin_date, this.data.end_date).then((data) => {
			console.log(data)
			that.setData({
				notes: data,
			});
			wx.hideLoading()
		}).catch((err) => {
			//wx.hideNavigationBarLoading()
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