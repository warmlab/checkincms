import {myCheckinRecord, checkin} from '../../../accessor/api.js'
import {format_date_with_weekday} from '../../../utils/util.js'

Page({

  /**
   * Page initial data
   */
  data: {
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
		// get check information from server
		myCheckinRecord(that.data.time_period_option, null, null).then(data => {
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
		wx.hideLoading();
		}).catch(err => {
		wx.hideLoading();
			console.error('error', err)
		});
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

	timePeriodOptionChange(e) {
		this.setData({
			time_period_option: parseInt(e.detail.value)
		})

		if (this.data.time_period_option == 3 &&
			(this.data.begin_date == null || this.data.end_date == null)) {
			return
		}

		this.getCheckinData(this.data.time_period_option, this.data.begin_date, this.data.end_date)
	},
	
	bindDateChange(e) {
		console.log(e)
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

		if (this.data.begin_date !=null && this.data.end_date!=null) {
			this.getCheckinData(this.data.time_period_option, this.data.begin_date, this.data.end_date);
		}
	},

	getCheckinData(time_period_option, begin_date, end_date) {
		var that = this
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
		myCheckinRecord(time_period_option, begin_date, end_date).then(data => {
			data.map(ele => {
				var date = new Date(ele.year, ele.month-1, ele.day)
				ele.date = format_date_with_weekday(date);
			});
			data.forEach(element => {
				console.log(element)
			});

			that.setData({
				dates: data
			});
			wx.hideLoading();
		}).catch(err => {
			console.error('get checkin data error', err)
			wx.hideLoading()
		})
	},

	toResigning(e) {
		console.log(e)
		var that = this
		var year = parseInt(e.currentTarget.dataset.year)
		var month = parseInt(e.currentTarget.dataset.month)
		var day = parseInt(e.currentTarget.dataset.day)
		var checkin_time = new Date(year, month-1, day).getTime()
		console.log('time', checkin_time/1000)
		checkin(false, '', false, checkin_time/1000).then(data => {
			console.log(data)

			//var checkin_time = new Date(data.checkin_time*1000)
			//var checkin_time_index = data.checkin_time_index;
			var dates = that.data.dates;
			//console.log(dates)
			//dates[checkin_time_index].status = 1;
			dates.forEach(ele => {
				if (ele.year == year && ele.month == month && ele.day == day) {
					if (data.is_checkedin || data.is_togo)
						ele.status = 1
				}
			})

			this.setData({
				dates: dates
			})
			wx.showToast({
				title: '谢谢您补签成功',
				icon: 'success',
				duration: 2000,
				mask: true
			});
		}).catch(err => {
			console.error('staff checkin failed', err);
			wx.showToast({
				title: '对不起补签失败',
				icon: 'error',
				duration: 2000,
				mask: true
			});
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
