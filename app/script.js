// Инициализация локальной базы данных
localforage.config({
  name: "db",
  driver: localforage.INDEXEDDB,
});

let date = new Date();
let d = `${date.getMonth() + 1}.${date.getFullYear()}`;

window.__export = {};

window.monthStat = {
  debet: 0,
  spents: [],
};

localforage.getItem("settings").then((data) => {
  if (data === null) {
    window.settings = {
      currency: "₽",
      enablePriorities: true,
      categories: [
        "Услуги",
        "Техника",
        "Семья",
        "Подарки",
        "Питание",
        "Одежда",
        "Личное",
        "Здоровье",
        "Дом",
        "Автомобиль",
        "Транспорт",
      ],
    };

    syncSettings();
  } else {
    window.settings = data;
  }
});

localforage.getItem(d).then((data) => {
  if (data === null) {
    enterDebet();
  } else {
    monthStat = data;
    initMainMenu();
  }
});

// Синхронизация текущего объекта с базой данных
function sync() {
  localforage.setItem(d, monthStat);
}

// Синхронизация настроен с базой данных
function syncSettings() {
  localforage.setItem("settings", settings);
}

// Функция для быстрого выделения элементов в DOM
function Rachel(selector, multiply = false) {
  if (multiply) return document.querySelectorAll(selector);
  else return document.querySelector(selector);
}

// Валидация дополнительного дохода
function validateReceive(sum, alert) {
  if (sum === 0) {
    alert.style.display = "block";
    alert.textContent = "Доход не может быть равен 0";
    return false;
  } else if (sum < 0) {
    alert.style.display = "block";
    alert.textContent = "Доход не может быть отрицательным";
    return false;
  }
  alert.style.display = "none";
  return true;
}

// Ввод первоначального месячного дохода
function confirm() {
  let debet = Number(
    Rachel("body > div.modalRec > div > input[type=number]").value
  );

  if (
    validateReceive(debet, Rachel("body > div.modalRec > div > span.alert"))
  ) {
    Rachel(".modalRec").style.display = "none";
    monthStat.debet = debet;
    initMainMenu();
    sync();
  }
}

// Ввод зарплаты (раз в месяц)
function enterDebet() {
  Rachel(".modalRec").style.display = "flex";
  Rachel(".mainMenu").style.display = "none";
  Rachel(".modalRec > .debetModal > .alert").style.display = "none";
  Rachel(".debetModal > input").focus();
  Rachel("body > div.modalRec > div > button").onclick = () => confirm();
  Rachel("body > div.modalRec > div > input[type=number]").onkeyup = (e) => {
    if (e.key === "Enter") confirm();
  };
}

// Удаление расхода
function delElement(id) {
  monthStat.spents = monthStat.spents.filter((spent) => spent.id !== id);
  renderDiagram();
  renderSpents();
  Rachel(
    "body > div.mainMenu > div.menu > div.receiveBlock > div.sum > span.sum"
  ).textContent = `${calculateDebet()} ${settings.currency}`;
  sync();
}

// Валидация при изменении расхода в таблице
function saveValidate(sum, prevSum) {
  // Сумма должна переводиться из строки в число
  let s = Number(sum.trim());

  // Находим сумму всех элементов + сумма текущего ряда
  let total = 0;
  monthStat.spents.forEach((row) => (total += row.sum));
  total -= prevSum

  // Сумма не должна быть числом
  if (isNaN(s)) {
    alert("Сумма должна быть числом");
    return false;
  }
  // Сумма не должна быть больше оставшейся суммы
  else if (total > calculateDebet()) {
    alert("Общая сумма расходов не может быть больше оставшейся суммы.");
    return false;
  }
  // Если сумма равна нулю
  else if (s === 0) {
    alert("Сумма не может быть равна нулю.");
    return false;
  }
  return true;
}

