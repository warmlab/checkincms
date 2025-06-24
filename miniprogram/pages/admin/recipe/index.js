import config from '../../../config.js'
import {getRecipeInfo, updateRecipeInfo} from '../../../accessor/recipe.js'

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

	onNameChange(e) {
		var recipe = this.data.recipe
		recipe.name = e.detail.value
		this.setData({
			recipe: recipe
		})
	},

	selectDishes(e) {
		var ids = []
		this.data.dishes.forEach(ele => {
			ids.push(ele.id)
		})
		ids = JSON.stringify(ids)
		wx.navigateTo({
			url: `dish_selector?ids=${ids}`,
		})
	},

	saveRecipe(e) {
		var that = this
		wx.showLoading({
			title: '食谱更新中...',
		})
		var recipe = this.data.recipe
		recipe.dishes = []
		this.data.dishes.forEach(ele => {
			recipe.dishes.push(ele.id)
		})

		console.log('recipe', recipe)
		updateRecipeInfo(recipe).then(data => {
			that.setData({
				recipe: data.recipe,
				dishes: data.dishes
			});

			console.log('result', data)
			wx.hideLoading()
			wx.showToast({
				title: '食谱更新成功',
				icon: 'success',
			complete: () => {
				setTimeout(() => {
					wx.navigateBack()
				}, 1500)
			}
			})
		}).catch(err => {
			console.error(err)
			wx.hideLoading()
			wx.showToast({
				title: '食谱更新失败',
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
		var that = this
    wx.showLoading({
      title: "信息加载中...",
      mask: true,
    });
		// get company info from server
		wx.showNavigationBarLoading()
    getRecipeInfo().then((data) => {
			that.setData({
				recipe: data.recipe,
				dishes: data.dishes
			});
			wx.hideNavigationBarLoading()
			wx.hideLoading()
		}).catch((err) => {
			console.log('error', err)
			that.setData({
				recipe: err.recipe,
				dishes: err.dishes
			});
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