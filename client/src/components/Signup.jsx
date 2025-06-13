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

  // Initialize the validation state
  const [validation, setValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const navigate = useNavigate();
  const minLength = 8;

  // Validation function for validating the password
  const validatePassword = (value) => {
    const checks = {
      length: value.length >= minLength,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };
    setValidation(checks);
    // Pass the validated password to the form data state
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
              <fieldset>
                {error && (
                  <div className="alert alert-error mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                  />
                  <ul className="mt-2 text-sm">
                    <li
                      className={`flex items-center gap-2 ${validation.length ? "text-success" : "text-error"}`}
                    >
                      {validation.length ? "✔" : "✘"} At least {minLength}{" "}
                      characters
                    </li>
                    <li
                      className={`flex items-center gap-2 ${validation.uppercase ? "text-success" : "text-error"}`}
                    >
                      {validation.uppercase ? "✔" : "✘"} At least one uppercase
                      letter
                    </li>
                    <li
                      className={`flex items-center gap-2 ${validation.lowercase ? "text-success" : "text-error"}`}
                    >
                      {validation.lowercase ? "✔" : "✘"} At least one lowercase
                      letter
                    </li>
                    <li
                      className={`flex items-center gap-2 ${validation.number ? "text-success" : "text-error"}`}
                    >
                      {validation.number ? "✔" : "✘"} At least one number
                    </li>
                    <li
                      className={`flex items-center gap-2 ${validation.special ? "text-success" : "text-error"}`}
                    >
                      {validation.special ? "✔" : "✘"} At least one special
                      character
                    </li>
                  </ul>
                </div>
                <div className="form-control mt-6">
                  <button
                    type="submit"
                    className="btn btn-neutral"
                    disabled={!isValid}
                  >
                    Signup
                  </button>
                </div>
                <p className="mt-4 text-center">
                  Already have an account?{" "}
                  <Link to="/" className="link link-primary">
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
