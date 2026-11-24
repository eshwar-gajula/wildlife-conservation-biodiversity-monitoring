import { useEffect, useState } from "react";
import api from "../../services/api";
import Shell from "../../components/Shell";
import ResearchLocationPicker from "../../components/ResearchLocationPicker";

const emptyForm = {
  project: "",
  species: "",
  sightingDate: new Date().toISOString().slice(0, 10),
  location: "",
  coordinates: null,
  longitude: "",
  latitude: "",
  animalCount: 1,
  condition: "Unknown",
  behavior: "",
  description: "",
  incidentType: "other",
  title: "",
  severity: "medium",
  photos: []
};

function FieldWorkPage() {
  const [projects, setProjects] = useState([]);
  const [species, setSpecies] = useState([]);
  const [kind, setKind] = useState("sighting");
  const [form, setForm] = useState(emptyForm);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [message, setMessage] = useState({ text: "", error: false });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [projectResponse, speciesResponse] = await Promise.all([
        api.get("/projects/my/field-officer"),
        api.get("/species")
      ]);
      setProjects(projectResponse.data.projects || []);
      setSpecies(speciesResponse.data.species || []);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Could not load field projects.", error: true });
    }
  };

  useEffect(() => { loadData(); }, []);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const selectLocation = (selection) => {
    const coordinates = selection.coordinates || selection;
    setForm((currentForm) => ({
      ...currentForm,
      coordinates,
      longitude: String(coordinates[0]),
      latitude: String(coordinates[1]),
      ...(selection.location ? { location: selection.location } : {})
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", error: false });
    try {
      const coordinates = form.coordinates || [Number(form.longitude), Number(form.latitude)];
      if (!form.project) throw new Error("Select an assigned project first.");
      if (coordinates.some((value) => Number.isNaN(value))) throw new Error("Enter valid longitude and latitude.");

      const photos = [];
      for (const file of photoFiles) {
        const uploadData = new FormData();
        uploadData.append("image", file);
        const response = await api.post("/sightings/upload-photo", uploadData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        photos.push(response.data.url);
      }

      const payload = kind === "sighting"
        ? { project: form.project, species: form.species, sightingDate: form.sightingDate, location: form.location, coordinates, animalCount: Number(form.animalCount), condition: form.condition, behavior: form.behavior, description: form.description, photos }
        : { project: form.project, incidentType: form.incidentType, title: form.title, description: form.description, location: form.location, coordinates, severity: form.severity, photos };

      await api.post(kind === "sighting" ? "/sightings" : "/incidents", payload);
      setMessage({ text: `${kind === "sighting" ? "Wildlife sighting" : "Threat incident"} submitted for admin review.`, error: false });
      setForm(emptyForm);
      setPhotoFiles([]);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || error.message || "Could not submit field report.", error: true });
    } finally {
      setSaving(false);
    }
  };

  return <Shell active="field-work">
    <header className="topbar"><div><p className="eyebrow">Field operations</p><h1>Assigned projects</h1><p className="lede">Record sightings, upload field photographs, and report threats against the projects assigned to you.</p></div></header>
    {message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}
    <section className="content-grid">
      <section className="resource-panel"><div className="section-heading"><div><h2>My project brief</h2><p className="muted">Work only on projects assigned by the administrator.</p></div><span className="count-pill">{projects.length}</span></div><div className="resource-list">{projects.map((project) => <article className="resource-item" key={project._id}><div className="resource-icon">PR</div><div><strong>{project.projectName}</strong><p>{project.location} · {project.objective}</p><small>{project.activities?.length || 0} activities · {project.progress}% complete</small></div><span className={`status status-${project.status}`}>{project.status}</span></article>)}{!projects.length && <p className="muted">No projects have been assigned yet.</p>}</div></section>
      <section className="form-panel"><div className="section-heading"><div><h2>New field report</h2><p className="muted">Every report is linked to the selected project.</p></div></div><div className="segmented"><button type="button" className={kind === "sighting" ? "selected" : ""} onClick={() => setKind("sighting")}>Wildlife sighting</button><button type="button" className={kind === "incident" ? "selected" : ""} onClick={() => setKind("incident")}>Threat / incident</button></div><form onSubmit={submit}><div className="form-grid"><label className="field wide"><span>Assigned project</span><select name="project" value={form.project} onChange={update} required><option value="">Select project</option>{projects.map((project) => <option key={project._id} value={project._id}>{project.projectName}</option>)}</select></label>{kind === "sighting" ? <><label className="field"><span>Species</span><select name="species" value={form.species} onChange={update} required><option value="">Select species</option>{species.map((item) => <option key={item._id} value={item._id}>{item.commonName}</option>)}</select></label><label className="field"><span>Observation date</span><input type="date" name="sightingDate" value={form.sightingDate} onChange={update} required /></label><label className="field"><span>Animal count</span><input type="number" min="1" name="animalCount" value={form.animalCount} onChange={update} required /></label><label className="field"><span>Condition</span><select name="condition" value={form.condition} onChange={update}><option>Healthy</option><option>Injured</option><option>Sick</option><option>Dead</option><option>Unknown</option></select></label></> : <><label className="field"><span>Incident type</span><select name="incidentType" value={form.incidentType} onChange={update}>{["poaching", "forest_fire", "animal_injury", "illegal_hunting", "animal_death", "habitat_destruction", "human_wildlife_conflict", "other"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Severity</span><select name="severity" value={form.severity} onChange={update}><option>low</option><option>medium</option><option>high</option><option>critical</option></select></label><label className="field wide"><span>Title</span><input name="title" value={form.title} onChange={update} required /></label></>}<label className="field wide"><span>Location</span><input name="location" value={form.location} onChange={update} required placeholder="Search or select a field site below" /><ResearchLocationPicker value={form.coordinates} onChange={selectLocation} /></label><label className="field"><span>Longitude</span><input type="number" step="any" name="longitude" value={form.longitude} onChange={update} required readOnly /></label><label className="field"><span>Latitude</span><input type="number" step="any" name="latitude" value={form.latitude} onChange={update} required readOnly /></label><label className="field wide"><span>{kind === "sighting" ? "Field notes" : "Incident details"}</span><textarea name="description" value={form.description} onChange={update} rows="4" required /></label><label className="field wide"><span>Photographs</span><input type="file" accept="image/*" multiple onChange={(event) => setPhotoFiles(Array.from(event.target.files || []))} /><small className="field-help">Images are uploaded with this report.</small></label></div><button className="button button-primary" type="submit" disabled={saving || !projects.length}>{saving ? "Submitting..." : "Submit field report"}</button></form></section>
    </section>
  </Shell>;
}

export default FieldWorkPage;
