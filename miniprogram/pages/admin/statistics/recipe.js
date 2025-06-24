import config from '../../../config.js'
import {getRecipeStatistics} from '../../../accessor/statistics.js'

Page({

  /**
   * Page initial data
   */
  data: {
		base_image_url: config.base_image_url,
		name: "",
		time_period_option: 1,
		begin_date: "",
		end_date: "",
		//width: wx.WIN_WIDTH/16, // rem
		//height: wx.WIN_HEIGHT/16 // rem
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
		//this.getRecipeData()
		this.onPullDownRefresh()
		var width = (wx.WIN_WIDTH / 16 - 1 -0.2*5) / 3- .15;
		var height = width * 0.618;
		console.log(width, height)
		this.setData({
			width: width,
			height: height
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
	
	getRecipeData() {
		var that = this
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
		getRecipeStatistics(this.data.time_period_option, this.data.begin_date, this.data.end_date).then((data) => {
			console.log(data)
			that.setData({
				records: data
			})
		wx.hideLoading();
		}).catch(err => {
			wx.hideLoading();
		});
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

		//this.getCheckinData(this.data.time_period_option, this.data.begin_date, this.data.end_date)

		this.getRecipeData()
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

		if (this.data.begin_date !=null && this.data.end_date!=null) {
			this.getRecipeData()
		}
	},

//	toPreview(e) {
//		console.log(e)
//		this.getCheckinData(this.data.name, this.data.company_ids, this.data.time_period_option, this.data.begin_date, this.data.end_date)	
//	},
//
	//getCheckinData(name, companies, time_period_option, begin_date, end_date) {
	//	var that = this
	//	wx.showLoading({
	//		title: '信息加载中...',
	//		mask: true
	//	});
	//	getCheckinStatistics(name, companies, time_period_option, begin_date, end_date).then(data => {
	//		console.log(data)
	//		//data.map(ele => {
	//		//	//var date = new Date(ele.year, ele.month-1, ele.day)
	//		//	//ele.date = format_date_with_weekday(date);
	//		//});
	//		data.records.forEach(element => {
	//			console.log(element)
	//		});

	//		that.setData({
	//			header: data.header,
	//			records: data.records,
	//			total_checkin: data.total_checkin,
	//			total_person: data.total_person
	//		});
	//		wx.hideLoading();
	//	}).catch(err => {
	//		console.error('get checkin data error', err)
	//		wx.hideLoading()
	//	})
	//},

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {
		this.getRecipeData()
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