// Перерисовка таблицы
function renderTable() {
  let tbody = Rachel("tbody");
  tbody.innerHTML = "";
  let prevSum;

  let priorityCol = Rachel("th.priority");
  if (!settings.enablePriorities) priorityCol.style.display = "none";
  else priorityCol.style.display = "table-cell";

  monthStat.spents.forEach((spent) => {
    let row = document.createElement("tr");

    let tdDate = document.createElement("td");
    tdDate.textContent = spent.date;
    tdDate.colSpan = "5";

    let tdPriority = document.createElement("td");
    tdPriority.textContent = spent.priority;
    tdPriority.colSpan = "2";
    tdPriority.classList = "tdPriority";

    if (spent.priority === "Высокий") tdPriority.classList.add("high");
    else if (spent.priority === "Средний") tdPriority.classList.add("middle");
    else if (spent.priority === "Низкий") tdPriority.classList.add("low");

    let tdCategory = document.createElement("td");
    tdCategory.textContent = spent.category;
    tdCategory.colSpan = "2";

    let tdSum = document.createElement("td");
    tdSum.textContent = spent.sum;
    tdSum.colSpan = "2";

    let tdDesc = document.createElement("td");
    tdDesc.textContent = spent.description;
    tdDesc.colSpan = "5";

    let tdBtn = document.createElement("td");
    tdBtn.textContent = "Del";
    tdBtn.classList = "button";

    let tdEditBtn = document.createElement("td");
    tdEditBtn.classList = "button editButton";
    tdEditBtn.textContent = "Edit";

    let saveBtn = document.createElement("td");
    saveBtn.classList = "button saveButton";
    saveBtn.textContent = "Save";
    saveBtn.style.display = "none";

    // Редактирование
    tdEditBtn.onclick = () => {
      tdEditBtn.style.display = "none";
      tdCategory.textContent = "";
      tdPriority.textContent = "";

      prevSum = Number(tdSum.textContent.trim())

      // Редактирование приоритета
      let editPriority = document.createElement("select");
      editPriority.classList = "priority";
      let arr = ["Не выбрано", "Высокий", "Средний", "Низкий"];
      arr.map((item) => {
        editPriority.options.add(new Option(item, item));
      });
      editPriority.value = spent.priority;

      function stylingSelect() {
        if (editPriority.value === "Не выбрано") {
          editPriority.classList = "priority";
          tdPriority.classList = "priority";
        } else if (editPriority.value === "Высокий") {
          editPriority.classList = "priority high";
          tdPriority.classList = "priority high";
        } else if (editPriority.value === "Средний") {
          editPriority.classList = "priority middle";
          tdPriority.classList = "priority middle";
        } else if (editPriority.value === "Низкий") {
          editPriority.classList = "priority low";
          tdPriority.classList = "priority low";
        }
      }

      stylingSelect();

      editPriority.onchange = () => stylingSelect();

      tdPriority.appendChild(editPriority);

      // Редактирование категории
      let editCategory = document.createElement("select");
      editCategory.classList = "editCategory";
      settings.categories.map((cat) => {
        editCategory.options.add(new Option(cat, cat));
      });
      editCategory.value = spent.category;

      tdCategory.appendChild(editCategory);
      tdSum.contentEditable = true;
      tdDesc.contentEditable = true;
      saveBtn.style.display = "table-cell";
    };
    // Сохранение
    saveBtn.onclick = () => {
      // Провести валидацию редактирования суммы
      if (saveValidate(tdSum.textContent, prevSum)) {
        tdSum.contentEditable = false;
        tdDesc.contentEditable = false;

        let finderElement = monthStat.spents.find((s) => s.id === spent.id);
        let indexElement = monthStat.spents.indexOf(finderElement);
        monthStat.spents[indexElement] = {
          id: finderElement.id,
          date: finderElement.date,
          priority: tdPriority.querySelector("select.priority").value,
          category: tdCategory.querySelector("select.editCategory").value,
          sum: Number(tdSum.innerText.trim()),
          description: tdDesc.innerText,
        };

        // Удаление выпадающего списка с категориями
        tdCategory.removeChild(tdCategory.querySelector("select.editCategory"));

        renderSpents();
        renderDiagram();
        sync();
        Rachel("div.sum > span.sum").textContent = `${calculateDebet()} ${
          settings.currency
        }`;
        tdEditBtn.style.display = "table-cell";
        saveBtn.style.display = "none";
      }
    };

    // Удаление
    tdBtn.onclick = () => delElement(spent.id);
    row.appendChild(tdDate);

    if (settings.enablePriorities) row.appendChild(tdPriority);

    row.appendChild(tdCategory);
    row.appendChild(tdSum);
    row.appendChild(tdDesc);
    row.appendChild(tdEditBtn);
    row.appendChild(saveBtn);
    row.appendChild(tdBtn);
    tbody.appendChild(row);
  });
}

