const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash');
app.set('view engine','ejs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ChaviKothari:Chavikot2711@cluster0.v4uc0xb.mongodb.net/ToDoListDB?retryWrites=true&w=majority";
// mongoose
try {
  mongoose.connect(uri);
} catch (error) {
  console.log(error);
}
const ItemSchema = mongoose.Schema({
  name: String
})
const Item = mongoose.model("item",ItemSchema);
const item1 = new Item ({
  name:"Welcome to your to do list"
});
const item2 = new Item ({
  name:"Hit the + button to add more item"
});
const item3 = new Item ({
  name:"<--Hit this to delete item"
});
const listSchema = mongoose.Schema({
  name: String,
  items: [ItemSchema]
})
const List  =mongoose.model("list",listSchema);
const defaultitem = [item1,item2,item3];

app.get("/",function(req,res){
  Item.find().then(function(data){
    if(data.length === 0){
      Item.insertMany(defaultitem).then(
      res.redirect("/")
    )}
    else{
      res.render("list",{ListTitle: "Today",newListItem: data});
     }
   });
});

app.get("/:customListName" , function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then(function(data){
    if(!data){
      const list = new List({
        name: customListName,
        items: defaultitem
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      res.render("list",{ListTitle: data.name,newListItem: data.items});
    }
  })
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName === "Today"){
    item.save()
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then(function(data){
      data.items.push(item);
      data.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.delete;
  const listName = req.body.listTitle;
  if(listName === "Today"){
    Item.deleteOne({_id:checkedItemId}).then(res.redirect("/"))
  }else{
    List.findOneAndUpdate(
      {name:listName},
      {$pull:{items:{_id:checkedItemId}}})
      .then(res.redirect("/"+listName))
  }
});

app.get("/about",function(req,res){
  res.render("about");
});

app.listen(process.env.PORT || 3000,function(){
  console.log("Server started on port 3000");
});
// mongodb+srv://<username>:<password>@cluster0.v4uc0xb.mongodb.net/?retryWrites=true&w=majority
