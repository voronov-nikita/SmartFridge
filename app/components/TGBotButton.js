//
// Метод перехода на другую страницу, а именно для телеграмм-бот уведомлений
// Является немного костылем, но зато работает 😜
//

import { useFocusEffect } from '@react-navigation/native';
import { Linking } from 'react-native';

import { TGURL } from '../config';

export const TGBotButton = ({ navigation }) => {
	// сразу вызываем логику выхода из текущей сессии
	useFocusEffect(() => {
        navigation.navigate("Home");
		Linking.openURL(TGURL).catch((err) => console.error('Failed to open URL:', err));
	}, []);

	return null;
};
