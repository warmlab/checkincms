import config from '../../../config.js'
import {getDishesInfo} from '../../../accessor/recipe.js'

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
		console.log(options)
		var ids = JSON.parse(options.ids)
		this.setData({
			ids: ids
		})
    var that = this;
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

	toCreateDish(e) {
		wx.navigateTo({
			url: 'dish?id=0',
		})
	},

	dishesChange(e) {
		var ids = e.detail.value
		//ids.map(ele => {
		//	ele = parseInt(ele);
		//})

		var dishes = this.data.dishes;
		for (var i = 0; i < dishes.length; i++) {
			var index = ids.findIndex((ele) => ele == dishes[i].id)
			if (index >= 0) {
				dishes[i].index = index + 1;
				dishes[i].checked = true;
			} else {
				dishes[i].index = 0;
				dishes[i].checked = false;
			}
		}

		this.setData({
			dishes: dishes
		})
	},

	confirmDishes(e) {
		var dishes = []
		this.data.dishes.forEach(ele => {
			if (ele.checked) {
				dishes[ele.index-1] = ele
			}
		})

		var pages = getCurrentPages();
		var prePage = pages[pages.length - 2];

		if (prePage != undefined && prePage != null) {
			prePage.setData({
				dishes: dishes
			})
		}
		wx.navigateBack()
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
    getDishesInfo().then((data) => {
			data.map(ele => {
				ele.index = 0;
				ele.checked = false;
			})
			var ids = that.data.ids
			if (ids != undefined && ids != null) {
		var dishes = data;
		for (var i = 0; i < dishes.length; i++) {
			var index = ids.findIndex((ele) => ele == dishes[i].id)
			if (index >= 0) {
				dishes[i].index = index + 1;
				dishes[i].checked = true;
			} else {
				dishes[i].index = 0;
				dishes[i].checked = false;
			}
		}
			}
			that.setData({
				dishes: data,
			});
			wx.hideNavigationBarLoading()
			wx.hideLoading()
		}).catch((err) => {
			wx.hideNavigationBarLoading()
			wx.hideLoading()
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
