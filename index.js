import express from 'express';
import fs from 'fs';
import { engine } from 'express-handlebars';

import {fileURLToPath} from "url";
import {dirname} from "path"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

let stats = fs.readFileSync(`${__dirname}/dynamic/stats.json`);

app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

console.clear()

app.get('/', (req, res) => {
    res.render('home');
});

// serve dynamic files
app.use((req, res, next) => {
    switch(req.path) {
      case "/api/stats":
        if(req.method == "GET") {
          res.status(200)
          res.send(stats)
        } else {
          res.status(406)
          if(req.accepts("json")) {
            res.json({error: "Method Not Allowed", path: req.path})
          } else {
            res.send("406: Method Not Allowed")
          }
        }
        break;
      case "/api/vote":
        if(req.method == "POST") {
          res.status(200)
          res.send({error: false, newCount: stats.colors})
        } else {
          res.status(406)
          if(req.accepts("json")) {
            res.json({error: "Method Not Allowed", path: req.path})
          } else {
            res.send("406: Method Not Allowed")
          }
        }
        break;
      default:
        next()
        break;
    }
  }, // serve arbitrary files 
  (req, res, next) => {
    let exists = fs.existsSync(`${__dirname}/static${req.path}`);
    let isDirectory = exists && 
      fs.lstatSync(`${__dirname}/static${req.path}`).isDirectory();
    if(!isDirectory && exists) {
      res.status(200)
      res.sendFile(`${__dirname}/static${req.path}`)
    } else {
      next()
    }
  }, //serve 404 files 
  (req,res) => {
    res.status(404)
    if(req.accepts("html")) {
      res.render('404')
    } else if(req.accepts("json")) {
      res.json({error: "Not Found", path: req.path})
    } else {
      res.send("404: Not Found")
    }
  }
)



app.listen(3000);