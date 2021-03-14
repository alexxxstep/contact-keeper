const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

const { check, validationResult } = require('express-validator')

const User = require('../models/User')
const Contact = require('../models/Contact')
const { rawListeners } = require('../models/User')

// @route   GET api/contacts
// @desc    GET get all user contacts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1,
    })

    res.json(contacts)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   POST api/contacts
// @desc    Add new contact
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'name is required').not().isEmpty(),
      check('email', 'Include valid email').isEmail(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const user = req.user.id
    const { name, email, phone, type } = req.body

    try {
      let contact = await Contact.findOne({ user, email })

      if (contact) {
        return res.status(400).json({ msg: 'Contact already exist' })
      }

      contact = new Contact({
        user,
        name,
        email,
        phone,
        type,
      })

      await contact.save()

      res.json({ contact })
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

// @route   PUT api/contacts/:id
// @desc    Update contact
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ msg: 'Contact is not found' })
    }

    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorised' })
    }

    // Build contact object

    const contactFields = Object.keys(req.body).reduce((acc, item) => {
      return { ...acc, [item]: req.body[item] }
    }, {})

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        $set: contactFields,
      },
      { new: true }
    )

    res.json(contact)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   DELETE api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ msg: 'Contact is not found' })
    }

    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorised' })
    }

    await Contact.findByIdAndRemove(req.params.id)

    res.json({ msg: 'Contact removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
