
import { useEffect, useState } from "react";
import api from "../../services/api";
import Shell from "../../components/Shell";
import ResearchLocationPicker from "../../components/ResearchLocationPicker";

const initialForm = {
  project: "", title: "", species: [], habitats: [],
  observationDate: new Date().toISOString().slice(0, 10), location: "",
  coordinates: null, methodology: "", observation: "", findings: "", recommendations: ""
};
function ResearchProjectPage(){
  const [projects, setProjects] = useState([]);
  const [species, setSpecies] = useState([]);
  const [habitats, setHabitats] = useState([]);
  const [research, setResearch] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState({ text: "", error: false });
  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = async () => {
    try {
      const responses = await Promise.all([
        api.get("/projects/my/researcher"), api.get("/species"),
        api.get("/habitats"), api.get("/research/my")
      ]);
      setProjects(responses[0].data.projects || []);
      setSpecies(responses[1].data.species || []);
      setHabitats(responses[2].data.habitats || []);
      setResearch(responses[3].data.research || []);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Could not load research workspace.", error: true });
    }
  };

  useEffect(() => { load(); }, []);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const updateMulti = (event) => setForm({ ...form, [event.target.name]: Array.from(event.target.selectedOptions, (option) => option.value) });
  const selectLocation = (selection) => {
    const coordinates = selection.coordinates || selection;
    setForm((currentForm) => ({ ...currentForm, coordinates, ...(selection.location ? { location: selection.location } : {}) }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", error: false });
    try {
      if (!form.coordinates?.length) throw new Error("Search for a location or select one on the map.");
      await api.post("/research", { ...form, status: "completed" });
      setForm(initialForm);
      setMessage({ text: "Research report submitted for admin review.", error: false });
      await load();
    } catch (error) {
      setMessage({ text: error.response?.data?.message || error.message || "Could not submit research report.", error: true });
    } finally { setSaving(false); }
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
    } catch (error) {
      setMessage({ text: "Could not download the PDF report.", error: true });
    } finally {
      setDownloadingId(null);
    }
  };

  return <Shell active="research">
    <header className="topbar"><div><p className="eyebrow">Research workspace</p><h1>Assigned research projects</h1><p className="lede">Search existing wildlife data, analyze sightings, and submit project-linked research reports.</p></div></header>
    {message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}
    <section className="section-block"><div className="section-heading"><div><h2>Assigned projects</h2><p className="muted">Projects and objectives from your administrator.</p></div><span className="count-pill">{projects.length}</span></div><div className="project-list">{projects.map((project) => <article className="project-row" key={project._id}><div><strong>{project.projectName}</strong><p>{project.location} · {project.objective}</p><small>{project.activities?.join(" · ") || "No activities listed"}</small></div><div className="progress-wrap"><span>{project.progress}%</span><div className="progress"><i style={{ width: `${project.progress}%` }} /></div></div><span className={`status status-${project.status}`}>{project.status}</span></article>)}{!projects.length && <p className="muted">No research projects have been assigned to you.</p>}</div></section>
    <section className="form-panel research-form"><div className="section-heading"><div><h2>Submit research report</h2><p className="muted">Search the research location below. The map fills its address and coordinates automatically.</p></div></div><form onSubmit={submit}><div className="form-grid">
      <label className="field wide"><span>Assigned project</span><select name="project" value={form.project} onChange={update} required><option value="">Select project</option>{projects.map((project) => <option key={project._id} value={project._id}>{project.projectName}</option>)}</select></label>
      <label className="field wide"><span>Report title</span><input name="title" value={form.title} onChange={update} placeholder="Tiger population analysis" required /></label>
      <label className="field"><span>Species</span><select name="species" multiple value={form.species} onChange={updateMulti} required>{species.map((item) => <option key={item._id} value={item._id}>{item.commonName}</option>)}</select></label>
      <label className="field"><span>Habitats</span><select name="habitats" multiple value={form.habitats} onChange={updateMulti}>{habitats.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
      <label className="field"><span>Observation date</span><input type="date" name="observationDate" value={form.observationDate} onChange={update} required /></label>
      <label className="field wide"><span>Research location</span><input name="location" value={form.location} onChange={update} required placeholder="Search or select a research site below" /><ResearchLocationPicker value={form.coordinates} onChange={selectLocation} /></label>
      <label className="field wide"><span>Methodology</span><textarea name="methodology" value={form.methodology} onChange={update} rows="3" /></label>
      <label className="field wide"><span>Population and habitat observations</span><textarea name="observation" value={form.observation} onChange={update} rows="4" required /></label>
      <label className="field"><span>Analysis and findings</span><textarea name="findings" value={form.findings} onChange={update} rows="4" /></label>
      <label className="field"><span>Recommendations</span><textarea name="recommendations" value={form.recommendations} onChange={update} rows="4" /></label>
    </div><button className="button button-primary" type="submit" disabled={saving || !projects.length}>{saving ? "Submitting..." : "Submit research report"}</button></form></section>
    <section className="section-block"><div className="section-heading"><div><h2>Submitted reports</h2><p className="muted">{research.length} report{research.length === 1 ? "" : "s"}</p></div></div><div className="resource-list">{research.map((item) => <article className="resource-item" key={item._id}><div className="resource-icon">RS</div><div><strong>{item.title}</strong><p>{item.project?.projectName || "Project link unavailable"} · {item.location}</p></div><span className={`status status-${item.status}`}>{item.status}</span><button className="text-button" disabled={downloadingId === item._id} onClick={() => downloadPdf(item)}>{downloadingId === item._id ? "Preparing..." : "Download PDF"}</button></article>)}{!research.length && <p className="muted research-empty">No research reports submitted yet.</p>}</div></section>
  </Shell>;
}

export default ResearchProjectPage;