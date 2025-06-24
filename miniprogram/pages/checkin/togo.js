import config from '../../config.js'
import {getCheckInInfo, checkin, takeoutTogo} from '../../accessor/api.js'
import {format_date_with_weekday} from '../../utils/util.js'

Page({
  /**
   * Page initial data
   */
  data: {
    base_image_url: config.base_image_url,
    hide_reservation: true,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    //var that = this
    // get company info from server
    this.onPullDownRefresh();
    //wx.hideLoading()
    //wx.stopPullDownRefresh()
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {},

  /**
   * Lifecycle function--Called when page show
   */
	onShow() {},

	onReservationChange(e) {
		this.setData({
			reservation: e.detail.value
		});
	},
	
	getPackaging(e) {
		var that = this
    wx.showLoading({
      title: "信息加载中...",
      mask: true,
    });
		takeoutTogo(this.data.status.id).then(data => {
				this.setData({
					status: data
				})
				wx.hideLoading()
				wx.showToast({
					title: '取餐成功',
					icon: 'success'
				})
		}).catch(err => {
				wx.hideLoading()
				wx.showToast({
					title: '取餐失败',
					icon: 'error'
				})
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
    var that = this;
    wx.showLoading({
      title: "信息加载中...",
      mask: true,
    });
    wx.showNavigationBarLoading();
		getCheckInInfo().then((data) => {
			var today = new Date(data.today * 1000);
			that.setData({
				status: data,
				//today: format_date_with_weekday(today),
				//hide_reservation: data.reservation,
				//bulletins: data.bulletins
			});
			wx.stopPullDownRefresh();
			wx.hideNavigationBarLoading();
			wx.hideLoading();
		}).catch((err) => {
			var today = new Date();
			that.setData({
				today: format_date_with_weekday(today),
			});
			console.error("get checkin prepare info error", err);
			wx.stopPullDownRefresh();
			wx.hideNavigationBarLoading();
			wx.hideLoading();
		});
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {},

  toCheckin(e) {
    var that = this;
    checkin(that.data.reservation, e.detail.value.note, true)
      .then((data) => {
        console.log("result", data);
				that.setData({
					status: data,
					//today: format_date_with_weekday(today),
					//hide_reservation: data.reservation,
					//bulletins: data.bulletins
				});
        //var checkin_time = new Date(data.checkin_time*1000)
        //console.log('date', checkin_time)
        //var status = that.data.checkin_status;
        //if (status != undefined && status != null && status.length > data.checkin_time_index) {
        //	status[data.checkin_time_index].status = 1
        //	this.setData({
        //		checkin_status: status,
        //		//hide_reservation: data.reservation
        //	})
        //} else {
        //	this.setData({
        //		hide_reservation: data.reservation
        //	})
        //}
        wx.showToast({
          title: "谢谢您预约成功",
          icon: "success",
          duration: 3000,
          mask: true,
        });
      })
      .catch((err) => {
        console.error("staff checkin failed", err);
        wx.showToast({
          title: "对不起预约失败",
          icon: "error",
          duration: 3000,
          mask: true,
        });
      });
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {
    return {
      title: "好友邀请您一起签到",
      path: "pages/index/index",
    };
  },
});
