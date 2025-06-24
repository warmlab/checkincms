from flask import Blueprint

#from .user import user as user_blueprint
#from .herbal import herbal as herb_blueprint
#from .notification import notification as notification_blueprint

api = Blueprint('api', __name__)

from . import recipe, record, staff, company, checkin, ingredient, statistics, bulletin, note

#api.register_blueprint(user_blueprint, url_prefix='/user')
#api.register_blueprint(herb_blueprint, url_prefix='/herb')
#api.register_blueprint(notification_blueprint, url_prefix='/notification')
