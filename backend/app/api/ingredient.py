from uuid import uuid4

from flask import request, abort, make_response, jsonify
from sqlalchemy import or_

from . import api
from .base import login_required, admin_required

from ..models import db, Ingredient
from ..status import STATUS_INGREDIENT_ID_INVALID, STATUS_INGREDIENT_NAME_INVALID, MESSAGES

@api.route('ingredient/info', methods=['GET'])
@login_required
def ingredient_info():
    print(request.args)
    ingredient_id = request.args.get('ingredient_id')
    ingredient = Ingredient.query.get_or_404(ingredient_id)

    return jsonify(ingredient.to_json()), 200

@api.route('ingredient/update', methods=['POST', 'DELETE'])
@admin_required
def ingredient_update():
    info = request.json
    print(info)
    ingredient_id = info.get('id')
    try:
        ingredient_id = int(ingredient_id)
        tax = int(info.get('tax'))
        price = int(info.get('price'))
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_INGREDIENT_ID_INVALID, message=MESSAGES[STATUS_INGREDIENT_ID_INVALID]), 400))

    if request.method == 'POST':
        if ingredient_id <= 0:
            ingredient = Ingredient()
            ingredient.code = uuid4().hex
            db.session.add(ingredient)
        else:
            ingredient = Ingredient.query.get_or_404(ingredient_id)
        name = info.get('name')
        ingredient.price = price
        ingredient.tax = tax
        if not name:
            abort(make_response(jsonify(errcode=STATUS_INGREDIENT_NAME_INVALID, message=MESSAGES[STATUS_INGREDIENT_NAME_INVALID]), 400))
        ingredient.name = name
    elif request.method == 'DELETE':
        ingredient = Ingredient.query.get_or_404(ingredient_id)
        ingredient.is_deleted = True

    db.session.commit()

    return jsonify(ingredient.to_json()), 200

@api.route('ingredients/info', methods=['GET'])
@login_required
def ingredients_info():
    ingredients = Ingredient.query.filter(or_(Ingredient.is_deleted==None, Ingredient.is_deleted==False)).order_by(Ingredient.id)
    print(ingredients.all())

    r = [c.to_json() for c in ingredients]
    return jsonify(r), 200
