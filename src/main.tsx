import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import PremiumNeuralOSApp from './components/PremiumNeuralOSApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PremiumNeuralOSApp />
  </StrictMode>,
);
