const menu = document.querySelector('.nav-menu');
const menuButton = document.querySelector('.menu-button');
const menuClose = document.querySelector('.menu-close');

menuButton.addEventListener('click', ()=>{
    menu.classList.add('is-active');
    menuClose.classList.add('is-active');
});

menuClose.addEventListener('click', ()=>{
    menuClose.classList.remove('is-active');
    menu.classList.remove('is-active');
});


// Всплывающая форма

const hideForm = document.querySelector(".hide-form");
const orderTicket = hideForm.querySelector(".order-ticket");
const orderTrigger = hideForm.querySelector(".order-trigger");
const orderTicketForm = hideForm.querySelector(".order-ticket__form");

const orderTicketFormWrapper = hideForm.querySelector(".order-ticket__form-wrapper");
const orderTicketPreloaderWrapper = hideForm.querySelector(".order-ticket__preloader-wrapper");
const orderTicketThanksWrapper = hideForm.querySelector(".order-ticket__thanks-wrapper");
const orderTicketThanksName = hideForm.querySelector(".order-ticket__thanks-name");

const heightForm = orderTicket.offsetHeight;

// Задержка для всплывания формы
setTimeout(() => {
    hideForm.style.bottom = -heightForm + "px";
}, 1000);

// Отправка данных
const sendData = (data, callback, callBefore) => {
    if (callBefore) callBefore();
    // fetch("https://jsonplaceholder.typicode.com/posts", { // Фейковый сервер
    fetch("http://localhost:3000/api", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(data),
    })
        .then(response =>  response.json())
        .then(callback);
};

const showPreloader = () => {
    orderTicketFormWrapper.style.display = "none";
    orderTicketPreloaderWrapper.style.display = "block";
};

// Скрывание формы
const hidePreloader = () => {
    orderTicketPreloaderWrapper.style.display = "none";
}

const showThankYou = (data) => {
    hidePreloader();
    orderTicketThanksName.textContent = data.name;
    orderTicketThanksWrapper.style.display = "block";
    orderTicketFormWrapper.style.display = "none";
};



// Открытие/Закрытие формы
orderTrigger.addEventListener("click", () => {
    hideForm.classList.toggle("hide-form-active");
});

// Слушатель формы для проверки изменения её
orderTicketForm.addEventListener("change", (event) => {
    const target = event.target;
    const label = target.labels[0];
    const enteredValue = target.value.trim();
    //проверка наличия label (чтобы label не спускался, когда есть данные)
    if (label) {
        if (enteredValue.length > 0) {
            label.classList.add("order-ticket__label-focus");
        } else {
            label.classList.remove("order-ticket__label-focus");
        }
    }
});

// Слушатель формы для отправки данных
orderTicketForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(orderTicketForm);
    const data = {};

    for (const element of formData) {
        const [name, value] = element;
        data[name] = value;
    }
    sendData(data, showThankYou, showPreloader);
});
