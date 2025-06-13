import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captcha_code: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captcha, setCaptcha] = useState({ id: "", image: "" });
  const navigate = useNavigate();

  // Fetch CAPTCHA on component mount
  useEffect(() => {
    const fetchCaptcha = async () => {
      try {
        const response = await axios.get("http://localhost:3000/captcha");
        setCaptcha({
          id: response.data.captcha_id,
          image: response.data.captcha,
        });
      } catch (error) {
        setError("Failed to load CAPTCHA");
      }
    };
    fetchCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email || !formData.password || !formData.captcha_code) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/login", {
        ...formData,
        captcha_id: captcha.id,
      });
      localStorage.setItem("your_jwt_secret", response.data.token); // Store JWT
      alert(response.data.message);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
      // Refresh CAPTCHA on failure
      const captchaResponse = await axios.get("http://localhost:3000/captcha");
      setCaptcha({
        id: captchaResponse.data.captcha_id,
        image: captchaResponse.data.captcha,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login Now!</h1>
          <p className="py-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <fieldset className="fieldset">
                {error && <p className="text-red-500 text-center">{error}</p>}
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input input-bordered"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input input-bordered"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
                <label className="label">CAPTCHA</label>
                {captcha.image && (
                  <img
                    src={captcha.image}
                    alt="CAPTCHA"
                    className="mb-2"
                    style={{ maxWidth: "100%" }}
                  />
                )}
                <input
                  type="text"
                  className="input input-bordered"
                  name="captcha_code"
                  value={formData.captcha_code}
                  onChange={handleChange}
                  placeholder="Enter CAPTCHA code"
                />
                <div>
                  <Link to="/forgot-password" className="link link-hover">
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  className="btn btn-neutral mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
                <p>
                  Don't have an account?{" "}
                  <Link to="/signup" className="link link-hover">
                    Signup
                  </Link>
                </p>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
