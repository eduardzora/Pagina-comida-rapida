var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var cloudinary = require("cloudinary");
var method_override = require("method-override");
var app_password = "123456789";
var Schema = mongoose.Schema;

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
app.use(method_override("_method")); //Sobreescribir el metodo post a put
var middleware_upload = uploader.single('image_avatar');



//Definir el schema de nuestros productos
var productSchemaJSON = {
	title:String,
	descripcion:String,
	imageUrl:String,
	pricing:Number
};

var productSchema = new Schema(productSchemaJSON);
//Img por defecto cuando no se le pone imagen
//Atributo
productSchema.virtual("image.url").get(function(){
	if(this.imageUrl === "" || this.imageUrl === "data.png"){
		return "default.jpg";
	}
	return this.imageUrl;
});

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

//Ruta para formulario editar
app.get("/menu/edit/:id",function(req,res){
	var id_product = req.params.id;

	Product.findOne({"_id": id_product},function(error, producto){
		console.log(producto);
		res.render("menu/edit",{ product: producto });
	});
});
//Ruta para editar
app.put("/menu/:id",middleware_upload,function(req,res){

	if (req.body.password == app_password){
		var data = {
		title: req.body.title,
		descripcion: req.body.descripcion,
		pricing: req.body.pricing
	};

    if(req.file){

	 	cloudinary.uploader.upload(req.file.path,
	 		function(result){
	 			data.imageUrl = result.url;
				Product.update({"_id": req.params.id},data,function(product){
				res.redirect("/menu");
				});
            });
	 	
    }else{
    	Product.update({"_id": req.params.id},data,function(product){
		res.redirect("/menu");
	});
    }

	}else{
		res.redirect("/");
	} 
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
//Ruta para actualizar producto
app.post("/menu",middleware_upload,function(req,res){
	if (req.body.password == app_password) {
		var data = {
		title: req.body.title,
		descripcion: req.body.descripcion,
		pricing: req.body.pricing
	}

	 var product = new Product(data);
	 if(req.file){
	 	cloudinary.uploader.upload(req.file.path,
	 		function(result){
	 			product.imageUrl = result.url;
	 			product.save(function(err){
	 			console.log(product);
                res.redirect("/menu");
            });
	 	});
	 }

	}else{
		res.render("menu/new");
	} 
});

//Ruta para eliminar producto
app.get("/menu/delete/:id",function(req,res){
 	var id = req.params.id;

 	Product.findOne({"_id": id},function(err,producto){
 		res.render("menu/delete",{ producto: producto });
 	});
});

app.delete("/menu/:id",function(req,res){
	 	var id = req.params.id;
	if (req.body.password == app_password){
		Product.remove({"_id": id},function(err){
			if (err) {console.log(err);}
			res.redirect("/menu");
		});
	}else{
		res.redirect("/menu");
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

