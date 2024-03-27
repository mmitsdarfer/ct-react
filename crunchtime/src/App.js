import './main.css';
import './league.css';
import Preferences from './Preferences';
import Home from './Home';
import LeaguePage from './League';
import { logos } from './logos';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function HomeButton(){
  return (
    <a href="//localhost:3000">
      <button className="home" type="submit"> 
          <br></br><img type="image" width="70" height="70" src="./goHome.png" alt="home"/>
      </button> 
    </a>
  )
}

function PrefButton(){
  return(
    <a href="//localhost:3000/preferences">
      <button className="prefs" type="submit">
        Preferences <img type="image" width="60" height="60" src="./podium.png" alt="prefImage"/>
      </button>
    </a>      
  )
}

function App(){
  return (
    <Router>
      <Routes>
        <Route exact path='/' element={
          <div>    
            <Home></Home>
            <PrefButton></PrefButton>
          </div>
        } />
        <Route exact path='/preferences' element={
          <div>
          <HomeButton></HomeButton>
          <Preferences></Preferences>  
          </div>
        } />
        <Route exact path='/nhl' element={
          <div>
            <HomeButton></HomeButton>
            <PrefButton></PrefButton>
            <LeaguePage league={'NHL'} logoData={logos.NHL}></LeaguePage>
          </div>
        } />
        <Route exact path='/nfl' element={
          <div>
            <HomeButton></HomeButton>
            <PrefButton></PrefButton>
            <LeaguePage league={'NFL'} logoData={logos.NFL}></LeaguePage>
          </div>
        } />
        <Route exact path='/mlb' element={
          <div>
            <HomeButton></HomeButton>
            <PrefButton></PrefButton>
            <LeaguePage league={'MLB'} logoData={logos.MLB}></LeaguePage>
          </div>
        } />
        <Route exact path='/nba' element={
          <div>
            <HomeButton></HomeButton>
            <PrefButton></PrefButton>
            <LeaguePage league={'NBA'} logoData={logos.NBA}></LeaguePage>
          </div>
        } />
      </Routes>
    </Router>      
  );
}


export default App;
