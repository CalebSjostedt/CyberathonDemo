
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')
  
  const initializePassport = require('./passport-config')
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )
  
  const users = []
  
  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
  
  app.get('/', authorized, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
  })
  
  app.get('/login', notAuthorized, (req, res) => {
    res.render('login.ejs')
  })
  
  app.post('/login', notAuthorized, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))
  
  app.get('/signup', notAuthorized, (req, res) => {
    res.render('signup.ejs')
  })
  
  app.post('/signup', notAuthorized, async (req, res) => {
    try {
      const hashedpwd = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedpwd
      })
      res.redirect('/login')
    } catch {
      res.redirect('/signup')
    }
  })
  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })
  
  function authorized(req, res, next) {
    if (req.isAuthorized()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function notAuthorized(req, res, next) {
    if (req.isAuthorized()) {
      return res.redirect('/')
    }
    next()
  }
  
  app.listen(3000)