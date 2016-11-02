module.exports = function() {
    
    var msgs = {};
    

    msgs.unauthorized_error = 'UnauthorizedError';
    msgs.jwt_expired_error = 'jwt expired';
    msgs.not_token_error = 'No authorization token was found';
    msgs.unexpected_error = 'Unexpected error';
    msgs.invalid_signature_error = 'Invalid signature';
    msgs.invalid_client_key = 'Invalid client key or incorrect appId';
     
    
    msgs.expired_token_msg = 'expired token...';
    msgs.token_not_found_msg = 'token not provided...';
    msgs.invialid_token_msg = 'invalid token...';
    msgs.refresh_expired_msg = 'Refresh token expired';
    
    //HTTP messages
    msgs.bad_request_msg = 'Bad request';
    msgs.internal_server_error = 'Internal Server Error';
    
    
    //API RESULT Messages
    msgs.user_not_found_msg = 'User not found';
    msgs.bad_pwd_msg = 'Bad password';
    
    return msgs;

}