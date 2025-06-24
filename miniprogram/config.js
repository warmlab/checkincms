const config = {
	version: '2.0.10',
	api_version: '1.0.0',
	//map_key: 'OFEBZ-OZFWI-PNDGD-52RTP-UVJ2V-5GFEX',
	terminal_type: 2, // 1 - WebSite; 2 - Miniprogram

	base_url: 'https://m.jjconsulting.ca/api',
	base_image_url: 'https://m.jjconsulting.ca/media',
	//base_url: 'http://m.jjconsulting.ca:5000/api',
	//base_image_url: 'http://m.jjconsulting.ca:5000/media',
	//base_url: 'http://192.168.0.51:5000/api',
	//base_image_url: 'http://192.168.0.51:5000/media',
	//base_url: 'http://192.168.1.209:5000/api',
	//base_image_url: 'http://192.168.1.209:5000/media',
	//base_url: 'http://10.0.0.123:5000/api',
	//base_image_url: 'http://10.0.0.123:5000/media',

	initSystemInfo: () => {
		var res = wx.getSystemInfoSync()
		//console.log(res)

		wx.WIN_WIDTH = res.screenWidth
		wx.WIN_HEIGHT = res.screenHeight
		wx.IS_IOS = /ios/i.test(res.system)
		wx.IS_ANDROID = /android/i.test(res.system)
		wx.STATUS_BAR_HEIGHT = res.statusBarHeight
		wx.DEFAULT_HEADER_HEIGHT = 46; // res.screenHeight - res.windowHeight - res.statusBarHeight
		wx.DEFAULT_CONTENT_HEIGHT = res.screenHeight - res.statusBarHeight - wx.DEFAULT_HEADER_HEIGHT
		wx.IS_APP = true
		wx.IPHONEX = res.model.search("iPhone X")
	}
}

export default config
