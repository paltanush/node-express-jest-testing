const express = require('express')
const router = express.Router();
const auth = require('../middleware/auth')
const User = require('../models/user')


//Signup
router.post('/user/signup', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//Login
router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

// Logout
router.post('/user/logout', auth, async(req, res) => {
    try {
    req.user.tokens = req.user.tokens.filter((token)=> {
        return token.token != req.token
    })
    await req.user.save()
    res.send()
} catch (e) {
    res.status(500).send()
}
})

//update user
router.patch('/user/updateProfile', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:'Invalid Updates'})
    }
    try {
        updates.forEach((update) =>  req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router