// import { useEffect, useState } from "react";
// import api from "../../services/api";
// import Shell from "../../components/Shell";

// function ResearchApprovalsPage() {
//   const [research, setResearch] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [busyId, setBusyId] = useState(null);
//   const [message, setMessage] = useState({ text: "", error: false });

//   const loadResearch = async () => {
//     try {
//       const response = await api.get("/research");
//       setResearch((response.data.research || []).filter((item) => ["pending", "completed"].includes(item.status)));
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not load research submissions.", error: true });
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { loadResearch(); }, []);

//   const review = async (item, status) => {
//     setBusyId(item._id);
//     setMessage({ text: "", error: false });
//     try {
//       await api.patch(`/research/${item._id}/review`, { status });
//       setMessage({ text: `Research observation ${status} successfully.`, error: false });
//       await loadResearch();
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not review this observation.", error: true });
//     } finally { setBusyId(null); }
//   };

//   return <Shell active="research-approvals">
//     <header className="topbar"><div><p className="eyebrow">Administration / research review</p><h1>Research approvals</h1><p className="lede">Review research observations submitted by researchers.</p></div></header>
//     {message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}
//     <section className="section-block approval-section"><div className="section-heading"><div><h2>Pending observations</h2><p className="muted">{research.length} submission{research.length === 1 ? "" : "s"} waiting for review</p></div></div>
//       {loading ? <div className="loading-state">Loading research submissions...</div> : research.length ? <div className="approval-list">{research.map((item) => <article className="approval-card" key={item._id}><div className="approval-heading"><div><span className="resource-icon">RS</span><div className="approval-title"><h3>{item.title}</h3><p>{item.researcher?.name || "Unknown researcher"}</p></div></div><span className="status status-pending">awaiting review</span></div><div className="approval-details"><span><b>Date</b>{new Date(item.observationDate).toLocaleDateString()}</span><span><b>Location</b>{item.location}</span><span><b>Coordinates</b>{item.coordinates?.length === 2 ? `${item.coordinates[1].toFixed(5)}, ${item.coordinates[0].toFixed(5)}` : "Not selected"}</span><span><b>Species</b>{item.species?.map((species) => species.commonName).join(", ") || "Not specified"}</span><span><b>Habitat</b>{item.habitats?.map((habitat) => habitat.name).join(", ") || "Not specified"}</span></div><p className="approval-description">{item.observation}</p><div className="approval-actions"><button className="button button-primary" disabled={busyId === item._id} onClick={() => review(item, "approved")}>Approve observation</button><button className="button button-reject" disabled={busyId === item._id} onClick={() => review(item, "rejected")}>Reject observation</button></div></article>)}</div> : <div className="empty-state"><strong>All caught up.</strong><p>There are no pending research observations.</p></div>}
//     </section>
//   </Shell>;
// }

