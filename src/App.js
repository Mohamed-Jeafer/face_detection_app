import React, { Component } from 'react';
import Particles from 'react-particles-js';

import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo'
import Rank from './components/Rank/Rank'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'

import './App.css';


const particlesOptions = {
  "particles": {
    "number": {
      "value": 80,
      "density": {
        "enabled": true,
        "value_area": 800
      }
    },
    "size": {
      "value": 3
    }
  },
  "interactivity": {
    "events": {
      "onhover": {
        "enable": true,
        "mode": "repulse"
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: "signin",
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {

  constructor() {
    super();
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data['id'],
        name: data['name'],
        email: data['email'],
        entries: data['entries'],
        joined: data['joined']
      }
    })
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route });
  }

  calculateFaceLocation = (data) => {
    let clarifaiFace = data['outputs'][0]['data']['regions'][0]['region_info']['bounding_box'];
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    this.setState({
      box: box
    })
  }

  onInputChange = (event) => {
    this.setState({
      input: event.target.value
    });
  }

  onButtonSubmit = () => {
    this.setState({ imageURL: this.state.input })
    fetch('https://pure-harbor-16932.herokuapp.com/imageurl', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://pure-harbor-16932.herokuapp.com/image', {
            method: 'put',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })
            .catch(err => {
              console.log('Unable to update rank entries')
            })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      }).catch(console.error())

  }

  render() {
    const {
      isSignedIn,
      box,
      imageURL,
      route,
    } = this.state;
    return (<div className='App' >
      <Particles className='particles'
        params={
          particlesOptions
        }
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
      { route === 'home'
        ? <div>
          <Logo />
          <Rank
            name={this.state.user.name}
            entries={this.state.user.entries}
          />
          <ImageLinkForm onInputChange={
            this.onInputChange
          }
            onButtonSubmit={
              this.onButtonSubmit
            }
          /> <FaceRecognition box={box}
            imageURL={imageURL}
          />
        </div> :
        (
          route === 'signin' ?
            <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} imageURL={imageURL} /> :
            <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        )
      }
    </div>
    );
  }
}

export default App;  