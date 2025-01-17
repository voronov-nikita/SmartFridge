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
        navigation.navigate('AuthStack');
    },[]
    );

  return null;
}
