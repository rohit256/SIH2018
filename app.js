var express = require('express');
var app = express();
var mysql = require('mysql');
var request = require('request');
var bodyParser = require("body-parser");
var source=110034;
var destination=110078;
var price=0;
var weight;
var distance;
var current_cno = 2;
var cnt=0;
var cnt2=0;
var f1=0;
var f2=0;
var q1=0;
var q2=0;
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','ejs');

var sname,sphone,saddress,spin,dname,dphone,daddress,dpin;
var cno;
var x;
var flag_invalidconsign=0;

var con = mysql.createConnection({
  host     : 'us-cdbr-iron-east-05.cleardb.net',
  user     : 'bc13d4625760eb',
  password : 'd00e27aa',
  database : 'heroku_88435cc89f950d3'
});

function handleDisconnect() {
 console.log('handleDisconnect()');
 con.destroy();
 
 con.connect(function(err) {
     if(err) {
 console.log(' Error when connecting to db  (DBERR001):', err);
 setTimeout(handleDisconnect, 900);
     }
 });
 
}


app.post("/ussd",function(req,res){

    var str;
    var x = req.body.text;
    if(String(x)=="")
    {
        res.end("CON Enter Consignment Number : ");
    }
    else
    {    
        console.log(x);
        var y = parseInt(x);
        con.query('select * from status where status.cno=?',[y], function(err, result){
            if(result.length == 0){
                str = "Consignment no not found";
                console.log("END Cno is not available");
                res.end("END Cno is not available");
            }
            else{
                res.end("END Status: " + result[result.length -1]["cstatus"]+ " --> " + result[result.length -1]["cdate_time"]);
            }
        });
    }
    
    
    //console.log(req.body.text);
    //console.log(result[0]["cstatus"]);
});
 var pass;
