import {getCompaniesInfo} from '../../../accessor/company.js'
import {getCheckinStatistics, mailCheckinStatistics} from '../../../accessor/statistics.js'
//import {format_date_with_weekday} from '../../../utils/util.js'

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
  onLoad(options) {
		var that = this
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
		getCompaniesInfo().then((data) => {
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
		wx.hideLoading();
		}).catch(err => {
			wx.hideLoading();
		});
			/*
			// get check information from server
			that.getCheckinData(that.data.time_period_option, null, null).then(data => {
				data.map(ele => {
					var date = new Date(ele.year, ele.month-1, ele.day)
					ele.date = format_date_with_weekday(date);
				});
				data.forEach(element => {
					console.log(element)
				});

				that.setData({
					dates: data
				})

			}).catch(err => {
				console.error(err)
			});*/

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

	toPreview(e) {
		this.getCheckinData(this.data.name, this.data.company_ids, this.data.time_period_option, this.data.begin_date, this.data.end_date)
	},

	toSendEmail(e) {
		wx.showLoading({
			title: '邮件发送中...',
			mask: true
		});
		mailCheckinStatistics(this.data.name,
												this.data.company_ids,
												this.data.time_period_option,
												this.data.begin_date,
												this.data.end_date).then(data => {
			wx.hideLoading()
			wx.showToast({
				title: '邮件发送成功',
				icon: 'success'
			})
		}).catch(err => {
			wx.hideLoading()
			wx.showToast({
				title: '邮件发送失败',
				icon: 'error'
			})
		})
	},

	getCheckinData(name, companies, time_period_option, begin_date, end_date) {
		var that = this
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
		getCheckinStatistics(name, companies, time_period_option, begin_date, end_date).then(data => {
			console.log(data)
			//data.map(ele => {
			//	//var date = new Date(ele.year, ele.month-1, ele.day)
			//	//ele.date = format_date_with_weekday(date);
			//});
			data.records.forEach(element => {
				console.log(element)
			});

			that.setData({
				header: data.header,
				records: data.records,
				total_checkin: data.total_checkin,
				total_person: data.total_person
			});
			wx.hideLoading();
		}).catch(err => {
			console.error('get checkin data error', err)
			wx.hideLoading()
		})
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