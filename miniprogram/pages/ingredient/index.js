import {latestReservations,
				makeReservation,
				cancelReservation,
				pickupReservation} from '../../accessor/ingredient.js'

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
		var that = this;
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
		// get reservation info
		latestReservations().then(data => {
			//console.log(data)
			that.setData({
				reservation: data
			})
		wx.hideLoading();
		}).catch(err => {
			console.error(err)
		wx.hideLoading();
		})
	},

	toPickupReservation(e) {
		var that = this
		pickupReservation().then(data => {
			console.log(data)
			//var reservation = that.data.reservation;
			//reservation.last_week.pickedup = true
			//reservation.last_week.pickedup_time = data.time
			that.setData({
				reservation: data
			})
			wx.showToast({
				title: '领取食材成功',
				icon: 'success',
				duration: 2000
			})
		}).catch(err => {
			console.error(err)
			wx.showToast({
				title: '领取食材失败',
				icon: 'error',
				duration: 3000
			})
		})
	},

	toMakeReservation(e) {
		var that = this
		makeReservation().then(data => {
			console.log(data)
			//var reservation = that.data.reservation;
			//reservation.last_week.pickedup = true
			//reservation.last_week.pickedup_time = data.time
			that.setData({
				reservation: data
			})
			wx.showToast({
				title: '预约食材成功',
				icon: 'success',
				duration: 2000
			})
		}).catch(err => {
			console.error(err)
			wx.showToast({
				title: '预约食材失败',
				icon: 'error',
				duration: 3000
			})
		})
	},
	
	toCancelReservation(e) {
		var that = this
		cancelReservation().then(data => {
			console.log(data)
			//var reservation = that.data.reservation;
			//reservation.last_week.pickedup = true
			//reservation.last_week.pickedup_time = data.time
			that.setData({
				reservation: data
			})
			wx.showToast({
				title: '取消预约成功',
				icon: 'success',
				duration: 2000
			})
		}).catch(err => {
			console.error(err)
			wx.showToast({
				title: '取消预约失败',
				icon: 'error',
				duration: 3000
			})
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