//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://pranitpawar4876:Newuser123@cluster0.ecqhkga.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});
const item2 = new Item({
  name: "Hit the + to add a new item "
});
const item3 = new Item({
  name: "- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema ={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItems).then(function () {
      console.log("Successfully saved default items to DB");
      }).catch(function (err) {
        console.log(err);
        });
        res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
          }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {

    item.save()

    res.redirect("/")

} else {

    List.findOne({ name: listName }).exec().then(foundList => {

        if (foundList) {

            foundList.items.push(item)

            foundList.save()

            res.redirect("/" + listName)

        } else {

            const newList = new List({

                name: listName,

                items: [item],

            })

            newList.save()

            res.redirect("/" + listName)

        }

    }).catch(err => {

        console.log(err);

    });
  }



});



app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
  .then(foundList => {
    if(!foundList){

      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch((err) => {
    console.log(err);
  });


});


app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", function(req, res){
    const checkedListName = req.body.listName;
    const checkedItemId = req.body.checkbox;
 
    if(checkedListName==="Today"){
      //In the default list
      del().catch(err => console.log(err));
 
      async function del(){
        await Item.deleteOne({_id: checkedItemId});
        res.redirect("/");
      }
    } else{
      //In the custom list
 
      update().catch(err => console.log(err));
 
      async function update(){
        await List.findOneAndUpdate({name: checkedListName}, {$pull: {items: {_id: checkedItemId}}});
        res.redirect("/" + checkedListName);
      }
    }
 
  });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
