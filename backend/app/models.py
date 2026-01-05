from enum import Enum
from inspect import ismethod
from flask import current_app

from time import time
from datetime import datetime, date
from urllib.parse import urlencode
from urllib.request import urlopen
from urllib.request import Request

#from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method

#from flask import current_app#, url_for
from sqlalchemy.orm import DeclarativeBase
from flask_sqlalchemy import SQLAlchemy

from authlib.jose import JsonWebSignature, JsonWebToken, jwt, JsonWebKey, JWTClaims
#from itsdangerous import TimedSerializer, SignatureExpired, BadSignature

#from ..config import Config

MEAL_BREAKFAST = 0x01
MEAL_LUNCH = 0x02
MEAL_ATERNOON_TEA = 0x04
MEAL_SUPPER = 0x08
MEAL_NIGHT_SNACK = 0x10

MEAL_AFTERWARDS = 0x1000 # 补签

TOGO_RESERVED = 0x01
TOGO_PREPARED = 0x02
TOGO_TAKEN_OUT = 0x04

class BaseModel(DeclarativeBase):
    #__abstract__ = True
    _include_column_ = []

    def to_json(self):
        dic = {}
        for k in self.__class__._include_column_:
            value = getattr(self, k)
            if isinstance(value, list):
                values = []
                for v in value:
                    if isinstance(v, db.Model):
                        values.append(v.to_json())

                dic[k] = values
            else:
                if isinstance(value, db.Model):
                    dic[k] = value.to_json()
                elif isinstance(value, datetime):
                    dic[k] = value.strftime('%Y-%m-%d %H:%M')
                elif isinstance(value, date):
                    dic[k] = value.strftime('%Y-%m-%d')
                else:
                    dic[k] = value

        return dic

db = SQLAlchemy(model_class=BaseModel)

class Company(db.Model):
    __tablename__ = 'company'
    _include_column_ = ['id', 'code', 'name']

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(32), unique=True, index=True)
    name = db.Column(db.String(128))
    is_deleted = db.Column(db.Boolean, default=False)
    note = db.Column(db.Text)

    def __repr__(self) -> str:
        return self.name

class Staff(db.Model):
    __tablename__ = 'staff'
    _include_column_ = ['openid', 'nickname', 'last_name', 'first_name', 'avatar_url', 'email', 'phone', 'company_id', 'company', 'is_active', 'is_admin', 'privilege', 'access_token']

    id = db.Column(db.Integer, primary_key=True)
    openid = db.Column(db.String(64), index=True, unique=True) # used in weixin
    nickname = db.Column(db.String(128)) # 昵称
    first_name = db.Column(db.String(64)) # 名
    last_name = db.Column(db.String(64)) # 姓
    #full_name = db.Column(db.String(128)) # 全名，搜索使用
    avatar_url = db.Column(db.String(1024)) # 头像
    gender = db.Column(db.SmallInteger, default=0) # 会员性别, 0为unkown
    register_phone = db.Column(db.String(16)) # 注册微信使用的手机号码
    phone = db.Column(db.String(16)) # 本地手机号码
    email = db.Column(db.String(128))
    is_active = db.Column(db.Boolean, default=False) # 注册完成即为active
    is_admin = db.Column(db.Boolean, default=False)
    is_deleted = db.Column(db.Boolean, default=False) #删除之后，不能再登录
    privilege = db.Column(db.Integer, default=0) # every bit as a privilege

    # 针对小程序登录需要的参数
    expires_time = db.Column(db.BigInteger) # timestamp, 有效期是2hours
    session_key = db.Column(db.String(256)) # 第三方返回的session key
    access_token = db.Column(db.String(512)) # 用户登录需要的令牌

    about_me = db.Column(db.Text)

    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=True)
    company = db.relationship('Company',
                         backref=db.backref('staffs', lazy="dynamic"))

    stocks = db.relationship('Stocking', back_populates='staff')

    def __repr__(self) -> str:
        if self.last_name and self.first_name:
            return self.last_name + self.first_name
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        else:
            return ""

    #def generate_auth_token(self, secret_key, expiration=7200):
    #    s = TimedSerializer(secret_key, expires_in=expiration)

    #    return s.dumps({'openid': self.openid})

    def generate_access_token(self):
        header = {'alg': 'ES256'}
        payload = {
            'iss': current_app.config['ISSUER'],
            'sub': self.openid,
            'aud': current_app.config['AUDIENCE'],
            'exp': int(time()) + 7200,
            'iat': int(time())
        }
        with open(current_app.config['PRIVATE_KEY'], 'rb') as pkd:
            pk = pkd.read()
        token = jwt.encode(header, payload, pk)
        self.access_token = token.decode()

    def verify_access_token(self):
        with open(current_app.config['PUBLIC_KEY'], 'rb') as pfd:
            pk = pfd.read()
        claims_options = {
            "iss": {
                "essential": True,
                "values": current_app.config['ISSUER']
            },
            "aud": {
                "essential": True,
                "values": current_app.config['AUDIENCE']
            },
            "exp": {
                "validate": JWTClaims.validate_exp,
            },
            "sub": {
                "essential": True,
                "values": self.openid
            },
            "is_admin": {
                "essential": True,
                "values": [True,False]
            },
            "is_moderator": {
                "essential": True,
                "values": [True,False]
            }
        }
        claims = jwt.decode(self.access_token, pk, claims_params=claims_options)

        now = int(time())
        if claims.get('iss') == current_app.config['ISSUER'] and\
            claims.get('sub') == self.openid and\
            claims.get('aud') == current_app.config['AUDIENCE'] and\
            claims.get('iat') <= now and claims.get('exp') > now:
            return True

        return False

