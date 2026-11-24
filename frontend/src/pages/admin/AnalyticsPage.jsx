import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Shell from "../../components/Shell";
const conservationStatuses = [
  "Least Concern",
  "Near Threatened",
  "Vulnerable",
  "Endangered",
  "Critically Endangered",
  "Extinct in the Wild",
  "Extinct",
];
const incidentStatuses = [
  "pending",
  "confirmed",
  "in_progress",
  "resolved",
  "rejected",
  "closed",
];

const colors = [
  "#176b4f",
  "#2d8b6a",
  "#d59638",
  "#b24b45",
  "#6877a7",
  "#8a9b91",
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getProjectProgress = (project, research) => {
  if (String(project.status || "").toLowerCase() === "completed") {
    return 100;
  }

  const assignedResearchers = project.assignedResearchers || [];
  const approvedResearchers = new Set(
    research
      .filter((report) => {
        const reportProjectId = report.project?._id || report.project;
        return (
          report.status === "approved" &&
          String(reportProjectId) === String(project._id)
        );
      })
      .map((report) => String(report.researcher?._id || report.researcher))
  );
  const allResearchersCompleted =
    assignedResearchers.length > 0 &&
    assignedResearchers.every((researcher) =>
      approvedResearchers.has(String(researcher?._id || researcher))
    );

  if (allResearchersCompleted) {
    return 100;
  }

  return Math.min(Math.max(Number(project.progress || 0), 0), 100);
};

function AnalyticsPage() {
  const [data, setData] = useState({
    species: [],
    habitats: [],
    projects: [],
    sightings: [],
    incidents: [],
    research: [],
    researchers: [],
    fieldOfficers: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const responses = await Promise.allSettled([
        api.get("/species"),
        api.get("/habitats"),
        api.get("/projects"),
        api.get("/sightings"),
        api.get("/incidents"),
        api.get("/research"),
        api.get("/users/researchers"),
        api.get("/users/field-officers"),
      ]);

      const getArray = (response, possibleKeys = []) => {
        if (response.status !== "fulfilled") {
          return [];
        }

        const result = response.value?.data;

        // Direct array response
        if (Array.isArray(result)) {
          return result;
        }

        // Search common response keys
        for (const key of possibleKeys) {
          if (Array.isArray(result?.[key])) {
            return result[key];
          }
        }

        // Some APIs use data.data
        if (Array.isArray(result?.data)) {
          return result.data;
        }

        return [];
      };

      const species = getArray(responses[0], [
        "species",
        "data",
        "results",
      ]);

      const habitats = getArray(responses[1], [
        "habitats",
        "data",
        "results",
      ]);

      const projects = getArray(responses[2], [
        "projects",
        "data",
        "results",
      ]);

      const sightings = getArray(responses[3], [
        "sightings",
        "data",
        "results",
      ]);

      const incidents = getArray(responses[4], [
        "incidents",
        "data",
        "results",
      ]);

      const research = getArray(responses[5], [
        "research",
        "data",
        "results",
      ]);

      const researchers = getArray(responses[6], [
        "users",
        "researchers",
        "data",
        "results",
      ]);

      const fieldOfficers = getArray(responses[7], [
        "users",
        "fieldOfficers",
        "data",
        "results",
      ]);

      setData({
        species,
        habitats,
        projects,
        sightings,
        incidents,
        research,
        researchers,
        fieldOfficers,
      });

      const failedRequests = responses.filter(
        (response) => response.status === "rejected"
      );

      if (failedRequests.length > 0) {
        setError(
          `${failedRequests.length} analytics data source${
            failedRequests.length > 1 ? "s" : ""
          } could not be loaded.`
        );
      }
    } catch (err) {
      console.error("Analytics loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load conservation analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  /*
   * -----------------------------
   * ANALYTICS CALCULATIONS
   * -----------------------------
   */

  const analytics = useMemo(() => {
    // Generic grouping function
    const groupBy = (items, getLabel) => {
      const result = {};

      items.forEach((item) => {
        let label = getLabel(item);

        if (!label || label === "undefined" || label === "null") {
          label = "Unknown";
        }

        result[label] = (result[label] || 0) + 1;
      });

      return Object.entries(result)
        .map(([label, value]) => ({
          label,
          value,
        }))
        .sort((a, b) => b.value - a.value);
    };

    /*
     * SPECIES CONSERVATION STATUS
     */

    const speciesStatus = conservationStatuses
      .map((status) => ({
        label: status,
        value: data.species.filter(
          (species) => species.conservationStatus === status
        ).length,
      }))
      .filter((item) => item.value > 0);

    /*
     * SIGHTINGS BY SPECIES
     */

    const sightingsBySpecies = groupBy(
      data.sightings,
      (sighting) => {
        if (sighting.species?.commonName) {
          return sighting.species.commonName;
        }

        if (sighting.species?.name) {
          return sighting.species.name;
        }

        if (sighting.speciesName) {
          return sighting.speciesName;
        }

        return "Unknown species";
      }
    ).slice(0, 8);

    /*
     * HABITATS BY TYPE
     */

    const habitatsByType = groupBy(
      data.habitats,
      (habitat) =>
        habitat.habitatType ||
        habitat.type ||
        "Other"
    );

    /*
     * INCIDENT TYPES
     */

    const incidentsByType = groupBy(
      data.incidents,
      (incident) => {
        const type =
          incident.incidentType ||
          incident.type ||
          "Other";

        return String(type).replaceAll("_", " ");
      }
    );

    /*
     * INCIDENT STATUS
     */

    const incidentsByStatus = incidentStatuses
      .map((status) => ({
        label: status.replaceAll("_", " "),
        value: data.incidents.filter(
          (incident) => incident.status === status
        ).length,
      }))
      .filter((item) => item.value > 0);

    /*
     * SIGHTING TREND
     *
     * Last 6 months
     */

    const now = new Date();

    const sightingTrend = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - 5 + index,
          1
        );

        const count = data.sightings.filter((sighting) => {
          const sightingDate = new Date(
            sighting.sightingDate ||
              sighting.date ||
              sighting.createdAt
          );

          if (Number.isNaN(sightingDate.getTime())) {
            return false;
          }

          return (
            sightingDate.getFullYear() === date.getFullYear() &&
            sightingDate.getMonth() === date.getMonth()
          );
        }).length;

        return {
          label: months[date.getMonth()],
          value: count,
        };
      }
    );

    /*
     * SIGHTINGS BY LOCATION
     */

    const sightingsByLocation = groupBy(
      data.sightings,
      (sighting) => {
        if (typeof sighting.location === "string") {
          return sighting.location;
        }

        if (sighting.location?.name) {
          return sighting.location.name;
        }

        if (sighting.location?.address) {
          return sighting.location.address;
        }
        if (
          sighting.latitude &&
          sighting.longitude
        ) {
          return `${Number(sighting.latitude).toFixed(
            2
          )}, ${Number(sighting.longitude).toFixed(2)}`;
        }

        return "Unknown location";
      }
    ).slice(0, 8);

    /*
     * PROJECT STATUS
     */

    const projectsByStatus = groupBy(
      data.projects,
      (project) =>
        project.status || "planned"
    );

    /*
     * ENDANGERED SPECIES
     */

    const endangeredSpecies = data.species.filter(
      (species) =>
        [
          "Endangered",
          "Critically Endangered",
        ].includes(species.conservationStatus)
    ).length;

    /*
     * ACTIVE PROJECTS
     */

    const activeProjects = data.projects.filter((project) =>
      ["planned", "active"].includes(
        String(project.status || "").toLowerCase()
      )
    ).length;

    /*
     * PENDING SIGHTINGS
     */

    const pendingSightings = data.sightings.filter(
      (sighting) =>
        String(
          sighting.verificationStatus ||
            sighting.status ||
            ""
        ).toLowerCase() === "pending"
    ).length;

    /*
     * PENDING INCIDENTS
     */

    const pendingIncidents = data.incidents.filter(
      (incident) =>
        String(incident.status || "").toLowerCase() ===
        "pending"
    ).length;

    /*
     * TOTAL PROJECT PROGRESS
     */
    const projectProgress =
      data.projects.length > 0
        ? Math.round(
            data.projects.reduce(
              (total, project) =>
                total +
                getProjectProgress(project, data.research),
              0
            ) / data.projects.length
          )
        : 0;

    return {
      speciesStatus,
      sightingsBySpecies,
      habitatsByType,
      incidentsByType,
      incidentsByStatus,
      sightingTrend,
      sightingsByLocation,
      projectsByStatus,
      endangeredSpecies,
      activeProjects,
      pendingSightings,
      pendingIncidents,
      projectProgress,
    };
  }, [data]);

  /*
   * -----------------------------
   * LOADING
   * -----------------------------
   */

  if (loading) {
    return (
      <Shell active="analytics">
        <div className="loading-state">
          Loading conservation analytics...
        </div>
      </Shell>
    );
  }

  /*
   * -----------------------------
   * PAGE
   * -----------------------------
   */

  return (
    <Shell active="analytics">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            Administration / system intelligence
          </p>

          <h1>Conservation Analytics</h1>

          <p className="lede">
            A live overview of wildlife species,
            habitats, sightings, incidents, research
            activity, and conservation projects.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={loadAnalytics}
        >
          Refresh Analytics
        </button>
      </header>

      {error && (
        <div className="notice error">
          {error}
        </div>
      )}

      {/* =========================
          SUMMARY CARDS
      ========================== */}

      <section className="analytics-summary">

        <StatCard
          label="Total species"
          value={data.species.length}
          tone="green"
        />

        <StatCard
          label="Total habitats"
          value={data.habitats.length}
          tone="green"
        />

        <StatCard
          label="Total sightings"
          value={data.sightings.length}
          tone="green"
        />

        <StatCard
          label="Total incidents"
          value={data.incidents.length}
          tone="red"
        />

        <StatCard
          label="Endangered species"
          value={analytics.endangeredSpecies}
          tone="amber"
        />

        <StatCard
          label="Active projects"
          value={analytics.activeProjects}
          tone="green"
        />

        <StatCard
          label="Researchers"
          value={data.researchers.length}
          tone="blue"
        />

        <StatCard
          label="Field officers"
          value={data.fieldOfficers.length}
          tone="blue"
        />

        <StatCard
          label="Pending sightings"
          value={analytics.pendingSightings}
          tone="amber"
        />

        <StatCard
          label="Pending incidents"
          value={analytics.pendingIncidents}
          tone="red"
        />

      </section>

      {/* =========================
          CHARTS
      ========================== */}

      <div className="analytics-grid">

        <Chart
          title="Species by conservation status"
          subtitle="Current wildlife species register"
        >
          <Bars
            items={analytics.speciesStatus}
            color="forest"
          />
        </Chart>

        <Chart
          title="Wildlife sighting trend"
          subtitle="Sightings recorded during the last six months"
        >
          <Trend items={analytics.sightingTrend} />
        </Chart>

        <Chart
          title="Sightings by species"
          subtitle="Most frequently reported wildlife"
        >
          <Bars
            items={analytics.sightingsBySpecies}
            color="blue"
          />
        </Chart>

        <Chart
          title="Habitat analytics"
          subtitle="Habitats grouped by habitat type"
        >
          <Bars
            items={analytics.habitatsByType}
            color="mint"
          />
        </Chart>

        <Chart
          title="Incident and threat analytics"
          subtitle="Reported wildlife threat types"
        >
          <Bars
            items={analytics.incidentsByType}
            color="red"
          />
        </Chart>

        <Chart
          title="Incident status"
          subtitle="Current incident workflow"
        >
          <Donut
            items={analytics.incidentsByStatus}
          />
        </Chart>

        <Chart
          title="Sighting locations"
          subtitle="Locations with the highest number of sightings"
        >
          <Bars
            items={analytics.sightingsByLocation}
            color="amber"
          />
        </Chart>

        <Chart
          title="Conservation project status"
          subtitle="Projects grouped by current status"
        >
          <Bars
            items={analytics.projectsByStatus}
            color="forest"
          />
        </Chart>

      </div>

      {/* =========================
          PROJECT PROGRESS
      ========================== */}

      <section className="analytics-wide">

        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Coordinated conservation work
            </p>

            <h2>
              Conservation Project Progress
            </h2>

            <p className="muted">
              Average progress across all conservation
              projects:{" "}
              <strong>
                {analytics.projectProgress}%
              </strong>
            </p>
          </div>
        </div>

        <div className="analytics-projects">

          {data.projects.map((project) => {
            const progress = getProjectProgress(project, data.research);
            const isCompleted = progress === 100;

            return (
              <div
                className="analytics-project"
                key={project._id}
              >

                <div>
                  <strong>
                    {project.projectName ||
                      "Unnamed project"}
                  </strong>

                  <small>
                    {isCompleted ? "completed" : project.status || "planned"}
                    {" · "}
                    {project.assignedResearchers
                      ?.length || 0}{" "}
                    researchers
                    {" · "}
                    {project.assignedFieldOfficers
                      ?.length || 0}{" "}
                    field officers
                  </small>
                </div>

                <b className={isCompleted ? "completed-progress" : ""}>
                  {progress}%
                </b>

                <div className="progress">
                  <i
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

              </div>
            );
          })}

          {!data.projects.length && (
            <p className="muted">
              No conservation projects created yet.
            </p>
          )}

        </div>

      </section>
    </Shell>
  );
}

/*
================================
STAT CARD
================================
*/

function StatCard({
  label,
  value,
  tone = "green",
}) {
  return (
    <article
      className={`stat-card ${tone}`}
    >
      <span>{label}</span>

      <strong>{value}</strong>
    </article>
  );
}

/*
================================
CHART CONTAINER
================================
*/

function Chart({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="analytics-card">

      <div className="section-heading">

        <div>
          <h2>{title}</h2>

          <p className="muted">
            {subtitle}
          </p>
        </div>

      </div>

      {children}

    </section>
  );
}

/*
================================
BAR CHART
================================
*/

function Bars({
  items,
  color = "forest",
}) {
  if (!items || !items.length) {
    return (
      <p className="muted">
        No data recorded yet.
      </p>
    );
  }

  const maximum = Math.max(
    ...items.map((item) =>
      Number(item.value || 0)
    ),
    1
  );

  return (
    <div className="bar-chart">

      {items.map((item) => {

        const percentage =
          (Number(item.value || 0) /
            maximum) *
          100;

        return (
          <div
            className="bar-row"
            key={item.label}
          >

            <span title={item.label}>
              {item.label}
            </span>

            <div className="bar-track">

              <i
                className={`bar-${color}`}
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

            <b>{item.value}</b>

          </div>
        );
      })}

    </div>
  );
}

/*
================================
TREND
================================
*/

function Trend({ items }) {
  if (!items || !items.length) {
    return (
      <p className="muted">
        No sighting trend data available.
      </p>
    );
  }

  const maximum = Math.max(
    ...items.map((item) =>
      Number(item.value || 0)
    ),
    1
  );

  return (
    <div className="trend-chart">

      <div className="trend-bars">

        {items.map((item) => {

          const height = item.value
            ? Math.max(
                (item.value / maximum) * 100,
                8
              )
            : 2;

          return (
            <div
              className="trend-column"
              key={item.label}
            >

              <span
                style={{
                  height: `${height}%`,
                }}
              />

              <b>{item.value}</b>

              <small>
                {item.label}
              </small>

            </div>
          );
        })}

      </div>

    </div>
  );
}

/*
================================
DONUT
================================
*/

function Donut({ items }) {
  if (!items || !items.length) {
    return (
      <p className="muted">
        No incidents recorded yet.
      </p>
    );
  }

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.value || 0),
    0
  );

  if (!total) {
    return (
      <p className="muted">
        No incidents recorded yet.
      </p>
    );
  }

  let offset = 0;

  const gradient = items
    .map((item, index) => {

      const start =
        (offset / total) * 100;

      offset += Number(item.value || 0);

      const end =
        (offset / total) * 100;

      return `${
        colors[index % colors.length]
      } ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="donut-layout">

      <div
        className="donut"
        style={{
          background:
            `conic-gradient(${gradient})`,
        }}
      >

        <span>
          {total}

          <small>
            incidents
          </small>
        </span>

      </div>

      <div className="donut-legend">

        {items.map((item, index) => (
          <div
            key={item.label}
          >

            <i
              style={{
                background:
                  colors[
                    index % colors.length
                  ],
              }}
            />

            <span>
              {item.label}
            </span>

            <b>
              {item.value}
            </b>

          </div>
        ))}

      </div>

    </div>
  );
}
export default AnalyticsPage;
