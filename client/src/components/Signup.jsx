import { Link, Links, Navigate } from "react-router-dom";

const Signup = () => {
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
            <fieldset className="fieldset">
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="Email" />
              <label className="label">Username</label>
              <input
                type="text"
                className="input"
                name=""
                value=""
                placeholder="Username"
              />
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Password" />
              <button className="btn btn-neutral mt-4">Signup</button>
              <p>
                Already have an account?{" "}
                <a href="" className="link link-hover">
                  <Link to="/">Login</Link>
                </a>
              </p>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
