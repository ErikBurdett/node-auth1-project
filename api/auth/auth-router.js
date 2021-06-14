const router = require('express').Router()
const bcrypt = require('bcryptjs')

const Users = require('../users/users-model')

const { 
  checkUsernameFree, 
  checkUsernameExists, 
  checkPasswordLength } = require('./auth-middleware')

  router.use("/register", checkUsernameFree)
  router.use("/register", checkPasswordLength)
  router.post("/register", (req, res, next) => {
    const { username, password } = req.body
    const hash = bcrypt.hashSync(password, 10)
    const user = { username, password: hash }
    
    Users.add(user)
    .then(addedUser => {
      res.status(201).json(addedUser)
    })
    .catch(err => next(err))
  })

  router.use("/login", checkUsernameExists)
  router.post("/login", (req, res, next) => {
    Users.findBy({ username: req.body.username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(
        req.body.password, user.password
      )) {
        req.session.user = user
        res.json({
          message: `Welcome ${user.username}!`
        })
      } else {
        res.status(401).json({
          "message": "Invalid credentials"
        })
      }
    })
    .catch(err => next(err))
  })

  router.get("/logout", (req, res, next) => {
    if (req.session && req.session.user) {
      req.session.destroy(err => {
        if (err) {
          next(err)
        } else {
          res.status(200).json({
            "message": "logged out"
          })
        }
      })
    } else {
      res.status(200).json({
        "message": "no session"
      })
    }
  })

  module.exports = router