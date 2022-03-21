/* eslint-disable no-console */
// импорт стандартных библиотек Node.js
const {existsSync, readFileSync, writeFileSync} = require('fs');
const {createServer} = require('http');

// файл для базы данных
const DB_FILE = process.env.DB_FILE || './db.json';
// номер порта, на котором будет запущен сервер
const PORT = process.env.PORT || 3000;
// префикс URI для всех методов приложения
const URI_PREFIX = '/api';

/**
 * Класс ошибки, используется для отправки ответа с определённым кодом и описанием ошибки
 */
class ApiError extends Error {
  constructor(statusCode, data) {
    super();
    this.statusCode = statusCode;
    this.data = data;
  }
}


function drainJson(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(JSON.parse(data));
    });
  });
}


function makeRequestClient(data) {

  function asString(v) {
    return v && String(v).trim() || '';
  }

// составляем объект, где есть только необходимые поля

  return {
    name: asString(data.name),
    surname: asString(data.surname),
    city: asString(data.city),
    mail: asString(data.mail),
  };
}

function getRequestList() {
  return JSON.parse(readFileSync(DB_FILE) || '[]');
}

const getDateCorrectFormat = date => {
  const d = date ? new Date(date) : new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleString('ru-RU', options);
}

function writeTXT(newItem) {

 const string = getRequestList().reduce((acc, {name, surname, city, mail, createAt}) => acc + `
  ${getDateCorrectFormat(createAt)}
   Составлен запрос от пользовтеля: ${name} ${surname},
   Отправить список кинотеатров города ${city} на email: ${mail}
 `, '');
  writeFileSync('request.txt', string, {encoding: 'utf8'});
}

function createRequest(data) {
  const newItem = makeRequestClient(data);
  newItem.id = Date.now().toString();
  newItem.createdAt = new Date().toISOString();
  writeFileSync(DB_FILE, JSON.stringify([...getRequestList(), newItem]), {encoding: 'utf8'});
  writeTXT(newItem)
  return newItem;
}


// создаём новый файл с базой данных, если он не существует
if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, '[]', {encoding: 'utf8'});

// создаём HTTP сервер, переданная функция будет реагировать на все запросы к нему
module.exports = createServer(async (req, res) => {
// req - объект с информацией о запросе, res - объект для управления отправляемым ответом

// этот заголовок ответа указывает, что тело ответа будет в JSON формате
  res.setHeader('Content-Type', 'application/json');

// CORS заголовки ответа для поддержки кросс-доменных запросов из браузера
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

// запрос с методом OPTIONS может отправлять браузер автоматически для проверки CORS заголовков
// в этом случае достаточно ответить с пустым телом и этими заголовками
  if (req.method === 'OPTIONS') {
// end = закончить формировать ответ и отправить его клиенту
    res.end();
    return;
  }

// если URI не начинается с нужного префикса - можем сразу отдать 404
  if (!req.url || !req.url.startsWith(URI_PREFIX)) {
    res.statusCode = 404;
    res.end(JSON.stringify({message: 'Not Found'}));
    return;
  }

// убираем из запроса префикс URI, разбиваем его на путь и параметры
  const [uri] = req.url.substr(URI_PREFIX.length).split('?');


  try {
// обрабатываем запрос и формируем тело ответа
    const body = await (async () => {
      if (uri === '' || uri === '/') {
        if (req.method === 'POST') {
          const createdItem = createRequest(await drainJson(req));
          res.statusCode = 201;
          res.setHeader('Access-Control-Expose-Headers', 'Location');
          res.setHeader('Location', `${URI_PREFIX}/${createdItem.id}`);
          return createdItem;
        }
      }
      return null;
    })();
    res.end(JSON.stringify(body));
  } catch (err) {
// обрабатываем сгенерированную нами же ошибку
    if (err instanceof ApiError) {
      res.writeHead(err.statusCode);
      res.end(JSON.stringify(err.data));
    } else {
      // если что-то пошло не так - пишем об этом в консоль и возвращаем 500 ошибку сервера
      res.statusCode = 500;
      res.end(JSON.stringify({message: 'Server Error'}));
      console.error(err);
    }
  }
})
  // выводим инструкцию, как только сервер запустился...
  .on('listening', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Сервер CRM запущен. Вы можете использовать его по адресу http://localhost:${PORT}`);
      console.log('Нажмите CTRL+C, чтобы остановить сервер');
      console.log('Доступные методы:');
      console.log(`POST ${URI_PREFIX} - создать запрос, в теле запроса нужно передать объект { name: string, surname: string, city: string, email: string, }`);
    }
  })
  // ...и вызываем запуск сервера на указанном порту
  .listen(PORT);