// Подсчет оставшейся суммы
function calculateDebet() {
  let s = 0;
  if (monthStat.spents.length !== 0) {
    monthStat.spents.forEach((spent) => {
      s += spent.sum;
    });
  }
  return monthStat.debet - s;
}

// Рендеринг расходов
function renderSpents() {
  if (monthStat.spents.length === 0) {
    Rachel(".spentsBlock > span.littleText").style.display = "block";
    Rachel("table").style.display = "none";
  } else {
    Rachel(".spentsBlock > span.littleText").style.display = "none";
    Rachel("table").style.display = "block";
    renderTable();
    calculateDebet();
  }
}

// Управление с клавиатуры
document.onkeyup = (e) => {
  e.preventDefault();
  if (e.key === "i" && e.ctrlKey) {
    if (Rachel(".mainMenu").style.display === "flex") {
      initSpent();
    }
  } else if (e.key === "Escape") {
    if (Rachel(".modalSpent").style.display === "flex") {
      Rachel(".modalSpent").style.display = "none";
      Rachel(".mainMenu").style.display = "flex";
    }
  } else if (e.key === "a" && e.ctrlKey) {
    e.preventDefault();
    if (Rachel(".mainMenu").style.display === "flex") {
      toggleDiagram();
    }
  }
};

// Удаление категории
function delCat(title) {
  settings.categories = settings.categories.filter((cat) => cat !== title);
  categoriesRender();
}

// Добавление новой категории
function addCat() {
  let newCatInput = Rachel(
    "body > div.settingsModal > div > div.categoriesMenu > div.newCategory > input[type=text]"
  );
  settings.categories = [...settings.categories, newCatInput.value.trim()];
  syncSettings();
  categoriesRender();
  newCatInput.value = "";
}

// Генерация списка категорий
function categoriesRender() {
  let catCont = Rachel(".categoriesList");
  // Очищаем контейнер перед генерацией
  catCont.innerHTML = "";

  settings.categories.map((cat) => {
    let category = document.createElement("div");
    category.classList = "category";

    let label = document.createElement("span");
    label.textContent = cat;
    let delButton = document.createElement("button");
    delButton.textContent = "Del";
    delButton.onclick = () => {
      delCat(cat);
      categoriesRender();
      syncSettings();
    };

    category.appendChild(label);
    category.appendChild(delButton);
    catCont.appendChild(category);
  });
}

// Инициализация модального окна создания расхода
function initSpent() {
  let categoriesCont = Rachel("select.category");
  categoriesCont.innerHTML = ""
  settings.categories.map((cat) => {
    let op = new Option(cat, cat);
    categoriesCont.options.add(op);
  });

  // Если отображение приоритетов включено, то есть выборка
  if (settings.enablePriorities)
    Rachel(".priorityContainer").style.display = "flex";
  else Rachel(".priorityContainer").style.display = "none";

  Rachel(".mainMenu").style.display = "none";
  Rachel(".modalSpent").style.display = "flex";
  Rachel(
    "body > div.modalSpent > div > div > div:nth-child(1) > input[type=number]"
  ).focus();
}

