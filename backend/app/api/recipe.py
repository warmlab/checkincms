import os, hashlib

from io import BytesIO
from time import time
from datetime import datetime, timedelta

from flask import current_app, request, jsonify, abort, make_response
from flask.views import MethodView
from sqlalchemy.types import Date

from werkzeug.datastructures import FileStorage

from PIL import Image as PLImage

from ..status import STATUS_DISH_ID_INVALID, STATUS_DISH_NAME_INVALID, STATUS_MEAL_OPTION_INVALID, STATUS_NO_RESOURCE, MESSAGES

from ..models import db, Dish, DishImage, Recipe, RecipeDish
from ..models import MEAL_LUNCH, MEAL_SUPPER

from . import api
from .base import login_required, admin_required

@api.route('/dishes/info', methods=['GET'])
@login_required
def dish_list():
    #dishes = Dish.query.order_by(Dish.id).all() # TODO order by a different column
    today = datetime.today()
    begin_of_day = datetime(today.year, today.month, today.day)
    middle_of_day = begin_of_day + timedelta(hours=15)
    end_of_day = begin_of_day + timedelta(days=1)
    if today < middle_of_day:
        dishes = Dish.query.filter(Dish.serve_time > begin_of_day, Dish.serve_time < middle_of_day).order_by(Dish.serve_time).all() # TODO order by a different column
    else:
        dishes = Dish.query.filter(Dish.serve_time >= middle_of_day, Dish.serve_time < end_of_day).order_by(Dish.serve_time).all() # TODO order by a different column

    rs = []
    for d in dishes:
        r = d.to_json()
        r['images'] = [i.to_json() for i in d.images]
        rs.append(r)
    #r = [r.to_json() for r in dishes]
    return jsonify(rs), 200

@api.route('/dish/info', methods=['GET'])
@login_required
def dish_info():
    dish_id = request.args.get('dish_id')
    dish = Dish.query.get_or_404(dish_id)

    return jsonify({'dish': dish.to_json(), 'images': [i.to_json() for i in dish.images]}), 200

@api.route('dish/update', methods=['POST', 'DELETE'])
@admin_required
def dish_update():
    info = request.json
    dish_id = info.get('id')
    try:
        dish_id = int(dish_id)
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_DISH_ID_INVALID, message=MESSAGES[STATUS_DISH_ID_INVALID]), 400))

    if request.method == 'POST':
        if dish_id <= 0:
            dish = Dish()
            db.session.add(dish)
        else:
            dish = Dish.query.get_or_404(dish_id)
        name = info.get('name')
        if not name:
            abort(make_response(jsonify(errcode=STATUS_DISH_NAME_INVALID, message=MESSAGES[STATUS_DISH_NAME_INVALID]), 400))
        dish.name = name
        dish.note = info.get('note')
        now = datetime.now()

        if now.hour < 15: # TODO 下午3:00之前为午餐
            dish.meal = MEAL_LUNCH # 午餐
        else:
            dish.meal = MEAL_SUPPER # 晚餐

        to_remove_images = info.get('to_remove_images')
        print('to_remove_images', to_remove_images)
        if to_remove_images:
            for item in to_remove_images:
                image_id = item.get('id')
                image = DishImage.query.get(image_id)
                if image:
                    #os.unlink(image.path)
                    try:
                        os.unlink(os.path.join(current_app.config['UPLOAD_FOLDER'], image.path))
                    except Exception as e:
                        pass
                    db.session.delete(image)
    elif request.method == 'DELETE':
        dish = Dish.query.get_or_404(dish_id)
        dish.is_deleted = True

    db.session.commit()

    return jsonify(dish.to_json()), 200

@api.route('/dish/images', methods=['GET'])
@login_required
def dish_images():
    images = DishImage.query.all()

    return jsonify([i.to_json() for i in images])

@api.route('/recipe/info', methods=['GET'])
@login_required
def recipe_info():
    args = request.args
    meal = args.get('meal_selection')

    now = datetime.now()
    try:
        meal = int(meal)
    except Exception as e:
        meal = 0
    if meal != MEAL_LUNCH or meal != MEAL_SUPPER: # 现在只提供午晚餐
        if now.hour < 15: # TODO 下午3:00之前为午餐
            meal = MEAL_LUNCH # 午餐
        else:
            meal = MEAL_SUPPER # 晚餐

    print(meal, now, args)
    
    recipe = Recipe.query.filter(Recipe.meal==meal, Recipe.begin_time.cast(Date)==now.date()).first()
    if not recipe:
        return jsonify({'recipe': {'id': 0, 'meal': meal, 'name': ''}, 'dishes': []}), 404

    rds = recipe.dishes
    dishes = []
    for rd in rds:
        dish = rd.dish.to_json()
        dish['images'] = [i.to_json() for i in rd.dish.images.all()]
        dishes.append(dish)
        #print(rd.dish.images)

    return jsonify({'recipe': recipe.to_json(), 'dishes': dishes}), 200 


