from datetime import datetime
from flask import request, jsonify, abort, make_response

from ..models import db, Bulletin
from ..status import STATUS_BULLETIN_ID_INVALID, STATUS_BULLETIN_TITLE_INVALID, STATUS_BULLETIN_CONTENT_INVALID, MESSAGES

from . import api
from .base import login_required, admin_required

@api.route('bulletins/info', methods=['GET'])
@login_required
def bulletin_list():
    bulletins = Bulletin.query.order_by(Bulletin.update_time.desc())
    r = [b.to_json() for b in bulletins]

    return jsonify(r), 200

@api.route('bulletin/info', methods=['GET'])
@login_required
def bulletin_info():
    bulletin_id = request.args.get('bulletin_id')
    bulletin = Bulletin.query.get_or_404(bulletin_id)

    return jsonify(bulletin.to_json()), 200

@api.route('bulletin/update', methods=['POST', 'DELETE'])
@admin_required
def bulletin_update():
    info = request.json
    bulletin_id = info.get('id')
    try:
        bulletin_id = int(bulletin_id)
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_BULLETIN_ID_INVALID, message=MESSAGES[STATUS_BULLETIN_ID_INVALID]), 400))

    if request.method == 'POST':
        if bulletin_id <= 0:
            bulletin = Bulletin()
            db.session.add(bulletin)
        else:
            bulletin = Bulletin.query.get_or_404(bulletin_id)
        title = info.get('title')
        content = info.get('content')
        if not title:
            abort(make_response(jsonify(errcode=STATUS_BULLETIN_TITLE_INVALID, message=MESSAGES[STATUS_BULLETIN_TITLE_INVALID]), 400))
        if not content:
            abort(make_response(jsonify(errcode=STATUS_BULLETIN_CONTENT_INVALID, message=MESSAGES[STATUS_BULLETIN_CONTENT_INVALID]), 400))
        bulletin.title = title
        bulletin.content = content
        bulletin.begin_date = datetime.strptime(info.get('begin_date'), '%Y-%m-%d').date()
        bulletin.end_date = datetime.strptime(info.get('end_date'), '%Y-%m-%d').date()
        bulletin.update_time = datetime.now()
    elif request.method == 'DELETE':
        bulletin = Bulletin.query.get_or_404(bulletin_id)
        # TODO bulletin.is_deleted = True

    db.session.commit()

    return jsonify(bulletin.to_json()), 200