// Инициализация главного меню
function initMainMenu() {
  Rachel(
    "body > div.mainMenu > div > div.receiveBlock > div.receive > div > span"
  ).textContent = `${monthStat.debet} ${settings.currency}`;
  Rachel(".mainMenu").style.display = "flex";
  if (monthStat.spents.length === 0) {
    Rachel("table").style.display = "none";
    Rachel(".spentsBlock > span.littleText").style.display = "block";
  } else {
    Rachel(".spentsBlock > span.littleText").style.display = "none";
    Rachel("table").style.display = "block";
  }
  renderSpents();

  // Нажатие кнопки "Добавить" в главном меню
  Rachel("button.addSpent").onclick = () => initSpent();
  Rachel(
    "body > div.mainMenu > div.menu > div.receiveBlock > div.sum > span.sum"
  ).textContent = `${calculateDebet()} ${settings.currency}`;

  renderDiagram();
}

// Инициализация настроек
function initSettings() {
  Rachel(".settingsModal").style.display = "flex";

  // Нажатие кнопки назад для возврата в главное меню
  Rachel(".settings > button.backToMainMenu").onclick = () => {
    Rachel(".settingsModal").style.display = "none";
    initMainMenu();
  };


  // Смена текущей валюты
  let changerCurrency = Rachel("select.currencyChanger");
  changerCurrency.onchange = (e) => {
    let v = e.target.value;
    window.settings.currency = v;
    syncSettings();
  };

  // Переключатель приоритетов в расходах
  let togglerPriorities = Rachel(
    "body > div.settingsModal > div > div.priorityTogglerContainer > input[type=checkbox]"
  );
  togglerPriorities.checked = settings.enablePriorities;
  togglerPriorities.onchange = (e) => {
    settings.enablePriorities = e.target.checked;
    syncSettings();
  };

  // Рендер списка категорий
  categoriesRender();

  // Добавление новой категории
  Rachel(
    "body > div.settingsModal > div > div.categoriesMenu > div.newCategory > button"
  ).onclick = () => {
    addCat();
  };

  // Добавление при нажатии на клавишу Enter
  Rachel(
    "body > div.settingsModal > div > div.categoriesMenu > div.newCategory > input[type=text]"
  ).onkeyup = (e) => {
    if (e.key === "Enter") {
      addCat();
    }
  };
}

// Валидация расходов
function validate(sum, description) {
  let alert = Rachel("div.modalSpent > div > span.alert");
  alert.style.display = "block";
  let money = calculateDebet();
  if (sum <= 0) {
    alert.textContent = "Сумма не может быть больше либо равной 0.";
    return false;
  }
  if (sum > money) {
    alert.textContent = "Сумма не может быть больше остатка на счете";
    return false;
  }
  if (description.trim() === "") {
    alert.textContent = "Поле с описанием не должно быть пустым";
    return false;
  }
  return true;
}

// Добавление нового расхода
function addNewSpent() {
  let sum = Number(
    Rachel(
      "body > div.modalSpent > div > div > div:nth-child(1) > input[type=number]"
    ).value
  );
  let description = Rachel(
    "textarea.description"
  ).value;
  let priority = Rachel("select.priority").value;
  let category = Rachel("select.category").value;

  if (validate(sum, description)) {
    let t = `${date.getDate()}.${
      date.getMonth() + 1
    } ${date.getHours()}:${date.getMinutes()}`;
    monthStat.spents.push({
      id: Date.now(),
      date: t,
      priority,
      category,
      sum,
      description,
    });
    Rachel(".modalSpent").style.display = "none";
    Rachel(
      "body > div.modalSpent > div > div > div:nth-child(1) > input[type=number]"
    ).value = "";
    Rachel(
      "textarea.description"
    ).value = "";
    Rachel("div.modalSpent > div > span.alert").style.display = "none";
    initMainMenu();
    renderDiagram();
    sync();
  }
}

