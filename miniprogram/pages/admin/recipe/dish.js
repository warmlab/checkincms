import config from '../../../config.js'
import {upload_image} from '../../../accessor/request.js'
import {getDishInfo, updateDishInfo} from '../../../accessor/recipe.js'

Page({

  /**
   * Page initial data
   */
  data: {
		base_image_url: config.base_image_url,
		images: [], // get from server
		to_remove_images: [],
		images_choosed: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
		if (options.id == null || options.id <= 0) {
			this.setData({
				dish: {id: 0, name: '', note: ''}
			})

			return;
		}

		var that = this
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
		// get dishes info from server
		getDishInfo(options.id).then(data => {
			console.log(data);
			that.setData({
				dish: data.dish,
				images: data.images
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
	
	chooseImages(e) {
    var that = this;
    wx.chooseMedia({
			count: 9,
			mediaType: ['image'],
			sourceType: ['album', 'camera'],
			maxDuration: 30,
			camera: 'back',
      success(res) {
        var details = that.data.images_choosed
        res.tempFiles.forEach(ele => {
          details.push(ele)
        })
        console.log(details) 
        that.setData({
          images_choosed: details
        })
      }
    })  
	},
	
	removeImage(e) {
    console.log(e)
    var index = parseInt(e.currentTarget.dataset.index)
    var source = e.currentTarget.dataset.source
        
    if (source === 'choosed') { // choosed
			this.data.images_choosed.splice(index, 1)
			this.setData({
				images_choosed: this.data.images_choosed
			})
    } else if (source === 'original') {
      var to_remove_images = this.data.to_remove_images
			to_remove_images = to_remove_images.concat(this.data.images.splice(index, 1))
			this.setData({
				images: this.data.images,
				to_remove_images: to_remove_images
			})
    }
	},
	
	uploadImages(images, data) {
    //var banner_ids = [];
    var photo_ids = [];
		var that = this;

		console.log('images', images)
    return new Promise(function (resolve, reject) {
      // 如果产品图片没有做修改
      if (images.length == 0) {
				console.log('asfasd')
				resolve([])
      }

      //wx.showLoading({
      //  title: '菜谱图片上传中...',
      //  mask: true
      //})

      images.forEach((image, index) => {
				console.log('upload index', index)
				data.index = index + 1
				upload_image('dish/image', image.tempFilePath, data).then(data => {
					console.log("upload image successfully", data);
					// that.data.images.push(data)
					photo_ids.push({
						id: data.id,
					});

					if (photo_ids.length === images.length) {
						resolve(photo_ids);
					}
				}).catch(err => {
					reject(err)
				})
      })
    })
	},
	
	saveDish(e) {
    var that = this;

    var data = e.detail.value
    //data.on_sale = this.data.on_sale
    //data.on_recommend = this.data.on_recommend
    //data.web_allowed = this.data.web_allowed
    //data.promote_allowed = this.data.promote_allowed
    ////data.wrap_type = this.data.wrap_type
    //data.category = this.data.category
  
    if (!this.checkInput(data)) {
      return
		}

    if (that.data.images.length === 0 && this.data.images_choosed.length === 0) {
      wx.showToast({
        title: '请至少选择一张产品图片',
        icon: 'none',
        duration: 3000
      })
          
      return
    } 

    //var images_choosed = this.data.images_choosed.map(item => item)
    //var images_choosed = this.data.images_choosed
    //var images = images_choosed.concat(this.data.detail_images_choosed)
		//if (images_choosed) images_choosed.push({path: that.data.detail_images, index: 1, type: 2})
		wx.showLoading({
			title: !!that.data.code ? '创建菜品信息中':'更新菜品信息中',
			mask: true
		})
			//data.category = that.data.category
			data.id = that.data.dish.id
      //data.images = ids
			data.to_remove_images = that.data.to_remove_images
			console.log('update dish', data)
		updateDishInfo(data).then(res => {
			console.log('update dish result', res)
      wx.hideLoading()
		wx.showLoading({
			title: '上传菜品图片中',
			mask: true
		})
			that.uploadImages(that.data.images_choosed, {name: data.name, dish_id: res.id}).then(ids => {
			wx.hideLoading()
			
		var pages = getCurrentPages();
		var prePage = pages[pages.length - 2];

		if (prePage != undefined && prePage != null) {
			prePage.onPullDownRefresh()
		}
          wx.navigateBack()
    }).catch(err => {
      console.error('comfirm product erorr:', err)
      wx.hideLoading()
      wx.showToast({
        title: '上传图片失败',
        icon: 'error',
        duration: 2000
      })
		})
		}).catch(err => {
      wx.hideLoading()
          wx.showToast({
            title: '提交失败请与管理员联系',
            icon: 'none',
            duration: 2000
          })
		})
      //if (that.data.product)
        //data.code = that.data.product.code
      //data.price = data.price * 100
      //data.member_price = data.member_price * 100
      //data.promote_price = data.promote_price * 100
			//console.log('post data:', data)
			//updateRecipeInfo(data).then(res => {
   //       wx.hideLoading()
   //       //var pages = getCurrentPages();
   //       //var prePage = pages[pages.length - 2];
   //       //prePage.setData({dragon:res.data});
   //       //prePage.syncProducts();
   //       wx.navigateBack()
   //     }).catch(err => {
   //       wx.hideLoading()
   //       wx.showToast({
   //         title: '提交失败请与管理员联系',
   //         icon: 'none',
   //         duration: 2000
   //       })
   //     })
	},

	checkInput: function (data) {
    if (data.name.trim() === '') {
      wx.showToast({
        title: '需要给产品起个名字',
        icon: 'none',
        duration: 3000
      })  
            
      return false
    }       
/*
    if (data.note.trim() === '') {
      wx.showToast({
        title: '需要给产品写点摘要',
        icon: 'none',
        duration: 3000
      })
        
      return false
		} 
		*/

		return true;
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