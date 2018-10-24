var express = require('express');
var app = express();
const request = require("request-promise");
const cheerio = require('cheerio');
var bodyParser = require('body-parser');
var cors = require('cors');
var S = require('string');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

var headers;


app.use(cors());

app.use(bodyParser.json());

app.post('/api', function(req, res){

  getInfo(req.body.ra, req.body.senha)
    .then(function (response){
      res.send(response);
    });

});

app.listen(process.env.PORT || 3000, function(){
  console.log('Servidor rodando!');
});

async function getInfo(ra, senha){
    await getCookie(ra, senha);

    var jsonNotas = getJsonNotas();

    var jsonFaltas = getJsonFaltas();

}

async function getCookie(ra, senha){

    var options = {
        method: 'POST',
        uri: 'https://aluno.unicesumar.edu.br/lyceump/aonline/middle_logon.asp',
        form: {
            txtnumero_matricula: ra, 
            txtsenha_tac: senha 
        }
    };

    var aux;

    await request(options)
    .then(function (parsedBody) {
        
    })
    .catch(function (err) {
        aux = err;
    });


    var cookie = aux['response']['headers']['set-cookie'];

    request.cookie(cookie[0]);

    headers = {
        'Content-Type': 'application/json',
        'Cookie': cookie
    }

}

async function getJsonNotas(){

    var options = {
        url: 'https://aluno.unicesumar.edu.br/lyceump/aonline/notas_freq.asp',
        method: 'GET',
        headers: headers
    }

    var json;
    await request(options)
    .then(function(res){
        var notas;
        var x = 0;

        if(res.length < 1000){
            console.log('Erro no GET das notas!');
            json = 'ERROR';
            return;
        }

        $ = cheerio.load(res);

        $('.tr01 .font01 ').each(function(i, elem){
            switch(x){
                case 1:
                notas += "{ \"Disciplina\": \"" + $(this).text() + "\", ";
                break;
                case 2:
                notas += "\"Bim1\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 3:
                notas += "\"Bim2\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 4:
                notas += "\"S1B1\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 5: 
                notas += "\"S1B2\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 6: 
                notas += "\"Bim3\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 7: 
                notas += "\"Bim4\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 8: 
                notas += "\"S2B3\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 9: 
                notas += "\"S2B4\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + "}, ";
                break;
            }
            x++;
            if(x==10){
                x = 0;
            }
        });
        $('.tr01a .font01 ').each(function(i, elem){
            switch(x){
                case 1:
                notas += "{ \"Disciplina\": \"" + $(this).text() + "\", ";
                break;
                case 2:
                notas += "\"Bim1\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 3:
                notas += "\"Bim2\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 4:
                notas += "\"S1B1\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 5: 
                notas += "\"S1B2\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 6: 
                notas += "\"Bim3\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 7: 
                notas += "\"Bim4\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 8: 
                notas += "\"S2B3\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
                break;
                case 9: 
                notas += "\"S2B4\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + "}, ";
                break;
            }
            x++;
            if(x==10){
                x = 0;
            }
        });
    
        notas = notas.replace('undefined','');
        notas = notas.substr(0,(notas.length -2));
        notas = "{ \"Notas\": [" + notas + "] } ";
        json = JSON.parse(notas);

    }).catch(function(err){
        console.log('Catch no request do GET das notas!');
        json = 'ERROR';
    });

    return json;
}

async function getJsonFaltas(){

    var options = {
        url: 'https://aluno.unicesumar.edu.br/lyceump/aonline/ti_selecao_disciplina_frequencia.asp',
        method: 'GET',
        headers: headers
    }

    var json;

    var a = await request(options)
        .then(function (res){
            var a = [];
            $ = cheerio.load(res);
            $(' dt ').each(function (i,elem){
                a[i] = $(this).html();
            });
            return a;
        });
    

    
    a.forEach(async function(elem){
        var linkF = 'https://aluno.unicesumar.edu.br/lyceump/aonline/' + S(elem).between("\"","\"").s;
        options.url = linkF;

        // json += "{";
        
        json += await setJsonFaltas(options, entities.decode(S(elem).between(">","<").s));
        
        json += "}, ";

    });
    
}

async function setJsonFaltas(options, materia){
    var bool = true;
    var string;

    string = "Materia: \""+materia+"\", ";
    await request(options)
    .then(async function (res){
        
        $ = cheerio.load(res);
        
        await $(' #desc-frequencia .disciplina tbody tr:last-child td ').each(function (i,elem){
            
            if(bool){
                string += "FaltasPermitidas: "+$(this).html()+", ";
                bool = false;
            }else{
                string += "FaltasComputadas: "+$(this).html();
                bool = true;
            }
            
        });
        
    });
    return string;
}