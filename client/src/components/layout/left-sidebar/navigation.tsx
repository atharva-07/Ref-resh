import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav>
      <ol>
        <Link to="/">Home</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/messages">Messages</Link>
      </ol>
    </nav>
  );
};

export default Navigation;
