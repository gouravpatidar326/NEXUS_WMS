import Providers from './Providers';
import AppRouter from '@/routes';

export const App = () => {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
};

export default App;
