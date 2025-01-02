import sys
from PyQt5.QtWidgets import (
    QApplication,
    QMainWindow,
    QComboBox,
    QLabel,
    QVBoxLayout,
    QWidget,
)


class MyApp(QMainWindow):
    def __init__(self):
        super().__init__()

        # Установка заголовка окна
        self.setWindowTitle("Пример зависимого QLabel")

        # Создание центрального виджета
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)

        # Создание макета
        layout = QVBoxLayout(central_widget)

        # Создание QComboBox
        self.combo_box = QComboBox(self)
        self.combo_box.addItems(["Первый", "Второй", "Третий"])

        # Создание QLabel для отображения выбранного значения
        self.label = QLabel("Выберите элемент из списка", self)

        # Создание QLabel для отображения зависимого значения
        self.dependent_label = QLabel("Зависимое значение: ", self)

        # Подключение сигнала изменения текущего индекса к слоту
        self.combo_box.currentIndexChanged.connect(self.update_labels)

        # Добавление виджетов в макет
        layout.addWidget(self.combo_box)
        layout.addWidget(self.label)
        layout.addWidget(self.dependent_label)

    def update_labels(self):
        # Получение выбранного значения
        selected_text = self.combo_box.currentText()
        self.label.setText(f"Вы выбрали: {selected_text}")

        # Обновление зависимого значения в зависимости от выбора
        if selected_text == "Первый":
            self.dependent_label.setText("Зависимое значение: 100")
        elif selected_text == "Второй":
            self.dependent_label.setText("Зависимое значение: 200")
        elif selected_text == "Третий":
            self.dependent_label.setText("Зависимое значение: 300")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MyApp()
    window.resize(300, 200)
    window.show()
    sys.exit(app.exec_())
