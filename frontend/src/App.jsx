import './App.css'
import {TakeInput} from './components/Input'
import ParticlesComponent from './components/Particles'

function App() {

  return (
    <div>
      <ParticlesComponent id="particles"></ParticlesComponent>
      <TakeInput></TakeInput>
    </div>
  );
}

export default App;