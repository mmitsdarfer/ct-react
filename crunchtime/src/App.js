import logo from './logo.svg';
import './main.css';
import Preferences from './Preferences';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function HomeButton(){
  return (
      <a className="home" href="//localhost:8000">
      <button className="home" type="submit"> 
          <br></br><img type="image" width="70" height="70" src="./goHome.png"/>
      </button> 
  </a>
  )
}

function HomePage(){
  return(
    <h1>Welcome Home</h1>
  )
}

function PrefButton(){
  return(
    <p>PrefButton here</p>
  )
}

function App(){
  return (
    <Router>
      <Routes>
        <Route exact path='/' element={
          <div>
            <PrefButton></PrefButton>
            <HomePage></HomePage>
          </div>
        } />
        <Route exact path='/preferences' element={
          <div>
          <HomeButton></HomeButton>
          <Preferences></Preferences>  
          </div>
        } />
      </Routes>
    </Router>      
  );
}


export default App;