// export default ResearchApprovalsPage;
import { useEffect, useState } from "react";
import api from "../../services/api";
import Shell from "../../components/Shell";
function ResearchApprovalsPage() {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [message, setMessage] = useState({ text: "", error: false });
  const loadResearch = async () => {
    try {
      const response = await api.get("/research");
      setResearch((response.data.research || []).filter((item) => ["pending", "completed", "approved"].includes(item.status)));
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not load research submissions.", error: true });
    } finally { setLoading(false); }
  };
  useEffect(() => { loadResearch(); }, []);
  const review = async (item, status) => {
    setBusyId(item._id);
    setMessage({ text: "", error: false });
    try {
      await api.patch(`/research/${item._id}/review`, { status });
      setMessage({ text: `Research observation ${status} successfully.`, error: false });
      await loadResearch();
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not review this observation.", error: true });
    } finally { setBusyId(null); }
  };

  const downloadPdf = async (item) => {
    setDownloadingId(item._id);
    setMessage({ text: "", error: false });
    try {
      const response = await api.get(`/research/${item._id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${item.title || "research-report"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setMessage({ text: "Could not download the PDF report.", error: true });
    } finally {
      setDownloadingId(null);
    }
  };
  const pendingResearch = research.filter((item) => ["pending", "completed"].includes(item.status));
  const approvedResearch = research.filter((item) => item.status === "approved");
  const completedProjectCount = new Set(
    approvedResearch
      .filter((item) => item.project?.status === "completed")
      .map((item) => item.project._id)
  ).size;
  return <Shell active="research-approvals">
    <header className="topbar"><div><p className="eyebrow">Administration / research review</p><h1>Research approvals</h1><p className="lede">Review research observations submitted by researchers.</p></div></header>
    {message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}
    <section className="analytics-summary"><article className="stat-card green"><span>Approved reports</span><strong>{approvedResearch.length}</strong></article><article className="stat-card green"><span>Completed projects</span><strong>{completedProjectCount}</strong></article></section>
    <section className="section-block approval-section"><div className="section-heading"><div><h2>Pending observations</h2><p className="muted">{pendingResearch.length} submission{pendingResearch.length === 1 ? "" : "s"} waiting for review</p></div></div>
      {loading ? <div className="loading-state">Loading research submissions...</div> : pendingResearch.length ? <div className="approval-list">{pendingResearch.map((item) => <article className="approval-card" key={item._id}><div className="approval-heading"><div><span className="resource-icon">RS</span><div className="approval-title"><h3>{item.title}</h3><p>{item.researcher?.name || "Unknown researcher"}</p></div></div><span className="status status-pending">awaiting review</span></div><div className="approval-details"><span><b>Date</b>{new Date(item.observationDate).toLocaleDateString()}</span><span><b>Location</b>{item.location}</span><span><b>Coordinates</b>{item.coordinates?.length === 2 ? `${item.coordinates[1].toFixed(5)}, ${item.coordinates[0].toFixed(5)}` : "Not selected"}</span><span><b>Species</b>{item.species?.map((species) => species.commonName).join(", ") || "Not specified"}</span><span><b>Habitat</b>{item.habitats?.map((habitat) => habitat.name).join(", ") || "Not specified"}</span></div><p className="approval-description">{item.observation}</p><div className="approval-actions"><button className="button button-primary" disabled={busyId === item._id} onClick={() => review(item, "approved")}>Approve observation</button><button className="button button-reject" disabled={busyId === item._id} onClick={() => review(item, "rejected")}>Reject observation</button><button className="text-button" disabled={downloadingId === item._id} onClick={() => downloadPdf(item)}>{downloadingId === item._id ? "Preparing..." : "Download PDF"}</button></div></article>)}</div> : <div className="empty-state"><strong>All caught up.</strong><p>There are no pending research observations.</p></div>}
    </section>
    {!loading && approvedResearch.length > 0 && <section className="section-block approval-section"><div className="section-heading"><div><h2>Approved observations</h2><p className="muted">Approved reports and their linked project completion</p></div></div><div className="approval-list">{approvedResearch.map((item) => <article className="approval-card" key={item._id}><div className="approval-heading"><div><span className="resource-icon">RS</span><div className="approval-title"><h3>{item.title}</h3><p>{item.researcher?.name || "Unknown researcher"}</p></div></div><span className="status status-completed">approved</span></div><div className="approval-details"><span><b>Project</b>{item.project?.projectName || "No linked project"}</span><span><b>Project status</b>{item.project?.status || "Not available"}</span><span><b>Progress</b>{item.project ? `${item.project.progress || 0}%` : "Not available"}</span><span><b>Date</b>{new Date(item.observationDate).toLocaleDateString()}</span><span><b>Location</b>{item.location}</span></div><p className="approval-description">{item.observation}</p><div className="approval-actions"><button className="text-button" disabled={downloadingId === item._id} onClick={() => downloadPdf(item)}>{downloadingId === item._id ? "Preparing..." : "Download PDF"}</button></div></article>)}</div></section>}
  </Shell>;
}

export default ResearchApprovalsPage;
