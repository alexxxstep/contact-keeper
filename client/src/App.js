import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import About from './pages/About'
import Home from './pages/Home'
import Navbar from './components/Navbar'

import ContactState from './context/contact/ContactState'

import './App.css'

const App = () => {
  return (
    <ContactState>
      <Router>
        <>
          <Navbar />
          <div className='container'>
            <Switch>
              <Route exact path='/' component={Home} />
              <Route exact path='/about' component={About} />
            </Switch>
          </div>
        </>
      </Router>
    </ContactState>
  )
}

export default App
