// 
// Квадратная кнопка для добавления нового холодильника
// 


import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

// экспортируемый модуль кнопки
export const SquareButton = ({ navigation }) => {
    const [pressed, setPressed] = useState(false);

    const handlePress = () => {
        navigation.navigate("NewFridge");
    };

    return (
        <TouchableOpacity
            style={[styles.button, pressed ? styles.pressed : null]}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={handlePress}
        >
            <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>+</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 5,
        backgroundColor: "#1976d2",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    pressed: {
        backgroundColor: "#ccc",
    },
    buttonInner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 30,
        color: "#fff",
    },
});