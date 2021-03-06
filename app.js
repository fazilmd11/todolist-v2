//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect('mongodb+srv://admin-Fazil:Jilani123*@cluster0.bqg9r.mongodb.net/todolistDB');

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({name:'Welcome to your todolist!'});
const item2 = new Item({name:'Hit the + button to add a new item.'});
const item3 = new Item({name:'<-- Hit this to delete an item.'});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);
// Item.insertMany(defaultItems, (error, docs)=>{})

// await MyModel.find({},(err, results){});

app.get("/", function(req, res) {

  Item.find({},(err, foundItems)=>{

if (foundItems.length === 0) {
  Item.insertMany(defaultItems, (error, docs)=>{
    if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
  });
  res.redirect("/");
} else {
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

const item = new Item({name:itemName});

if (listName === "Today") {
  item.save();
  res.redirect("/");
} else{
  List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
});
}

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get('/:customListName', function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

Item.findOne({name: customListName}, function(err, foundList){
if (!err) {
  if (!foundList) {
    console.log("Doesnt exist");
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    list.save();
setTimeout(() => { res.redirect('/' + customListName);}, 2000);
  } else {
    console.log("Exists!");
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
  }
}
});


});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
