import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components';
import './PlaceholderPage.css';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="placeholder-page">
      <Navbar />
      
      <div className="placeholder-content">
        <h1>{title}</h1>
        <p>{description}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    </div>
  );
};
