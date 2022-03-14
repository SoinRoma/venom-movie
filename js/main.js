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
