var express = require('express');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'xxx@gmail.com',
        pass: 'xxx'
    }
});

var passwordMap = {
    
};

var accounts = Object.keys(passwordMap);

var passwordSent = [];

var teams = [[], []];

var maximumTeam = Math.ceil(accounts.length / 2);


function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function hashCode (password) {
    var hash = 0, i, chr, len;

    if (password.length == 0) return hash;

    for (i = 0, len = password.length; i < len; i++) {
        chr   = password.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
};

var random = Object.create({

   count : accounts.length ? accounts.length : 15,
   array : null,
   assignedArray : [],
   index : 0,

   getNextRandom: function() {
        if(this.array === null || this.array === undefined) {
            this.initArrays();
        }        
        if(this.index >= this.count) {
           this.index = 0;
           this.array = this.shuffle(this.array);
        }
        return this.array[this.index++];
   },
   
   initArrays: function() {
        this.array = [];
        for(var i  = 0; i < this.count; i++) {
           if(i > this.count / 2) {
              this.array[i] = 0;
           } else {
              this.array[i] = 1;
           }
        }
        this.array = this.shuffle(this.array);
   },
   
   shuffle: function(array) {
      var m = array.length, t, i;

      // While there remain elements to shuffle…
      while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }

      return array;
   }
});

app.post('/api/account', function (request, response) {

    var login = request.body.login;
    var password = request.body.password;

    if(login && password) {
        passwordMap[login] = hashCode(password);
        accounts.push(login);
        maximumTeam = Math.ceil(accounts.length / 2);
        response.send('Account added');
    } else {
       response.send('Login or password is invalid');  
    }

   
});

app.get('/api/reset', function (request, response) {
   var passwordParam = request.query['password'];

    if(passwordParam === 'sdsawga') {
        teams = [[], []];
        response.send('Resetted.');
    } else {
        response.send('Invalid password.');
    }

  
});

app.get('/api/accounts', function (request, response) {
    response.send(JSON.stringify({ accounts : accounts}));
});

app.get('/api/teams', function (request, response) {
    response.send(JSON.stringify(teams));
});

app.get('/api/teamNumber', function (request, response) {

    var loginParam = request.query['login'];
    
    if( contains(teams[0], loginParam) || contains(teams[1], loginParam) ) {
        response.send('Your are already in one of the teams');
    } else {
        var passwordParam = request.query['password']; 

        console.log(passwordMap[loginParam]);
        console.log(hashCode(passwordParam));
        
        if(passwordMap[loginParam] === hashCode(passwordParam)) {
            var teamNumber = random.getNextRandom();

            if(teams[teamNumber] && teams[teamNumber].length >= maximumTeam) {
                teamNumber = teamNumber ? 0 : 1;
            }

            teams[teamNumber].push(loginParam);

                var mailOptions = {
                    from: 'Password generator', // sender address
                    to: 'xxx1@epam.com', // list of receivers
                    subject: 'Team updated', // Subject line
                    text: JSON.stringify(teams), // plaintext body
                    html: JSON.stringify(teams) // html body
                };

                transporter.sendMail(mailOptions, function(error, info) {
                    if(error) {
                        console.log(error);
                    } else {
                        console.log('Team updated Message sent: ' + info.response);
                    }
                }); 
            
            response.send({ teamNumber : teamNumber });
        } else {
            response.send('Invalid credentials');
        }        
    }    

});

app.get('/api/passwords', function (request, response) {

    var password = request.query['password'];

    if(password === 'ghtygh1') {

        for(var i = 0; i < accounts.length; i++) {

            var mailOptions = {
                from: 'Password generator', // sender address
                to: accounts[i], // list of receivers
                subject: 'Your password for team selector', // Subject line
                text: 'Your password is', // plaintext body
                html: '<div>Your password for team selector is:</div>' + '<b>' + passwordMap[accounts[i]] + '</b> <div> Team selector v0.2 is here: http://9.9.9.9:9999' + '</div>' // html body
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if(error) {
                    console.log('Message not sent to :' + mailOptions.to + " : " + error);
                } else {
                    passwordSent.push(mailOptions.to);
                    console.log('Message sent to : ' + mailOptions.to);
                }
            });
        } 
    }

    response.send('Password sent. Check email.');       
});

app.use(express.static(__dirname + '/public'));

app.listen(9010, '9.9.9.9');