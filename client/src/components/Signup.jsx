import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [validation, setValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const navigate = useNavigate();
  const minLength = 8;

  const validatePassword = (value) => {
    const checks = {
      length: value.length >= minLength,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };
    setValidation(checks);
    setFormData({ ...formData, password: value });
  };

  const isValid = Object.values(validation).every((check) => check);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      validatePassword(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.username || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (!isValid) {
      setError("Password does not meet requirements");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/register",
        formData,
      );
      alert(response.data.message);
      navigate("/"); // Redirect to login on success
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Signup Now</h1>
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
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input input-bordered"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
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
                <ul className="validation-list mt-2">
                  <li className={validation.length ? "valid" : "invalid"}>
                    At least {minLength} characters
                  </li>
                  <li className={validation.uppercase ? "valid" : "invalid"}>
                    At least one uppercase letter
                  </li>
                  <li className={validation.lowercase ? "valid" : "invalid"}>
                    At least one lowercase letter
                  </li>
                  <li className={validation.number ? "valid" : "invalid"}>
                    At least one number
                  </li>
                  <li className={validation.special ? "valid" : "invalid"}>
                    At least one special character
                  </li>
                </ul>
                <button
                  type="submit"
                  className="btn btn-neutral mt-4"
                  disabled={!isValid}
                >
                  Signup
                </button>
                <p className="mt-2">
                  Already have an account?{" "}
                  <Link to="/" className="link link-hover">
                    Login
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

export default Signup;
