// 
// Метод выхода из аккаунта
// Является немного костылем, но что поделать, зато работает 😜
// 

import { useFocusEffect } from '@react-navigation/native';

export const ExitButton = ({ navigation }) => {
    
    // сразу вызываем логику выхода из текущей сессии
    useFocusEffect(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('UserId');
        navigation.navigate('AuthStack');
    },[]
    );

  return null;
}
