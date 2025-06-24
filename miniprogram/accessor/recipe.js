import request from "./request.js"

const getDishInfo = (dish_id) => {
	return new Promise((resolve, reject) => {
		request.get('dish/info', {dish_id: dish_id}).then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const getDishesInfo = () => {
	return new Promise((resolve, reject) => {
		request.get('dishes/info').then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const updateDishInfo = (dish_info) => {
	return new Promise((resolve, reject) => {
		request.post('dish/update', dish_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const deleteDishInfo = (dish_info) => {
	return new Promise((resolve, reject) => {
		request.delete('dish/update', dish_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const getRecipeInfo = (recipe_info) => {
	return new Promise((resolve, reject) => {
		request.get('recipe/info', recipe_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const updateRecipeInfo = (recipe_info) => {
	return new Promise((resolve, reject) => {
		request.post('recipe/update', recipe_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

module.exports = {
	getDishInfo,
	getDishesInfo,
	updateDishInfo,
	deleteDishInfo,
	getRecipeInfo,
	updateRecipeInfo,
}
