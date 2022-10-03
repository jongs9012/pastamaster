const express = require("express");
const res = require("express/lib/response");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

process.env.PWD = process.cwd()

const app = express();
app.use(express.urlencoded({extended: true})) 
app.use(express.static(process.env.PWD + '/public'));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

app.use("/public", express.static("public"));


const MongoClient = require("mongodb").MongoClient;
const CLIENTKEY = "mongodb+srv://whdtjtjwhd9012:whdtjtjwhd9012@cluster0.3pcskg4.mongodb.net/?retryWrites=true&w=majority"
const PORT = 80;
var db;

MongoClient.connect(CLIENTKEY, { useUnifiedTopology: true }, function (err, client) {
	if (err) return console.log(err);
	db = client.db('mingDB');
	app.listen(PORT, function () {
		console.log('listening on 8080')
	});
});



app.get("/", function(req, res){
    res.render("index.ejs");
}); 


app.get("/write", function(req, res){
    res.render("write.ejs");
});

app.get("/list", function(req, response){
    db.collection("posts").find().toArray(function(err, res){
        response.render('list.ejs', {posts : res});
    });
});

app.get("/detail/:id", function(req, res){
    db.collection("posts").findOne({_id : parseInt(req.params.id)}, function(err, result){
        res.render("detail.ejs", {data : result});
    });
})

app.get("/edit/:id", function(req, res){
    db.collection("posts").findOne({_id : parseInt(req.params.id)}, function(err, result){
        res.render("edit.ejs", { data : result});
    });
});

app.post("/add", function(req, res){
    db.collection("counter").findOne({name : 'Total Posts'}, function(err, res){
        var totalPosts = res.totalPosts;
        db.collection("posts").insertOne({ _id  : totalPosts + 1, title : req.body.title, text : req.body.text}, function(err, res){
            // $set : {totalPosts : totalPosts + 1} == $inc : {totalPosts : 1}
            db.collection('counter').updateOne({name : 'Total Posts'},{$set : {totalPosts : totalPosts + 1}} , function(err, res){
                if(err){return res.send(err)}
            });
        });
    });``
    res.redirect("/list");
});

app.delete("/delete", function(req, res){
    req.body._id = parseInt(req.body._id);
    db.collection("posts").deleteOne(req.body, function(err, result){
        if (err) console.log(err);
        res.status(200).send({ 
            message : "성공적으로 삭제 되었습니다!"
        });
    });
});

app.put("/edit/:id", function(req, res){
   db.collection("posts").updateOne({_id : parseInt(req.params.id)}, {$set : { title : req.body.title, text : req.body.text}, function(err, result){
    if (err){return res.send(err)}
   }}); 
   res.redirect("/list");
});