// Добавление нового дохода
function addNewRec() {
  let sum = Number(
    Rachel("body > div.modalNewReceive > div > input[type=number]").value
  );
  if (validateReceive(sum, Rachel("div.modalNewReceive > div > span.alert"))) {
    Rachel(".modalNewReceive").style.display = "none";
    monthStat.debet = monthStat.debet + sum;
    Rachel("body > div.modalNewReceive > div > input[type=number]").value = "";
    initMainMenu();
    renderDiagram();
    sync();
  }
}

// Рендеринг диаграммы
function renderDiagram() {
  let cont = Rachel(".diagram > .chartBlock");
  let littleText = Rachel(".diagram > span.littleText");

  // При наличии canvas провести удаление лишнего холста
  if (Rachel(".diagram > .chartBlock > canvas")) {
    cont.removeChild(Rachel(".diagram > .chartBlock > canvas"));
  }

  // Если расходов нет, вывести только надпись о том, что нет расходов.
  if (monthStat.spents.length === 0) {
    littleText.style.display = "block";

    cont.style.display = "none";
  } else {
    littleText.style.display = "none";

    cont.style.display = "block";

    let c = document.createElement("canvas");
    c.id = "cchart";
    cont.appendChild(c);

    let titles;
    let values;
    let typeChart = document.querySelector("select.changeChart").value;

    if (typeChart === "По описаниям") {
      titles = monthStat.spents.map((spent) => spent.description);
      titles = [...titles, "Оставшаяся сумма"];
      values = monthStat.spents.map((spent) => spent.sum);
      values = [...values, calculateDebet()];
    } else if (typeChart === "По приоритетности") {
      let data = {};

      monthStat.spents.map((spent) => {
        if (data[spent.priority] === undefined) {
          data[spent.priority] = 0;
        }
        data[spent.priority] += spent.sum;
      });
      titles = [...Object.keys(data), "Оставшаяся сумма"];
      values = [...Object.values(data), calculateDebet()];
    } else if (typeChart === "По категориям") {
      let data = {};

      monthStat.spents.map((spent) => {
        if (data[spent.category] === undefined) {
          data[spent.category] = 0;
        }
        data[spent.category] += spent.sum;
      });
      titles = [...Object.keys(data), "Оставшаяся сумма"];
      values = [...Object.values(data), calculateDebet()];
    }

    new Chart(c, {
      type: "pie",
      data: {
        labels: titles,
        datasets: [
          {
            data: values,
          },
        ],
      },
    });
  }
}

// Показ/скрытие диаграммы
function toggleDiagram() {
  let diagram = Rachel(".diagram");

  if (diagram.style.display === "block") {
    diagram.style.display = "none";
  } else {
    diagram.style.display = "block";
    renderDiagram();
  }
}

