/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: ______________________ Student ID: ______________ Date: ______________
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/
const legoData = require("./modules/legoSets");
const path = require("path");
const bodyParser = require('body-parser');

const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req,res)=>{

  let sets = [];

  try{    
    if(req.query.theme){
      sets = await legoData.getSetsByTheme(req.query.theme);
    }else{
      sets = await legoData.getAllSets();
    }

    res.render("sets", {sets})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
  
});

app.get("/lego/sets/:num", async (req,res)=>{
  try{
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", {set})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
});

app.get('/lego/addSet', async (req, res) => {
  try {
      const themes = await legoData.getAllThemes(); 
      res.render('addSet', { themes });
  } catch (err) {
      res.render('500', { message: `Error fetching themes: ${err.message}` });
  }
});

// POST route to add a new set
app.post('/lego/addSet',async (req, res) => {
  try {
      const setData = req.body;
     await legoData.addSet(setData); // Assuming addSet(setData) is a Promise-based function
      res.redirect('/lego/sets');
  } catch (err) {
    console.log(err)
      res.render('500', { message: `Error adding set: ${err.message}` });
  }
});

app.get('/lego/editSet/:num', async (req, res) => {
  try {
    const setNum = req.params.num;
    const set = await legoData.getSetByNum(setNum);
    const themes = await legoData.getAllThemes();
    console.log(set)
    res.render('editSet', { set, themes });
  } catch (err) {
    console.error(err);
    res.status(404).render('404', { message: err.message });
  }
});

// POST route to handle updating the set
app.post('/lego/editSet', async (req, res) => {
  try {
    const setNum = req.body.set_num;
    const setData = req.body;
    await legoData.editSet(setNum, setData);
    res.redirect('/lego/sets');
  } catch (err) {
    console.error(err);
    res.status(500).render('500', { message: `Error updating set: ${err.message}` });
  }
});
app.get('/lego/deleteSet/:num', async (req, res) => {
  const setNum = req.params.num;
  try {
    await legoData.deleteSet(setNum);
    res.redirect('/lego/sets');
  } catch (err) {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});