app.post("/ussd_nsh",function(req,res){

    var str;
    var x = req.body.text;
    //pass = req.body.text;
    //var cno;
    if(String(x)=="")
    {
        //cno=String(x);
        res.end("CON Enter Consignment Number : ");
        
        
        
    }
    else 
    {    
        //console.log(cno+'fuck');
        //console.log(pass+'salik');
        //console.log(x);
        var cno = parseInt(x);
        var cdate_time =  (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
        var cstatus = 'reached nsh'; 
        var z = {cno:cno, cdate_time:cdate_time,cstatus:cstatus};
        con.query('insert into status set ?',z, function(err, result){
            if(err)throw err;
            res.end("END cno is successfully updated");
        });
       
    }
    
    
    
    
    //console.log(req.body.text);
    //console.log(result[0]["cstatus"]);
});

app.post("/ussd_delivered",function(req,res){

    var str;
    var x = req.body.text;
    if(String(x)=="")
    {
        res.end("CON Enter Consignment Number : ");
    }
    else
    {   
        console.log(x);
        var cno = parseInt(x);
        var cdate_time =  (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
        var cstatus = 'delivered'; 
        var z = {cno:cno, cdate_time:cdate_time,cstatus:cstatus};
        con.query('insert into status set ?',z, function(err, result){
            if(err)throw err;
            res.end("END cno is successfully updated");
        });
    }
    
    
    //console.log(req.body.text);
    //console.log(result[0]["cstatus"]);
});



app.post("/app_request",function(req,res){
    console.log(req.body);
    var x = req.body.cno;
    console.log(x);
    con.query('select * from status where status.cno=?',[x], function(err, result){
    if(result.length == 0){
       res.end("Consignment no not found")
    }
    else{
        res.end(result[0]["cstatus"]);
    }
    });
});
var url=" http://postalpincode.in/api/pincode/" + String(110023);
    request(url,function(error,response,body){
    if(!error && response.statusCode ==200 )
    {
    	//Things worked
    	//console.log(body);
    	var parsedData = JSON.parse(body);
    	//console.log(parsedData["PostOffice"]);
    	data_postoffice = parsedData["PostOffice"];
    }
    });

app.get("/",function(req,res){
    res.render("index");
});
app.get("/main_server",function(req,res){
   res.render("main_server"); 
});
app.get("/starting_postoffice",function(req,res){
   res.render("starting_po"); 
});
app.get("/nsh_page",function(req,res){
   res.render("nsh_page"); 
});
app.get("/destination_postoffice",function(req,res){
   res.render("destination_po"); 
});
app.get("/registered_post",function(req,res){
   res.render("registeredpost"); 
});
app.get("/status_change",function(req,res){
   res.render("consignment_status",{f1:f1,f2:f2}); 
   f2=0;
   f1=0;
});
app.get("/speedpost_dp",function(req,res){
   res.render("speedpost_dp",{q1:q1,q2:q2}); 
   q2=0;
   q1=0;
});
app.post("/speedpost_dp",function(req,res){
    q1=1;
    var cno = req.body.cno;
    con.query('select * from status where status.cno=?',[cno], function(err, result){
    if(result.length !=0){
        var cdate_time = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
        var cstatus = 'delivered';
        var z = {cno:cno , cdate_time:cdate_time, cstatus:cstatus};
        con.query('insert into status set ?',z, function(err, result){
            if(err) throw err;
        });
        res.redirect("/speedpost_dp"); 
        return;
    }
    q2=1;
    res.redirect("/speedpost_dp"); 
    });
});
app.post("/status_change",function(req,res){
    f1=1;
    var cno = req.body.cno;
    con.query('select * from status where status.cno=?',[cno], function(err, result){
    if(result.length != 0){
        var cdate_time = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
        var cstatus = 'reached nsh';
        var z = {cno:cno , cdate_time:cdate_time, cstatus:cstatus};
        con.query('insert into status set ?',z, function(err, result){
            if(err) throw err;
        });
        res.redirect("/status_change"); 
        return;
    }
    f2=1;
    res.redirect("/status_change"); 
    });
});
app.get("/parcel",function(req,res){
   res.render("parcel"); 
});
app.get("/find_pincode",function(req,res){
    res.render("find_pincode");
});
app.get("/calculate_postage",function(req,res){
    res.render("calculate_postage",{price:price});
});
app.post("/calculate_postage",function(req,res){
    source = req.body.source_pincode;
    destination = req.body.destination_pincode;
    weight = req.body.weight;
    console.log(req.body);
    //var url ="https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + String(source) +"&destinations=" +String(destination) + "&key=AIzaSyBCi76ZQ4pFE7RVbHgPtYZ3qIPwfCo8T4M";
   var source1 = String(source);
   var destination1 = String(destination);
   var url ="https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + source1 +"&destinations=" +destination1 + "&key=AIzaSyBCi76ZQ4pFE7RVbHgPtYZ3qIPwfCo8T4M";
    request(url,function(error,response,body){
    if(error)
    {
    	console.log("Something went wrong!");
    	console.log(error);
    }
    else if(response.statusCode ==200 )
    {
    	//Things worked
    	var parsedData = JSON.parse(body);
    	//Distance
    	//console.log(parsedData["rows"][0]["elements"][0]["distance"]["value"]);
    	distance = parsedData["rows"][0]["elements"][0]["distance"]["value"];

    }
    price = weight*distance/10000;
    console.log(price);
    res.redirect("/calculate_postage");
});
});
app.get("/track_consignment",function(req,res){
    res.render("track_consignment",{flag_invalidconsign:flag_invalidconsign,cnt2:cnt2});
    cnt2=0;
});
app.get("/display_consignment",function(req,res){
    x=cno;

    con.query('select * from status where status.cno=?',[x], function(err, result){
    if(result.length == 0){
        flag_invalidconsign=1;
        res.render("track_consignment",{flag_invalidconsign:flag_invalidconsign,cnt2:cnt2});
        cnt2=0;
        flag_invalidconsign=0;
        
        return;
    }
        
    return res.render('display_consignment', {result : result,cno : cno});
    });
});
app.post("/track_consignment",function(req,res){
    cnt2=1;
    cno = req.body.cno;
    console.log(req.body);
    return res.redirect("/display_consignment");
});
var flag =0 ;
app.get("/speedpost",function(req,res){
    console.log('yes '+cnt);
    res.render("speedpost_server",{flag:flag,cnt:cnt});
    cnt=0;
});
app.post("/speedpost",function(req,res){
    //console.log(req.body);
    cnt=1;
    sname = req.body.sname;
    saddress = req.body.saddress;
    sphone = req.body.sphone;
    spin = req.body.spin;
    dname = req.body.dname;
    daddress = req.body.daddress;
    dphone = req.body.dphone;
    dpin = req.body.dpin;
    cno = req.body.cnum;
    pweight = req.body.w;
    pservice = 'speed-post';
    cdate_time = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
    cstatus = 'Dispatched';
    //console.log(sname);
    var x = {cno : cno,sname : sname,sphone : sphone,saddress: saddress,spin: spin,dname:dname,dphone:dphone,daddress:daddress,dpin:dpin};
    var y = {cno:cno,pweight:pweight,pservice:pservice};
    var z = {cno:cno,cdate_time:cdate_time,cstatus:cstatus};
    var r = cno;
    var len;
    con.query('select * from consignment where consignment.cno = ?',r, function(err, result){
    if(err)throw err;
    len = result.length;
    if(cno.length==0 || sname.length==0 || sphone.length==0 || saddress.length==0 || spin.length==0 || dname.length==0 || dphone.length==0 || daddress.length==0 || dpin.length==0 || len>0){
        flag =1;
        return res.redirect("/speedpost");
    }
    console.log(len);
    console.log("running...");
    con.query('insert into consignment set ?',x, function(err, result){
    if (err) throw err;
    //console.log(result);
    });
    con.query('insert into product set ?',y, function(err, result){
    if (err) throw err;
    //console.log(result);
    });
    con.query('insert into status set ?',z, function(err, result){
    if (err) throw err;
    //console.log(result);
    });
    flag=0;
    return res.redirect("/speedpost");
    });
});
app.get("/track_postoffice",function(req,res){
    res.render("track_postoffice");
});


app.post("/track_postoffice",function(req,res){
    var pincode = req.body.pincode;
    var url=" http://postalpincode.in/api/pincode/" + String(pincode);
    request(url,function(error,response,body){
    if(!error && response.statusCode ==200 )
    {
    	var parsedData = JSON.parse(body);
    	data_postoffice = parsedData["PostOffice"];
    }
    res.render("display_postoffice",{data_postoffice:data_postoffice});
    });
});

app.listen(process.env.PORT || 7400,function(){
    console.log("running..." + process.env.PORT);
});
