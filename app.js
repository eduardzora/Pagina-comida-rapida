var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var cloudinary = require("cloudinary");
var app_password = "123456789";

cloudinary.config({
 cloud_name: "df01eyg6w",
 api_key: "224491969184661",
 api_secret: "TFlifaj8q4CUTi-uvfmwEkjQhS0"
});

var app = express();

mongoose.connect("mongodb://localhost/food_rapid"); //Conectar a la base de datos

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var uploader = multer({dest: "./uploads"});
var middleware_upload = uploader.single('image_avatar');
//Definir el schema de nuestros productos
var productSchema = {
	title:String,
	description:String,
	imageUrl:String,
	pricing:Number
};

var Product = mongoose.model("Product", productSchema);


app.set("view engine","jade");

app.use(express.static("public"));

app.get("/",function(req,res){
	res.render("index");
});

//Nueva ruta(Pasar de index a menu y traer los productos)
app.get("/menu",function(req,res){
	Product.find(function(error,documento){
		if(error){
			console.log(error);
		}
		res.render("menu/index",{ products: documento })
	});
});

//Post de admin
app.post("/admin",function(req,res){
	if (req.body.password == app_password){
		Product.find(function(error,documento){
		if(error){
			console.log(error);
		}
		res.render("admin/index",{ products: documento })
	});
	}
	else{
		res.redirect("/");
	} 
});
//Ruta de ver el formulario de de admin
app.get("/admin",function(req,res){
		res.render("admin/form")
});

app.post("/menu",middleware_upload,function(req,res){
	if (req.body.password == app_password) {
		var data = {
		title: req.body.title,
		description: req.body.description,
		imageUrl: "data.png",
		pricing: req.body.pricing
	}

	 var product = new Product(data);
	 if(req.file){
	 	cloudinary.uploader.upload(req.file.path,
	 		function(result){
	 			product.imageUrl = result.url;
	 			product.save(function(err){
	 			console.log(product);
                res.render("index");
            });
	 	});
	 }

	}else{
		res.render("menu/new");
	} 
});

app.get("/menu/new",function(req,res){
	res.render("menu/new")
})

app.listen(8000);
//req: solicitud res: respuesta

//HTTP
	//Metodos
	//post
	//get