// Работа после первичной инициализации DOM-дерева
// Инициализация меню добавления расходов
document.addEventListener("DOMContentLoaded", function () {
  // По умолчанию все .alert должны быть скрыты
  Rachel("span.alert", (multiply = true)).forEach(
    (el) => (el.style.display = "none")
  );

  // Выставление текущей даты и месяца
  Rachel("body > div.mainMenu > div.menu > header > span").textContent = d;

  // Переход в окно настроек
  Rachel("button.toSettings").onclick = () => {
    Rachel(".mainMenu").style.display = "none";
    initSettings();
  };

  // Перейти в окно помощи
  Rachel("button.toHelp").onclick = () => {
    alert("Функция на данный момент находится в разработке");
  };

  // Перейти в окно экспорта
  Rachel("button.toExport").onclick = () => {
    var data = {};

    Rachel(".modalExport").style.display = "flex";
    Rachel(".mainMenu").style.display = "none";

    localforage.keys().then((keysList) => {
      keysList.forEach((key) =>
        localforage
          .getItem(key)
          .then((val) => (data[key] = val))
          .then(
            () =>
              (Rachel(".modalExport > .export > textarea").value =
                JSON.stringify(data))
          )
      );
    });
  };

  // Копирование текста при клике по textarea в буфер обмена
  Rachel("button.exportButton").onclick = () => {
    navigator.clipboard.writeText(
      Rachel(".modalExport > .export > textarea").value
    );
    alert("Информация успешно скопирована.");
  };

  Rachel('.export > button.backToMainMenu').onclick = () => {
    Rachel('.modalExport').style.display = "none"
    initMainMenu()
  }

  // Перейти в окно импорта
  Rachel("button.toImport").onclick = () => {
    Rachel(".modalImport").style.display = "flex"
    Rachel(".mainMenu").style.display = "none"
  };

  // Выход из меню импорта
  Rachel('.import > button.backToMainMenu').onclick = () => {
    Rachel(".modalImport").style.display = "none"
    initMainMenu()
  }

  // Импорт данных
  Rachel("button.importButton").onclick = () => {
    let i = document.querySelector(".import > textarea").value
    try {
      // Очищаем indexedDB
      localforage.clear()
      // Заполняем indexedDB
      let info = JSON.parse(i)
      
      Object.keys(info).map(key => {
        localforage.setItem(key, info[key])
      })

      window.monthStat = info[d]
      window.settings = info.settings
      Rachel(".modalImport").style.display = "none"
      initMainMenu()
    } catch (error) {
      alert("Данные должны быть в формате JSON.")
    }
  }

  // Кнопка добавления нового расхода
  Rachel("button.newSpent").onclick = () => {
    addNewSpent();
  };

  // Кнопка отмены (модальное окно добавления нового расхода)
  Rachel(".cancelSpent").onclick = () => {
    Rachel(".modalSpent").style.display = "none";
    Rachel(".mainMenu").style.display = "flex";
  };

  // Добавление нового расхода при нажатии клавиши Enter в его модальном окне
  Rachel(
    "textarea.description"
  ).onkeyup = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      addNewSpent();
    }
  };

  // Изменение приоритета в окне расходов
  Rachel("select.priority").onchange = (e) => {
    let select = Rachel("select.priority");
    let val = e.target.value;
    if (val === "Высокий") {
      select.style.background = "#DB1B1B";
      select.style.color = "snow";
    } else if (val === "Средний") {
      select.style.background = "#F0A500";
      select.style.color = "#1B1A17";
    } else if (val === "Низкий") {
      select.style.background = "forestgreen";
      select.style.color = "snow";
    } else if (val === "Не выбрано") {
      select.style.background = "#1B1A17";
      select.style.color = "#E6D5B8";
    }
  };

  // Добавление нового дохода
  Rachel("button.addNewReceive").onclick = () => {
    Rachel(".modalNewReceive").style.display = "flex";
    Rachel(".mainMenu").style.display = "none";
    Rachel("body > div.modalNewReceive > div > input[type=number]").focus();
  };

  // Кнопка для добавления нового дохода в модальном окне
  Rachel("button.addReceive").onclick = () => {
    addNewRec();
  };

  Rachel("body > div.modalNewReceive > div > input[type=number]").onkeyup = (
    e
  ) => {
    if (e.key === "Enter") {
      addNewRec();
    }
  };

  // Отмена добавления нового расхода
  Rachel("button.cancelReceive").onclick = () => {
    Rachel(".mainMenu").style.display = "flex";
    Rachel(".modalNewReceive").style.display = "none";
    Rachel("body > div.modalNewReceive > div > input[type=number]").value = "";
  };

  // Смена диаграммы
  Rachel("select.changeChart").onchange = () => {
    renderDiagram();
  };

  Rachel("button.showDiagram").onclick = () => toggleDiagram();
});
