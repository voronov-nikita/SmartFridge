#
# Python приложение для автоматизации генерации QR кодов.
#
# Приложение использует библиотеку pyqrcode для генерации QR кодов,
# Работа с датами, полями и прочими UI элементами производиться из библиотеки PyQt5
# Для работы с форматами была использована библиотека black, но если вы используете PyCharm,
# то нет необходимости в ней
#


from PyQt5.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QFormLayout,
    QLineEdit,
    QComboBox,
    QSpinBox,
    QPushButton,
    QLabel,
    QFileDialog,
    QDateEdit,
    QDesktopWidget,
)
from PyQt5.QtGui import QPixmap
from PyQt5.QtCore import QDate
import sys

import qrcode
import json


class QRCodeGenerator(QWidget):
    def __init__(self):
        super().__init__()

        self.width_window = 400
        self.height_window = 450

        self.setWindowTitle("QR Code Generator")
        self.resize(self.width_window, self.height_window)
        self._center()

        self.initUI()

    def initUI(self):
        """
        Функция генерации UI элементов
        """

        layout = QVBoxLayout()

        form_layout = QFormLayout()

        # название и тип продукта
        self.name_field = QLineEdit()
        self.product_type_field = QLineEdit()

        # дата изготовления (будем изначально считать настоящий момент)
        self.manufacture_date_field = QDateEdit()
        self.manufacture_date_field.setCalendarPopup(True)
        self.manufacture_date_field.setDate(QDate.currentDate())

        # дата срока годности (будем изначально считать настоящий момент)
        self.expiry_date_field = QDateEdit()
        self.expiry_date_field.setCalendarPopup(True)
        self.expiry_date_field.setDate(QDate.currentDate())

        # система измерения (работает не корректно, но работает)
        self.unit_system_field = QComboBox()
        self.unit_system_field.addItems(["гр", "кг", "мл", "л"])
        self.unit_system_field.currentIndexChanged.connect(self.update_unit_system)

        # вес продукта
        self.mass_field = QSpinBox()
        # лучше задать максимальную размерность, чтобы потом не было вопросов невозможных цифр
        self.mass_field.setRange(1, 1000000000)
        self.mass_field.setSuffix(f" {self.unit_system_field.currentText()}")

        # строка пищевой ценности продукта
        # По-сути должна быть типа int, но допускается, что может вводиться с суффиксами Дж/кДж и т.д
        self.nutritional_value_field = QLineEdit()

        # Строки с вводом информации о генерируемом продукте
        form_layout.addRow("Название продукта:", self.name_field)
        form_layout.addRow("Тип класса продукта:", self.product_type_field)
        form_layout.addRow("Дата изготовления:", self.manufacture_date_field)
        form_layout.addRow("Дата окончания срока годности:", self.expiry_date_field)
        form_layout.addRow("Единица измерения в СИ:", self.unit_system_field)
        form_layout.addRow("Масса/Объем:", self.mass_field)
        form_layout.addRow("Пищевая ценность:", self.nutritional_value_field)

        layout.addLayout(form_layout)

        # кнопка генерации QR кода по заданным параметрам
        self.generate_button = QPushButton("Generate QR Code")
        self.generate_button.clicked.connect(self.generate_qr_code)

        # кнопка сохранения QR кода локально на компьютере
        self.save_button = QPushButton("Save QR Code")
        self.save_button.clicked.connect(self.save_qr_code)
        self.save_button.setEnabled(False)

        # кнопка печати QR кода на принтере
        self.print_button = QPushButton("Print QR Code")
        self.print_button.clicked.connect(self.print_qr_code)
        self.print_button.setEnabled(False)

        # добавляем элементы в основной слой приложения
        layout.addWidget(self.generate_button)
        layout.addWidget(self.save_button)
        layout.addWidget(self.print_button)

        # Отображаем полученный QR код на экране снизу (не работает для экранов с большим разрешением экрана)
        self.qr_label = QLabel()
        self.qr_label.setFixedSize(300, 300)
        layout.addWidget(self.qr_label)

        self.setLayout(layout)

    def _center(self):
        """
        Центрование окна по размеру экрана
        """
        # Получаем размеры экрана
        qr = self.frameGeometry()
        cp = QDesktopWidget().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())

    def update_unit_system(self):
        """
        Функция обновления единицы измерения в системе
        """

        self.mass_field.setSuffix(f" {self.unit_system_field.currentText()}")

    def generate_qr_code(self):
        """
        Функция генерации QR кода и формирование json
        """

        data = {
            "name": self.name_field.text(),
            "product_type": self.product_type_field.text(),
            "manufacture_date": self.manufacture_date_field.date().toString(
                "dd-MM-yyyy"
            ),
            "expiry_date": self.expiry_date_field.date().toString("dd-MM-yyyy"),
            "mass": self.mass_field.value(),
            "unit": self.unit_system_field.currentText(),
            "nutritional_value": self.nutritional_value_field.text(),
        }

        # формируем json
        json_data = json.dumps(data, indent=4)

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json_data)
        qr.make(fit=True)

        # автоматически будем сохранять qr код после генерации в папку imgs
        img = qr.make_image(fill_color="black", back_color="white")
        img.save("./imgs/current_qr.png")

        pixmap = QPixmap("current_qr.png")
        self.qr_label.setPixmap(pixmap)

        self.save_button.setEnabled(True)
        self.print_button.setEnabled(True)

    def save_qr_code(self):
        """
        Функция сохранения QR кода локально на диске
        """

        options = QFileDialog.Options()
        path, _ = QFileDialog.getSaveFileName(
            self,
            "Save QR Code",
            "",
            "PNG Files (*.png);;All Files (*)",
            options=options,
        )
        # если путь удалось получить
        if path:
            pixmap = self.qr_label.pixmap()
            pixmap.save(path)

    # Доработать!
    def print_qr_code(self):
        """
        Функция отправки задания печати QR кода сразу на принтер
        """
        pass


# запуск приложения
if __name__ == "__main__":
    app = QApplication(sys.argv)
    ex = QRCodeGenerator()
    ex.show()
    sys.exit(app.exec_())
