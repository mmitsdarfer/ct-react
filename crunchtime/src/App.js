import './main.css';
import './league.css';
import Preferences from './Preferences';
import Home from './Home';
import League from './League';
import { logos } from './logos';
import prefs from './json/preferences.json';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import React from 'react';

function makeCapital(lower){
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

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

function Priority(){
  return(
      <div>
          <p>
              Priorities: <br></br>
              {makeCapital(prefs[1][0])} <br></br>
              {makeCapital(prefs[1][1])} <br></br>
              {makeCapital(prefs[1][2])}
          </p>
      </div>
  )
}

function LeaguePage({league}){
  function leagueLogo(){
    if(league === 'NHL') return logos.NHL;
    else if(league === 'NFL') return logos.NFL;
    else if(league === 'MLB') return logos.MLB;
    else if(league === 'NBA') return logos.NBA;
  }
  return(
  <div>
            <HomeButton></HomeButton>
            <PrefButton></PrefButton>
            <League league={league} logoData={leagueLogo()}></League>
            <Priority></Priority>
          </div>
  )
}

function App(){
  return (
    <Router>
      <Routes>
        <Route exact path='/test' element={
          <p></p>
        } />
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
          <LeaguePage league={'NHL'}></LeaguePage>
        } />
        <Route exact path='/nfl' element={
          <div>
            <HomeButton></HomeButton>
            <PrefButton></PrefButton>
            <League league={'NFL'} logoData={logos.NFL}></League>
            <Priority></Priority>
          </div>
        } />
        <Route exact path='/mlb' element={
          <div>
            <HomeButton></HomeButton>
            <PrefButton></PrefButton>
            <League league={'MLB'} logoData={logos.MLB}></League>
            <Priority></Priority>
          </div>
        } />
        <Route exact path='/nba' element={
          <div>
            <HomeButton></HomeButton>
            <PrefButton></PrefButton>
            <League league={'NBA'} logoData={logos.NBA}></League>
            <Priority></Priority>
          </div>
        } />
      </Routes>
    </Router>      
  );
}


export default App;
