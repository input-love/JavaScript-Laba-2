const express = require('express');
const bodyParser = require('body-parser');
const { Liquid } = require('liquidjs');
const fs = require('fs');

const engine = new Liquid();
const app = express();

app.use(express.static('public'));
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('liquid', engine.express());
app.set('views', './views');
app.set('view engine', 'liquid');

app.get('/', (req, res) => {
  res.render('form');
});

app.get('/history', (req, res) => {
  fs.readFile('output.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Ошибка чтения файла');
    }
    const arr = data.split('\r');
    const newArr = arr.map((item) => item + '<br/>');
    res.render('history', { arr: newArr });
  });
});

app.post('/', (req, res) => {
  const num1 = +req.body.num1;
  const num2 = +req.body.num2;
  const operators = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
  };

  const operator = req.body.operation;
  if (operators.hasOwnProperty(operator)) {
    const result = operators[operator](num1, num2);
    const exp = `${req.body.num1} ${operator} ${req.body.num2} = ${result}\r`;

    fs.appendFile("output.txt", exp, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Ошибка записи в файл');
      }
      res.render('form', { num1, num2, res: result });
    });
  } else {
    res.status(400).send('Неподдерживаемая операция');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});