  
import React from 'react';

export default React.createContext({
    token: null, //null by default
    userId: null,
    login: (token, userId, tokenExpiration) => {},
    logout: () => {}
});