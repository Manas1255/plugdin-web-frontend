import './Loading.css';

export const Loading = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};