@api.route('/recipe/update', methods=['POST', 'DELETE'])
@admin_required
def recipe_update():
    info = request.json
    recipe_id = info.get('id')
    name = info.get('name')
    meal = info.get('meal')
    dish_ids = info.get('dishes')

    try:
        meal = int(meal)
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_MEAL_OPTION_INVALID, message=MESSAGES[STATUS_MEAL_OPTION_INVALID]), 400))

    if recipe_id <= 0:
        recipe = Recipe()
        db.session.add(recipe)
    else:
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            recipe = Recipe()
            db.session.add(recipe)
        else:
            RecipeDish.query.filter_by(recipe_id=recipe_id).delete()

    recipe.name = name
    recipe.meal = meal
    #dishes = Dish.query.filter(Dish.id.in_(dish_ids))
    for index, dish_id in enumerate(dish_ids, start=1):
        dish = Dish.query.get(dish_id)
        if dish:
            #rd = RecipeDish.query.get((recipe_id, dish.id))
            rd = RecipeDish()
            if not rd:
                rd = RecipeDish()
            rd.recipe = recipe
            rd.dish_id = dish.id
            rd.index = index
            db.session.add(rd)
    db.session.commit()

    rds = recipe.dishes
    dishes = []
    for rd in rds:
        dish = rd.dish.to_json()
        dish['images'] = [i.to_json() for i in rd.dish.images.all()]
        dishes.append(dish)

    return jsonify({'recipe': recipe.to_json(), 'dishes': dishes}), 201 

class ImageView(MethodView):
    methods = ['GET', 'POST', 'DELETE']
    def generate_filename(self, filename):
        pos = filename.rfind('.')
        if pos > 0:
            ext = filename[pos+1:]
            return '.'.join([str(time()), ext])
        else:
            return str(time())

    def generate_hash_value(self, file_storage):
        md5 = hashlib.md5()
        md5.update(file_storage.read())
        file_storage.seek(0)

        return md5.hexdigest()

    @login_required
    def get(self):
        image = DishImage.query.filter_by(name=request.args.get('name')).first()
        if not image:
            abort(make_response(jsonify(errcode=STATUS_NO_RESOURCE, message=MESSAGES[STATUS_NO_RESOURCE] % 'image info'), 404))

        return jsonify(image.to_json())

    @admin_required
    def post(self):
        upload_file = request.files.get('upload-image')

        hash_value = self.generate_hash_value(upload_file)
        filename = self.generate_filename(upload_file.filename)
        print('upload file name: ', upload_file.filename, ' hash value ', hash_value)

        image = DishImage.query.filter_by(hash_value=hash_value).first()
        if not image:
            print('to create an image item')
            image = DishImage()
            #image.hash_value = hash_value
            image.name = filename
            db.session.add(image)

            bytesIO = BytesIO()
            upload_file.save(bytesIO)
            #upload_file.save(original_file) # original file
            im = PLImage.open(bytesIO)
            width, height = im.size
            if width * 0.618 > height:
                w = height / 0.618
                h = height
            else:
                w = width
                h = width * 0.618
            # 取中间部分
            left = int((width - w) / 2)
            upper = int((height - h) / 2)
            right = left + int(w)
            lower = upper + int(h)
            im = im.crop((left, upper, right, lower))
            im = im.resize((960, 593)) # 593 = 960 * 0.618

            original_file = os.path.join(current_app.config['UPLOAD_FOLDER'], 'recipe', filename)
            im.save(original_file)
            #if int(request.values.get('type')) != 4:
            #    im = PLImage.open(original_file)
            #    im.thumbnail((300,300))
            #    im.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename), 'JPEG')
            #else:
            #    im = PLImage.open(original_file)
            #    im.thumbnail((750,330))
            #    im.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename), 'JPEG')
        #else:
        #    print('to update thumbnail image for image', image.name)
        #    original_file = os.path.join(current_app.config['UPLOAD_FOLDER'], 'dish', image.name)
            #if int(request.values.get('type')) != 4:
            #    im = PLImage.open(original_file)
            #    im.thumbnail((300,300))
            #    im.save(os.path.join(current_app.config['UPLOAD_FOLDER'], image.name), 'JPEG')
            #else:
            #    im = PLImage.open(original_file)
            #    im.thumbnail((750,330))
            #    im.save(os.path.join(current_app.config['UPLOAD_FOLDER'], image.name), 'JPEG')

        print('image upload', request.values)
        dish_id = request.values.get('dish_id')
        try:
            dish_id = int(dish_id)
        except Exception as e:
            abort(make_response(jsonify(errcode=STATUS_DISH_ID_INVALID, message=MESSAGES[STATUS_DISH_ID_INVALID]), 400))

        image.dish_id = dish_id
        image.name = request.values.get('name')
        image.index = request.values.get('index')
        image.path = os.path.join('recipe', filename)
        #image.note = request.values.get('note')
        #image.type = image.type | image_type

        db.session.commit()
        return jsonify(image.to_json()), 201

    @admin_required
    def delete(self):
        #shop = Shoppoint.query.filter_by(code=request.headers['X-SHOPPOINT']).first_or_404()
        image = DishImage.query.filter_by(id=request.json.get('id')).first()
        if not image:
            abort(make_response(jsonify(errcode=STATUS_NO_RESOURCE, message=MESSAGES[STATUS_NO_RESOURCE]), 404))

        try:
            os.unlink(os.path.join(current_app.config['UPLOAD_FOLDER'], image.path))
            #os.unlink(os.path.join(current_app.config['UPLOAD_FOLDER'], image.name))
        except Exception as e:
            print('remove file error', e)

        db.session.delete(image)
        db.session.commit()

        return jsonify(image.to_json()), 201

api.add_url_rule('/dish/image', view_func=ImageView.as_view('image'))
