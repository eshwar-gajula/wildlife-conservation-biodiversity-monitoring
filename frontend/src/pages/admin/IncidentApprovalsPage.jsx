import { useEffect, useState } from "react";
import api from "../../services/api";
import Shell from "../../components/Shell";
function IncidentApprovalsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState({ text: "", error: false });
  const loadIncidents = async () => {
    try {
      const response = await api.get("/incidents/pending");
      setIncidents(response.data.incidents || []);
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not load public reports.", error: true });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadIncidents(); }, []);
  const review = async (incident, status) => {
    setBusyId(incident._id);
    setMessage({ text: "", error: false });
    try {
      await api.patch(`/incidents/${incident._id}/review`, { status });
      setMessage({ text: `Incident ${status} successfully.`, error: false });
      await loadIncidents();
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not review this report.", error: true });
    } finally {
      setBusyId(null);
    }
  };
  return <Shell active="incident-approvals"><header className="topbar"><div><p className="eyebrow">Administration / public reports</p><h1>Incident approvals</h1><p className="lede">Review conservation incidents submitted by public users and field officers.</p></div></header>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}<section className="section-block approval-section"><div className="section-heading"><div><h2>Pending incidents</h2><p className="muted">{incidents.length} report{incidents.length === 1 ? "" : "s"} waiting for review</p></div></div>{loading ? <div className="loading-state">Loading public reports...</div> : incidents.length ? <div className="approval-list">{incidents.map((incident) => <article className="approval-card" key={incident._id}><div className="approval-heading"><div><span className="resource-icon">IR</span><div className="approval-title"><h3>{incident.title}</h3><p>{incident.reportedBy?.name || "Unknown reporter"}</p></div></div><span className="status status-pending">pending</span></div><div className="approval-details"><span><b>Type</b>{incident.incidentType}</span><span><b>Severity</b>{incident.severity}</span><span><b>Location</b>{incident.location}</span><span><b>Reported by</b>{incident.reporterRole?.replace("_", " ") || "Unknown"}</span><span><b>Coordinates</b>{incident.coordinates?.coordinates?.length === 2 ? `${incident.coordinates.coordinates[1].toFixed(5)}, ${incident.coordinates.coordinates[0].toFixed(5)}` : "Not available"}</span></div><p className="approval-description">{incident.description}</p><div className="approval-actions"><button className="button button-primary" disabled={busyId === incident._id} onClick={() => review(incident, "confirmed")}>Approve incident</button><button className="button button-reject" disabled={busyId === incident._id} onClick={() => review(incident, "rejected")}>Reject incident</button></div></article>)}</div> : <div className="empty-state"><strong>All caught up.</strong><p>There are no pending public reports.</p></div>}</section></Shell>;
}

export default IncidentApprovalsPage;
