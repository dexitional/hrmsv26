var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cors = require('cors');
var compression = require('compression');
var helmet = require('helmet');
var moment = require('moment-business-days');
var app = express();
var db = require('./config/database');
app.use(bodyParser.urlencoded({extended:true}));
app.use(compression()); // Site Compression
app.use(helmet()); // Security & Vulnearbilities guard


// api routes
//var portal = require('./routes/portal');
//app.use('/api',portal);

var port = process.env.PORT || 3000;
var server = app.listen(port, () => {
    console.log("Server started on Port : "+port);
});

// Load Momment Module -- Configure Holidays
var loadmoment =  async (req, res, next) => {
    let holidays  = await db.query("select date_format(holiday,'%m-%d-%Y') as holiday from leave_exclude where (year = '"+new Date().getFullYear()+"' or year = '"+(new Date().getFullYear()+1)+"')");
    holidays = holidays.map(h => {
         return h.holiday;
    })
    moment.updateLocale('us',{
        holidays,
        holidayFormat:'MM-DD-YYYY',
        workingWeekdays: [1,2,3,4,5],
        nextBusinessDayLimit: 365,
        prevBusinessDayLimit:31
    });
    return next();             
}


// Routes
app.get('/', (req,res) =>{
    res.sendStatus(401);
})

app.get('/getleaveinfo',loadmoment,(req,res) =>{
        
    // const type = req.query.type;
    // const sno = req.query.sno;
    // const group = req.query.group;
    // let start,end,resume,days;
    // if(group != 'SM'){
    //     if(type == 1 || type == 2 || type == 6){
    //         // CASUAL LEAVE, ANNUAL LEAVE,SPECIAL LEAVE
    //         days = parseInt(req.query.approved_days) || 0;
    //         start = moment(req.query.start_date).format('YYYY-MM-DD');
    //         end = moment(start).businessAdd(days-1).format('YYYY-MM-DD');           
    //         resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');            

    //     }else if(type == 3 || type == 4){
    //         // MARTENITY LEAVE, SICK LEAVE 
    //         days = parseInt(req.query.approved_days) || 0;
    //         start = moment(req.query.start_date).format('YYYY-MM-DD');
    //         end = moment(start).add((days-1),"days").format('YYYY-MM-DD');           
    //         resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 

    //     }else if(type == 5 ){
    //         // EXAMINATION LEAVE -- HAS 4 DAYS ADDITION TO LEAVE -- EXCUSE PLAN
    //         days = parseInt(req.query.approved_days) || 0;
    //         start = moment(req.query.start_date).format('YYYY-MM-DD');
    //         end = moment(start).businessAdd(days-1).format('YYYY-MM-DD');           
    //         resume = moment(end).businessAdd(4).format('YYYY-MM-DD');
    //     }
    // }else{ 

    //     if(type != 5 ){
    //         // ALL LEAVE 
    //         days = parseInt(req.query.approved_days) || 0;
    //         start = moment(req.query.start_date).format('YYYY-MM-DD');
    //         end = moment(start).add((days-1),"days").format('YYYY-MM-DD');           
    //         //resume = moment(end).add(1,"days").format('YYYY-MM-DD'); 
    //         resume = moment(end).nextBusinessDay().format('YYYY-MM-DD');
           
    //     }else{
    //         // EXAMINATION LEAVE -- HAS 4 DAYS ADDITION TO LEAVE -- EXCUSE PLAN
    //         days = parseInt(req.query.approved_days) || 0;
    //         start = moment(req.query.start_date).format('YYYY-MM-DD');
    //         end = moment(start).add((days-1),"days").format('YYYY-MM-DD');            
    //         resume = moment(end).add(4,"days").format('YYYY-MM-DD'); 
    //     }
    // }
    // res.json({start,end,resume})
    res.json('lam')
})
