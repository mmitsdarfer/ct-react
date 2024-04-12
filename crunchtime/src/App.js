import './main.css';
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
import { useCookies } from 'react-cookie';

function makeCapital(lower){
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}


function HomeButton(){
  // line below hides unneeded warning (cookies not used)
  // eslint-disable-next-line 
  const [cookies, setCookie] = useCookies('Current');
  return (
    <a href="//localhost:3000">
      <button id="home" type="submit" onClick={() => setCookie('Current', null, { path: '/' })}> 
          <br></br><img type="image" width="70" height="70" src="./goHome.png" alt="home"/>
      </button> 
    </a>
  )
}

function PrefButton(){
  // line below hides unneeded warning (cookies not used)
  // eslint-disable-next-line 
  const [cookies, setCookie] = useCookies('Current');
  return(
    <a href="//localhost:3000/preferences">
      <button id="prefs" type="submit"  onClick={() => setCookie('Current', null, { path: '/' })}>
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

function checkCookies(){
  const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
  )
  if(getCookieValue('Priority0') === '' || getCookieValue('Priority1') === '' || getCookieValue('Priority2') === ''){
    document.cookie = 'Priority0=diffs';
    document.cookie = 'Priority1=times';
    document.cookie = 'Priority2=standings';
  }
  if(getCookieValue('Current') === '') document.cookie = 'Current=null';
  if(getCookieValue('Reset') === '') document.cookie = 'Reset=false';
  if(getCookieValue('Take') === '') document.cookie = 'Take=false';
  if(getCookieValue('Timer') === '') document.cookie = 'Timer=manual';
}

function App(){
  // line below hides unneeded warning (cookies not used)
  // eslint-disable-next-line 
  const [cookies, setCookie] = useCookies('Current');
  setCookie('Current', null, { path: '/' });
  checkCookies();
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
            <LeaguePage league={'NFL'}></LeaguePage>
        } />
        <Route exact path='/mlb' element={
            <LeaguePage league={'MLB'}></LeaguePage>
        } />
        <Route exact path='/nba' element={
            <LeaguePage league={'NBA'}></LeaguePage>
        } />
      </Routes>
    </Router>      
  );
}

export default App;
