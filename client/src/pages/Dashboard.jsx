import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("your_jwt_secret");
    navigate("/");
  };
  return (
    <div>
      <h1>Hello dashboard</h1>
      <button type="" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
