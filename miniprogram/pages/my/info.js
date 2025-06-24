//require '../../utils/request.js'
//import request from "../../utils/request.js"
import config from '../../config.js'
import {upload_image} from '../../accessor/request.js'
import {getStaffInfo, signUpStaff} from "../../accessor/api.js"

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

let app = getApp()

Page({
  data: {
		avatarUrl: defaultAvatarUrl,
		avatarChoosed: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
	},

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
		this.onPullDownRefresh()
	},

	onPullDownRefresh() {
		var that = this;
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		});
		// get company info from server
		wx.showNavigationBarLoading()
		getStaffInfo().then(data => {
			console.log(data);
			var avatar_url
			if (data.staff.avatar_url != undefined && data.staff.avatar_url != null &&
				!data.staff.avatar_url.startsWith('http')) {
				avatar_url = `${[config.base_image_url, data.staff.avatar_url].join('/')}`
				data.staff.avatar_url = avatar_url
			} else {
				avatar_url = data.staff.avatar_url
			}
			that.setData({
				companies: data.companies,
				staff: data.staff,
				company_id: data.staff.company_id,
				avatar_url: avatar_url
			})
			wx.stopPullDownRefresh()
			wx.hideNavigationBarLoading()
			wx.hideLoading()
		}).catch(err => {
			console.error("get company info error", err)
			wx.stopPullDownRefresh()
			wx.hideNavigationBarLoading()
			wx.hideLoading()
		})
	},

  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
	},

  onChooseAvatar(e) {
    this.setData({
			avatar_url: e.detail.avatarUrl,
			avatarChoosed: true
    })
	},

	/*
  onInputChange(e) {
    const nickname = e.detail.value
    const { avatar_url } = this.data.userInfo
    this.setData({
      nickname: nickname,
      hasUserInfo: nickname && avatar_url && avatar_url !== defaultAvatarUrl,
    })
	},*/

	companySelect(e) {
		this.setData({
			company_id: parseInt(e.detail.value),
		})
  },
	
	toSignupStaff(e) {
		console.log('signup a staff', e.detail.value);

		var nickname = e.detail.value.nickname;
		var last_name = e.detail.value.last_name;
		var first_name = e.detail.value.first_name;
		var email = e.detail.value.email;
		var phone = e.detail.value.phone;

		if (nickname == null || nickname.trim() == "") {
			wx.showToast({
				title: '请输入您的昵称',
				icon: 'error',
			});

			return;
		}

		if (last_name == null || last_name.trim() == "") {
			wx.showToast({
				title: '请输入您的姓氏',
				icon: 'error'
			});
			return;
		}

		if (first_name == null || first_name.trim() == "") {
			wx.showToast({
				title: '请输入您的名字',
				icon: 'error'
			});
			return;
		}

		if (this.data.company_id <= 0) {
			wx.showToast({
				title: '请选择您的公司',
				icon: 'error',
				duration: 2000
			});

			return;
		}

		wx.showLoading({
			title: '头像上传中...',
			mask: true
		});
		console.log(this.data.avatarChoosed)
		if (this.data.avatarChoosed) {
			var that = this
			// upload avatar
			upload_image('staff/avatar', this.data.avatar_url).then(data => {
				console.log("upload avatar successfully", data);
				// that.data.images.push(data)
				var avatar_url
				if (!data.avatar_url.startsWith('http')) {
					avatar_url= `${[config.base_image_url, data.avatar_url].join('/')}`
				} else {
					avatar_url = data.avatar_url
				}
				that.setData({
					avatar_url: avatar_url
				})

				app.getUserInfo().then(info => {
					info.avatar_url = avatar_url
					wx.setStorageSync('appUserInfo', info)
				})
				wx.hideLoading()
			}).catch(err => {
				console.error(err)
				wx.hideLoading()
			})
		}

		wx.showLoading({
			title: '信息更新中...',
			mask: true
		});
		signUpStaff(nickname, last_name, first_name, this.data.company_id, email, phone).then(userInfo => {
			//console.log('sign up success', userInfo)
			// store resul
			if (!userInfo.avatar_url.startsWith('http')) {
				userInfo.avatar_url =  `${[config.base_image_url, userInfo.avatar_url].join('/')}`
			}
			wx.setStorageSync('appUserInfo', userInfo)
			wx.hideLoading()
			wx.showToast({
        title: "您已成功注册",
        icon: "success",
        complete: () => {
          setTimeout(() => {
            wx.navigateBack({
							delta: 1,
							success: e => {
								var pages = getCurrentPages();
								var former_page = pages[pages.length - 2];
								if (former_page == undefined || former_page == null) return;
								else former_page.onPullDownRefresh()
							}
						})
          }, 1500);
        },
      });
		}).catch(err => {
			console.error('sign up failed', err)
		})
	},

  getUserProfile(e) {
		var that = this
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
})
