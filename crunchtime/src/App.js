import './main.css';
import Preferences from './Preferences';
import Home from './Home';
import LeaguePage from './League';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function HomeButton(){
  return (
    <a href="//localhost:3000">
      <button className="home" type="submit"> 
          <br></br><img type="image" width="70" height="70" src="./goHome.png"/>
      </button> 
    </a>
  )
}

function PrefButton(){
  return(
    <a href="//localhost:3000/preferences">
      <button className="prefs" type="submit">
        Preferences <img type="image" width="60" height="60" src="./podium.png"/>
      </button>
    </a>      
  )
}
const logos = [['NHL', 120, 120, 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/05_NHL_Shield.svg/1200px-05_NHL_Shield.svg.png'],
        ['NFL', 100, 120, 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png'],
        ['MLB', 160, 86, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Major_League_Baseball_logo.svg/1200px-Major_League_Baseball_logo.svg.png'],
        ['NBA', 73, 120, 'https://brandlogos.net/wp-content/uploads/2014/09/NBA-logo-big.png']
    ];

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
            <LeaguePage logoData={logos[0]}></LeaguePage>
          </div>
        } />
        <Route exact path='/nfl' element={
          <div>
           
          </div>
        } />
        <Route exact path='/nba' element={
          <div>
           
          </div>
        } />
        <Route exact path='/mlb' element={
          <div>
         
          </div>
        } />
      </Routes>
    </Router>      
  );
}


export default App;
