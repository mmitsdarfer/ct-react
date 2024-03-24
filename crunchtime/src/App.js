import logo from './logo.svg';
import './main.css';
import Preferences from './Preferences';

function Home(){
  return (
      <a className="home" href="//localhost:8000">
      <button className="home" type="submit"> 
          <br></br><img type="image" width="70" height="70" src="./goHome.png"/>
      </button> 
  </a>
  )
}

function App() {
  return (
    <div>
    <Home></Home>
    <Preferences></Preferences>  
    </div>
      
  );
}


export default App;
