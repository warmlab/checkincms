from typing import Tuple 
from functools import wraps

from flask import g, request, redirect, url_for, abort, make_response, jsonify

from ..models import Staff
from ..status import STATUS_NO_REQUIRED_HEADERS, STATUS_TOKEN_INVALID, STATUS_NO_ADMIN_PRIVILEGE, MESSAGES

def headers_required(request) -> Tuple[int, Staff]:
    if not request.headers.get('X-ACCESS-TOKEN') or\
        not request.headers.get('X-VERSION') or\
        request.headers.get('X-TERMINAL-TYPE') != '2':
        return -1, None

    staff = Staff.query.filter_by(access_token=request.headers.get('X-ACCESS-TOKEN')).first()
    #if staff: print(staff.verify_access_token())
    if not staff or staff.is_deleted or not staff.verify_access_token():
        return -2, None

    return 0, staff

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        #if not getattr(f, 'authenticated', True):
        #    return f(*args, **kwargs)

        rc, _ = headers_required(request)
        if rc == -1:
            abort(make_response(jsonify(errcode=STATUS_NO_REQUIRED_HEADERS, message=MESSAGES[STATUS_NO_REQUIRED_HEADERS]), 400))
        elif rc == -2:
            abort(make_response(jsonify(errcode=STATUS_TOKEN_INVALID, message=MESSAGES[STATUS_TOKEN_INVALID]), 406))

        return f(*args, **kwargs)

    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        rc, staff = headers_required(request)
        if rc == -1:
            abort(make_response(jsonify(errcode=STATUS_NO_REQUIRED_HEADERS, message=MESSAGES[STATUS_NO_REQUIRED_HEADERS]), 400))
        elif rc == -2:
            abort(make_response(jsonify(errcode=STATUS_TOKEN_INVALID, message=MESSAGES[STATUS_TOKEN_INVALID]), 406))

        #staff = Staff.query.filter_by(access_token=request.headers.get('X-ACCESS-TOKEN')).first()
        elif not staff or not staff.is_admin or staff.is_deleted:
            abort(make_response(jsonify(errcode=STATUS_NO_ADMIN_PRIVILEGE, message=MESSAGES[STATUS_NO_ADMIN_PRIVILEGE]), 403))

        return f(*args, **kwargs)

    return decorated_function
