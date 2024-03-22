import logo from './logo.svg';
import './main.css';
import Dropdowns from './dropdowns';

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
      <h1>Preferences</h1>
     
      <Dropdowns></Dropdowns>
    </div>
    
  );
}


export default App;
