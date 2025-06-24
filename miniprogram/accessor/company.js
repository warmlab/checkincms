import request from "./request.js"

const getCompanyInfo = (company_id) => {
	return new Promise((resolve, reject) => {
		request.get('company/info', {company_id: company_id}).then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const getCompaniesInfo = () => {
	return new Promise((resolve, reject) => {
		request.get('companies/info').then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const updateCompanyInfo = (company_info) => {
	return new Promise((resolve, reject) => {
		request.post('company/update', company_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const deleteCompanyInfo = (company_info) => {
	return new Promise((resolve, reject) => {
		request.delete('company/update', company_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

module.exports = {
	getCompanyInfo,
	getCompaniesInfo,
	updateCompanyInfo,
	deleteCompanyInfo,
}