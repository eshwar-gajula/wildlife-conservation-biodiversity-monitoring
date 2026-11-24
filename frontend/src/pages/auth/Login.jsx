import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await authService.login(formData);

      login(data);
      navigate("/dashboard");

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link className="brand auth-brand" to="/register"><span className="brand-mark">W</span><span>WildTrace</span></Link>
        <p className="eyebrow">Conservation operations</p>
        <h1>Welcome back</h1>
        <p className="lede">Sign in to your biodiversity monitoring workspace.</p>

        {error && <div className="notice error">{error}</div>}

              <form onSubmit={handleSubmit}>

                <Field label="Email">
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Field>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

              </form>

              <p className="auth-switch">
                Don&apos;t have an account?{" "}
                <Link to="/register">
                  Register
                </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export default Login;