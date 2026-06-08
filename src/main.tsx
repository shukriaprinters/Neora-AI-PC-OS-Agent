import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import NeuralOSApp from './components/NeuralOSApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NeuralOSApp />
  </StrictMode>,
);
