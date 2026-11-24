function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <div className="container mt-5">

      <h1>Dashboard</h1>

      <div className="card mt-4">
        <div className="card-body">

          <h4>
            Welcome, {user?.name}
          </h4>

          <p>
            Role: {user?.role}
          </p>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;
