// 
// Метод выхода из аккаунта
// Является немного костылем, но что поделать, зато работает 😜
// 

import { useEffect } from 'react';

export const ExitButton = ({ navigation }) => {
    
    // сразу вызываем логику выхода из текущей сессии
    useEffect(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('expiresAt');
        navigation.navigate('AuthStack');
    },[]
    );

  return null;
}