class Ingredient(db.Model):
    __tablename__ = 'ingredient'
    _include_column_ = ['id', 'code', 'name', 'price', 'tax']
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(64), unique=True, index=True) # 可以是商品的条形码
    name = db.Column(db.String(128))
    price = db.Column(db.Integer, default=0) # (单价[不含税])单位：cent (not dollar)，仅为通常价格（不考虑特价情况），不作为最终计算使用
    tax = db.Column(db.SmallInteger, default=0) # 0-100 # 只取整数部分，使用时除以100
    kindof = db.Column(db.Integer) # 食材的类型 - not used yet
    is_deleted = db.Column(db.Boolean, default=False)

    stocks = db.relationship('Stocking', back_populates='ingredient')

# 食材的库存
class Stocking(db.Model):
    __tablename__ = 'stocking'
    id = db.Column(db.Integer, primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.id'))
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id')) # 入库人员
    price = db.Column(db.Integer, default=0) # (单价[不含税])单位：cent (not dollar)，本次进货价格
    amount = db.Column(db.Integer, default=0)
    total_price = db.Column(db.Integer, default=0) # (总价[含税])单位：cent (not dollar)
    occur_time = db.Column(db.DateTime, default=datetime.now) # 入库时间
    update_time = db.Column(db.DateTime, default=datetime.now) # 更新时间

    ingredient = db.relationship('Ingredient', back_populates='stocks')
    staff = db.relationship('Staff', back_populates='stocks')


class Combo(db.Model): # 套餐
    __tablename__ = 'combo'
    _include_column_ = ['id', 'name', 'note']
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    note = db.Column(db.Text)

    def __repr__(self) -> str:
        return self.name

    
class ComboIngredient(db.Model):
    __tablename__ = 'combo_ingredient'
    combo_id = db.Column(db.Integer, db.ForeignKey('combo.id'), primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.id'), primary_key=True)
    index = db.Column(db.Integer, default=1) # 显示的顺序

    combo = db.relationship('Combo',
                         backref=db.backref('ingredients', lazy="dynamic"))
    ingredient = db.relationship('Ingredient',
                         backref=db.backref('combos', lazy="dynamic"))

class Reservation(db.Model):
    __tablename__ = 'reservation'
    _include_column_ = ['reservation', 'occur_time', 'pickup_time']

    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    combo_id = db.Column(db.Integer, db.ForeignKey('combo.id'), nullable=True)
    reservation = db.Column(db.SmallInteger, default=0)
    occur_time = db.Column(db.DateTime, default=datetime.now)
    pickup_time = db.Column(db.DateTime, default=None)
    update_time = db.Column(db.DateTime, default=datetime.now)
    #is_cancelled = db.Column(db.Boolean, default=False) # TODO does that need to keep the records of cancelled
    #cancelled_time = db.Column(db.DateTime, default=None)

    staff = db.relationship('Staff',
                         backref=db.backref('reservations', lazy="dynamic"))

    combo = db.relationship('Combo',
                         backref=db.backref('reservations', lazy="dynamic"))

class CheckInHistory(db.Model):
    __tablename__ = 'checkin_history'
    _include_column_ = ['id', 'mode', 'occur_time', 'togo_status']

    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    mode = db.Column(db.SmallInteger, default=0) # 0 - 未签到 0x1-早餐签到 0x2-午餐签到, 0x4-晚餐签到, 0x8-下午茶签到 0x10-夜宵签到 0x10000-补签
    #meal = db.Column(db.SmallInteger, default=1) # 1-早餐 2-午餐 4-晚餐 8-下午茶 16-夜宵
    togo_status = db.Column(db.SmallInteger, default=0) # 1-客户外带打包 2-外带打包就绪 4-外带打包已被客户带走
    #is_togo = db.Column(db.Boolean, default=False) # 是否
    #togo_ready = db.Column(db.Boolean, default=False) # 外带打包是否准备就绪
    #togo_finish = db.Column(db.Boolean, default=False) # 外带打包是否准备就绪
    occur_time = db.Column(db.DateTime, default=datetime.now) # 理应打卡时间，理论上和update_time一致，补打卡两者时间不一致
    update_time = db.Column(db.DateTime, default=datetime.now)
    #note = db.Column(db.Text)

    staff = db.relationship('Staff',
                         backref=db.backref('checkins', lazy="dynamic"))

class StaffNote(db.Model):
    __tablename__ = 'staff_note'
    _include_column_ = ['id', 'staff', 'content', 'occur_time']

    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    content = db.Column(db.Text)
    occur_time = db.Column(db.DateTime, default=datetime.now)
    staff = db.relationship('Staff',
                            backref=db.backref('notes', lazy="dynamic"))

    def __repr__(self) -> str:
        return self.content

class Bulletin(db.Model):
    __tablename__ = 'bulletin'
    _include_column_ = ['id', 'mode', 'title', 'content', 'is_read', 'begin_date', 'end_date', 'update_time']

    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    mode = db.Column(db.SmallInteger, default=0) # TODO 暂定为bulletin的格式 - 尚未使用
    title = db.Column(db.String(64))
    content = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False) # 标记是否已读
    begin_date = db.Column(db.Date, default=date.today)
    end_date = db.Column(db.Date, default=None)
    update_time = db.Column(db.DateTime, default=datetime.now)

    staff = db.relationship('Staff',
                            backref=db.backref('bulletins', lazy="dynamic"))

    def __repr__(self) -> str:
        return self.content

class Dish(db.Model):
    __tablename__ = 'dish'
    _include_column_ = ['id', 'name', 'note']
    id = db.Column(db.Integer, primary_key=True)
    meal = db.Column(db.SmallInteger, default=1) # 1-早餐 2-午餐 4-晚餐 8-下午茶 16-夜宵
    name = db.Column(db.String(64))
    note = db.Column(db.Text)
    serve_time = db.Column(db.DateTime, default=datetime.now)

    recipes = db.relationship('RecipeDish', back_populates='dish')

    def __repr__(self) -> str:
        return self.name

class DishImage(db.Model):
    __tablename__ = 'dish_image'
    _include_column_ = ['id', 'name', 'path']
    id = db.Column(db.Integer, primary_key=True)
    dish_id = db.Column(db.Integer, db.ForeignKey('dish.id'), nullable=True)
    index = db.Column(db.Integer, default=1) # 做为封面的图片，index为0, 其余为1或者排序
    name = db.Column(db.String(128)) # 图片存储时的名字
    path = db.Column(db.String(1024))
    hash_value = db.Column(db.String(128), index=True) # MD5 value

    dish = db.relationship('Dish',
                         backref=db.backref('images', lazy="dynamic"))

    def __repr__(self) -> str:
        return self.path

# 食谱
class Recipe(db.Model):
    __tablename__ = 'recipe'
    _include_column_ = ['id', 'name', 'meal', 'begin_time', 'end_time']

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128)) # 食谱名称，比如全鱼宴/满汉全席
    meal = db.Column(db.SmallInteger, default=1) # 1-早餐 2-午餐 4-晚餐 8-下午茶 16-夜宵
    begin_time = db.Column(db.DateTime, default=datetime.now)
    end_time = db.Column(db.DateTime, default=None)

    dishes = db.relationship('RecipeDish', back_populates='recipe', order_by="asc(RecipeDish.index)")

class RecipeDish(db.Model):
    __tablename__ = 'recipe_dish'

    #id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), primary_key=True)
    dish_id = db.Column(db.Integer, db.ForeignKey('dish.id'), primary_key=True)
    index = db.Column(db.Integer, default=1) # 显示的顺序

    recipe = db.relationship('Recipe', back_populates='dishes')
    dish = db.relationship("Dish", back_populates="recipes")
