STATUS_OK = 0
STATUS_NO_REQUIRED_HEADERS = 1000
STATUS_NO_REQUIRED_ARGS = 1001
STATUS_NO_RESOURCE = 1002
STATUS_REQUIRED_ARG_INVALID = 1003
STATUS_CANNOT_LOGIN = 3000
STATUS_NO_ADMIN_PRIVILEGE = 3001
STATUS_TOKEN_ABSENT = 3011
STATUS_TOKEN_INVALID = 3012
STATUS_TOKEN_EXPIRED = 3013
STATUS_EMAIL_NOT_FOUND = 3024
STATUS_NOT_RESERVED = 4000
STATUS_CHECKIN_TIME_INVALID = 4001
STATUS_COMPANY_ID_INVALID = 4002
STATUS_COMPANY_NAME_INVALID = 4003
STATUS_INGREDIENT_ID_INVALID = 4004
STATUS_INGREDIENT_NAME_INVALID = 4005
STATUS_BULLETIN_ID_INVALID = 4006
STATUS_BULLETIN_TITLE_INVALID = 4007
STATUS_BULLETIN_CONTENT_INVALID = 4008
STATUS_DISH_ID_INVALID = 4009
STATUS_DISH_NAME_INVALID = 4010
STATUS_RECIPE_ID_INVALID = 4009
STATUS_RECIPE_NAME_INVALID = 4010
STATUS_MEAL_OPTION_INVALID = 4011
STATUS_TOGO_ID_INVALID = 4012
STATUS_TOGO_STATUS_INVALID = 4013
STATUS_COMBO_ID_INVALID = 4014
STATUS_METHOD_NOT_ALLOWED = 5000
STATUS_CANNOT_DECRYPT = 5001

MESSAGES = {
    STATUS_NO_REQUIRED_HEADERS: 'access token or version was not existed in request header',
    STATUS_NO_REQUIRED_ARGS: "no %s argument(s) in request",
    STATUS_NO_RESOURCE: 'The resource you required was not existed in system',
    STATUS_REQUIRED_ARG_INVALID: "the required %s argument(s) in request was invalid",
    STATUS_CANNOT_LOGIN: 'You cannot login sytem using code: %s',
    STATUS_NO_ADMIN_PRIVILEGE: 'You cannot access, because you do not have admin privilege',
    STATUS_TOKEN_ABSENT: 'the access token in header was missing',
    STATUS_TOKEN_INVALID: 'the access token in header was invalid',
    STATUS_TOKEN_EXPIRED: 'the access token in header was expired',
    STATUS_EMAIL_NOT_FOUND: 'the email of the staff "{}" was not found',
    STATUS_NOT_RESERVED: 'sorry, you did not reserve anything last week',
    STATUS_CHECKIN_TIME_INVALID: 'the the time in request is not valid',
    STATUS_COMPANY_ID_INVALID: 'the company id in request is invalid',
    STATUS_COMPANY_NAME_INVALID:  'the company name in request is invalid',
    STATUS_INGREDIENT_ID_INVALID: 'the ingredient id in request is invalid',
    STATUS_INGREDIENT_NAME_INVALID:  'the ingredient name in request is invalid',
    STATUS_BULLETIN_ID_INVALID: 'the bulletin id in request is invalid',
    STATUS_BULLETIN_CONTENT_INVALID: 'the bulletin content in request is invalid',
    STATUS_DISH_ID_INVALID: 'the dish id in request is invalid',
    STATUS_DISH_NAME_INVALID:  'the dish name in request is invalid',
    STATUS_RECIPE_ID_INVALID: 'the recipe id in request is invalid',
    STATUS_RECIPE_NAME_INVALID:  'the recipe name in request is invalid',
    STATUS_MEAL_OPTION_INVALID: 'the meal option in request is invalid',
    STATUS_TOGO_ID_INVALID: 'the togo id in request is invalid',
    STATUS_TOGO_STATUS_INVALID: 'the togo status in request is invalid',
    STATUS_COMBO_ID_INVALID: 'the combo id in request is invalid',
    STATUS_METHOD_NOT_ALLOWED: 'the method not allowed in request',
    STATUS_CANNOT_DECRYPT: 'cannot decrypt the request things',
}
