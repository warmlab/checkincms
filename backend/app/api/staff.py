import os

from time import time
from datetime import datetime, timedelta

from flask import request, abort, make_response
from flask import current_app, json, jsonify
from flask.views import MethodView

from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from urllib.parse import urlencode
from urllib.request import urlopen
from urllib.request import Request as UrlRequest

from . import api
from .base import login_required, admin_required

from ..models import db, Staff, Company, Reservation
from ..myrequest import get_staff
from ..status import STATUS_CANNOT_LOGIN, STATUS_TOKEN_ABSENT, STATUS_TOKEN_INVALID, MESSAGES

app_id = 'wx74bc22dc8795d9fe'
app_secret_key = '9cc6f5821b45c81ce31e45cdc243bd69'
secret_key     = '69d7c1bbdd406dcd97b1464884ab1c41'

@api.route('/login', methods=['POST'])
def login():
    openid = request.json.get('openid')
    if openid:
        staff = Staff.query.filter_by(openid=openid).first()
        if staff and staff.verify_access_token():
            return jsonify(staff.to_json())

    data = (
        ('appid', app_id),
        ('secret', app_secret_key),
        ('js_code', request.json.get('code')),
        ('grant_type', 'authorization_code')
    )

    r = UrlRequest('https://api.weixin.qq.com/sns/jscode2session?'+urlencode(data), method='GET')
    with urlopen(r) as s:
        result = s.read().decode('utf-8')
        info = json.loads(result)
        #print('result from weixin jscode2session: ', info)
        if 'errcode' in info:
            #print('request weixin jscode2session failed: ', info)
            abort(make_response(jsonify(errcode=info['errcode'], message=info['errmsg']), 400))

        staff = Staff.query.filter_by(openid=info['openid']).first()
        if not staff:
            staff = Staff()
            staff.openid = info['openid']
            staff.avatar_url = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
            db.session.add(staff)

        staff.session_key = info['session_key']
        staff.expires_time = int(time()) + 86400
        #mo.shoppoint_id = shop.id

        staff.generate_access_token()

        #dic = staff.to_json()
        try:
            db.session.commit()
        except Exception: # sqlalchemy.exc.IntegrityError
            staff = Staff.query.filter_by(openid=info['openid']).first()

        return jsonify(staff.to_json())

    #abort(make_response(jsonify(errcode=STATUS_CANNOT_LOGIN, message=MESSAGES[STATUS_CANNOT_LOGIN] % args['code']), 405))

@api.route('/tokencheck', methods=['POST'])
def token_check():
    staff = get_staff(access_token=request.headers.get('X-ACCESS-TOKEN'))

    return jsonify(staff.to_json())

@api.route('/staff/info', methods=['GET'])
@login_required
def staff_info():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))
    companies = Company.query.filter(or_(Company.is_deleted==None, Company.is_deleted==False)).order_by(Company.id).all()

    return jsonify({'staff': staff.to_json(), 'companies': [c.to_json() for c in companies]}), 200

@api.route('/staff/signup', methods=['POST'])
@login_required
def sign_up():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))
    data = request.json
    company = Company.query.get_or_404(data.get('company_id'))
    staff.nickname = data.get('nickname')
    staff.last_name = data.get('last_name')
    staff.first_name = data.get('first_name')
    staff.full_name = staff.last_name + staff.first_name
    staff.company_id = company.id
    staff.email = data.get('email')
    staff.phone = data.get('phone')
    #staff.avatar_url = data.get('avatar_url') # TODO 头像是需要上传的，在这里暂时使用默认头像
    #staff.avatar_url = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    staff.is_active = True

    # get the avatar from client

    # 添加新纪录以便能够领取本周食材
    today = datetime.now()
    the_day = today + timedelta(days=-7) # 上周日期
    reservation = Reservation()
    reservation.staff_id = staff.id
    reservation.occur_time = the_day
    reservation.reservation = 1
    db.session.add(reservation)

    db.session.commit()

    return jsonify(staff.to_json()), 201

@api.route('/staff/avatar', methods=['POST'])
@login_required
def staff_avatar():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))
    upload_file = request.files.get('upload-image')

    # generate avatar filename
    filename = upload_file.filename
    if '/' in staff.openid:
        openid = staff.openid.replace('/', '.')
    else:
        openid = staff.openid
    pos = filename.rfind('.')
    if pos > 0:
        ext = filename[pos+1:]
        filename =  '.'.join([openid, ext])
    else:
        filename = ".".join([openid, 'jpg'])

    original_file = os.path.join(current_app.config['UPLOAD_FOLDER'], 'avatar', filename)

    upload_file.save(original_file)
    staff.avatar_url = os.path.join('avatar', filename)

    db.session.commit()
    return jsonify({'avatar_url': staff.avatar_url}), 201
