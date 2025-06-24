from flask import abort, jsonify, make_response

from .models import Staff
from .status import STATUS_TOKEN_ABSENT, STATUS_TOKEN_INVALID, MESSAGES

def get_staff(access_token: str) -> Staff:
    #print(access_token)
    if not access_token:
        abort(make_response(jsonify(errcode=STATUS_TOKEN_ABSENT, message=MESSAGES[STATUS_TOKEN_ABSENT]), 406))

    staff = Staff.query.filter_by(access_token=access_token).first()
    #print(staff)
    if not staff:
        abort(make_response(jsonify(errcode=STATUS_TOKEN_INVALID, message=MESSAGES[STATUS_TOKEN_INVALID]), 406))

    return staff