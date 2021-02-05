const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const app = express();
const hbs = require('hbs');
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

const todoSchema = new Schema({
    title: String,
    date: String,
    done: Boolean
}, {versionKey: false});

const Todo = mongoose.model("Todo", todoSchema);

mongoose.connect("mongodb://127.0.0.1:27017/todosdb", {useUnifiedTopology: true, useNewUrlParser: true});

hbs.registerPartials(__dirname + "/views/partials");
hbs.registerHelper('ischecked', (value) => {
  return value == true;
});
hbs.registerHelper('isunchecked', (value) => {
  return value == false;
});

app.set('view engine', hbs);


app.get('/', (req, res) => {
    Todo.find({}, (err, todolist)=>{
    res.render('main.hbs', {title: 'Todos:', todos: todolist.sort((a, b) => (a.date > b.date) ? 1 : -1)});
  })
});

app.post('/', async (req, res) => {
	console.log(!!req.body.check);
	await Todo.updateOne({ _id: req.body.id }, {$set: {done: !!req.body.check}});
        res.redirect('/');
});

app.get('/addtodo', (req, res) => {
    res.render('addtodo.hbs', {title: 'Add new ToDo:'});
})

app.post('/addtodo', (req, res) => {
    if(!req.body) return res.sendStatus(400);
    const todo = new Todo({ title: req.body.title, date: req.body.date, done: false });
    todo.save((err) =>{
        if(err) return console.log(err);
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}...`)
})
