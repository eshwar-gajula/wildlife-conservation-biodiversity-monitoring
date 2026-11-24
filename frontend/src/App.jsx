// import { cloneElement, useEffect, useState } from "react";
// import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
// import api from "./services/api";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import RoleRoute from "./routes/RoleRoute";
// import Login from "./pages/auth/Login";
// import ResearchApprovalsPage from "./pages/admin/ResearchApprovalsPage";
// import IncidentApprovalsPage from "./pages/admin/IncidentApprovalsPage";
// import WildlifeMap from "./pages/WildlifeMap";
// import ResearchLocationPicker from "./components/ResearchLocationPicker";
// import FieldWorkPage from "./pages/field/FieldWorkPage";
// import ResearchProjectPage from "./pages/research/ResearchProjectPage";
// import AnalyticsPage from "./pages/admin/AnalyticsPage";

// import "./App.css";

// const roleLabels = {
//   admin: "Administrator",
//   field_officer: "Field officer",
//   researcher: "Researcher",
//   public_user: "Community member",
// };

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />
//           <Route element={<ProtectedRoute />}>
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route element={<RoleRoute allowedRoles={["admin"]} />}>
//               <Route path="/field-officers" element={<FieldOfficersPage />} />
//               <Route path="/researchers" element={<ResearchersPage />} />
//               <Route path="/species-management" element={<SpeciesManagementPage />} />
//               <Route path="/habitat-management" element={<HabitatManagementPage />} />
//               <Route path="/project-management" element={<ProjectManagementPage />} />
//               <Route path="/analytics" element={<AnalyticsPage />} />
//               <Route path="/analytics" element={<AnalyticsPage />} />
//               <Route path="/sighting-approvals" element={<SightingApprovalsPage />} />
//               <Route path="/incident-approvals" element={<IncidentApprovalsPage />} />
//               <Route path="/research-approvals" element={<ResearchApprovalsPage />} />
//             </Route>
//             <Route element={<RoleRoute allowedRoles={["field_officer"]} />}>
//               <Route path="/field-work" element={<FieldWorkPage />} />
//             </Route>
//             <Route element={<RoleRoute allowedRoles={["field_officer", "public_user"]} />}>
//               <Route path="/report" element={<ReportPage />} />
//             </Route>
//             <Route element={<RoleRoute allowedRoles={["researcher"]} />}>
//               <Route path="/research" element={<ResearchProjectPage />} />
//               <Route path="/wildlife-map" element={<WildlifeMap />} />
//             </Route>
//           </Route>
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// function Shell({ children, active = "overview" }) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const signOut = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <div className="app-shell">
//       <aside className="sidebar">
//         <Link className="brand" to="/dashboard"><span className="brand-mark">W</span><span>WildTrace</span></Link>
//         <p className="eyebrow">Conservation operations</p>
//         <nav className="nav-list">
//           <Link className={active === "overview" ? "nav-link active" : "nav-link"} to="/dashboard">Overview</Link>
//           {user?.role === "admin" ? <><Link className={active === "species" ? "nav-link active" : "nav-link"} to="/species-management">Species</Link><Link className={active === "habitats" ? "nav-link active" : "nav-link"} to="/habitat-management">Habitats</Link><Link className={active === "projects" ? "nav-link active" : "nav-link"} to="/project-management">Projects</Link><Link className={active === "approvals" ? "nav-link active" : "nav-link"} to="/sighting-approvals">Sighting approvals</Link><Link className={active === "officers" ? "nav-link active" : "nav-link"} to="/field-officers">Field officers</Link><Link className={active === "researchers" ? "nav-link active" : "nav-link"} to="/researchers">Researchers</Link></> : user?.role === "field_officer" ? <><Link className={active === "field-work" ? "nav-link active" : "nav-link"} to="/field-work">Assigned projects</Link><Link className={active === "report" ? "nav-link active" : "nav-link"} to="/report">Report activity</Link></> : <Link className={active === "report" ? "nav-link active" : "nav-link"} to="/report">Report activity</Link>}
//           {user?.role === "researcher" && <><Link className={active === "research" ? "nav-link active" : "nav-link"} to="/research">Research log</Link><Link className={active === "map" ? "nav-link active" : "nav-link"} to="/wildlife-map">Wildlife map</Link></>}
//         </nav>
//         <div className="sidebar-footer">
//           <div className="user-chip"><span className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</span><span><strong>{user?.name}</strong><small>{roleLabels[user?.role]}</small></span></div>
//           <button className="button button-quiet" onClick={signOut}>Sign out</button>
//         </div>
//       </aside>
//       <main className="main-content">{children}</main>
//     </div>
//   );
// }

// function Dashboard() {
//   const { user } = useAuth();
//   const [data, setData] = useState({ species: [], habitats: [], projects: [], activity: [] });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function loadDashboard() {
//       try {
//         const requests = [api.get("/species"), api.get("/habitats"), api.get("/projects")];
//         if (user.role === "admin") requests.push(api.get("/sightings/pending"), api.get("/incidents/pending"));
//         else if (user.role === "researcher") requests.push(api.get("/research/my"));
//         else requests.push(api.get("/sightings/my"), api.get("/incidents/my"));
//         const responses = await Promise.all(requests);
//         const [species, habitats, projects, first, second] = responses;
//         const activity = user.role === "admin"
//           ? [{ label: "Pending sightings", value: first.data.count, tone: "amber" }, { label: "Pending incidents", value: second.data.count, tone: "red" }]
//           : user.role === "researcher"
//             ? [{ label: "Your observations", value: first.data.count, tone: "green" }]
//             : [{ label: "Your sightings", value: first.data.count, tone: "green" }, { label: "Your incidents", value: second.data.count, tone: "red" }];
//         setData({ species: species.data.species || [], habitats: habitats.data.habitats || [], projects: projects.data.projects || [], activity });
//       } catch (requestError) {
//         setError(requestError.response?.data?.message || "Could not load conservation data.");
//       } finally { setLoading(false); }
//     }
//     loadDashboard();
//   }, [user]);

//   return <Shell><header className="topbar"><div><p className="eyebrow">Field intelligence / {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</p><h1>Good morning, {user.name.split(" ")[0]}.</h1></div>{user.role === "admin" ? <Link className="button button-primary" to="/species-management">+ Add species</Link> : <Link className="button button-primary" to="/report">+ New report</Link>}</header>
//     {error && <div className="notice error">{error} Check that the backend is running at <strong>localhost:5000</strong>.</div>}
//     <section className="hero-panel"><div><p className="eyebrow">Live conservation picture</p><h2>Evidence turns into action.</h2><p>Track biodiversity, protect habitats, and keep every field report moving toward a decision.</p></div><div className="hero-stat"><strong>{data.species.length || "—"}</strong><span>active species</span></div></section>
//       <div className="stats-grid"><Stat label="Protected habitats" value={data.habitats.length} /><Stat label="Active projects" value={data.projects.filter((project) => project.status === "active").length} /><Stat label="Your access" value={roleLabels[user.role]} compact />{data.activity.map((item) => <Stat key={item.label} label={item.label} value={item.value} tone={item.tone} />)}</div>
//     {user.role === "admin" && <><Link className="review-banner" to="/sighting-approvals"><span><strong>Review field reports</strong><small>Approve or reject pending wildlife sightings</small></span><b>Open queue →</b></Link><Link className="review-banner" to="/incident-approvals"><span><strong>Review public reports</strong><small>Approve or reject pending conservation incidents</small></span><b>Open queue →</b></Link><Link className="review-banner" to="/research-approvals"><span><strong>Review research reports</strong><small>Approve or reject researcher observations</small></span><b>Open queue →</b></Link></>}
//     {loading ? <div className="loading-state">Loading the latest field data...</div> : <><section className="content-grid"><ResourceList title="Species register" items={data.species} type="species" empty="No active species have been added yet." /><ResourceList title="Habitat register" items={data.habitats} type="habitats" empty="No active habitats have been added yet." /></section><section className="section-block"><div className="section-heading"><div><p className="eyebrow">Coordinated work</p><h2>Conservation projects</h2></div><span className="muted">{data.projects.length} total</span></div><div className="project-list">{data.projects.slice(0, 4).map((project) => <article className="project-row" key={project._id}><div><strong>{project.projectName}</strong><p>{project.location} · {project.objective}</p></div><div className="progress-wrap"><span>{project.progress}%</span><div className="progress"><i style={{ width: `${project.progress}%` }} /></div></div><span className={`status status-${project.status}`}>{project.status}</span></article>)}{!data.projects.length && <p className="muted">No projects have been created yet.</p>}</div></section></>}
//   </Shell>;
// }

// function Stat({ label, value, tone = "green", compact = false }) { return <article className={`stat-card ${tone}`}><span>{label}</span><strong className={compact ? "stat-compact" : ""}>{value}</strong></article>; }

// function SightingApprovalsPage() {
//   const [sightings, setSightings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [busyId, setBusyId] = useState(null);
//   const [message, setMessage] = useState({ text: "", error: false });

//   const loadPendingSightings = async () => {
//     try {
//       const response = await api.get("/sightings/pending");
//       setSightings(response.data.sightings || []);
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not load pending sighting reports.", error: true });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadPendingSightings(); }, []);

//   const review = async (sighting, verificationStatus) => {
//     setBusyId(sighting._id);
//     setMessage({ text: "", error: false });
//     try {
//       await api.patch(`/sightings/${sighting._id}/verify`, { verificationStatus });
//       setMessage({ text: `Sighting ${verificationStatus} successfully.`, error: false });
//       await loadPendingSightings();
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not review this report.", error: true });
//     } finally {
//       setBusyId(null);
//     }
//   };

//   return <Shell active="approvals"><header className="topbar"><div><p className="eyebrow">Administration / field review</p><h1>Sighting approvals</h1><p className="lede">Review wildlife reports submitted by field officers and community members.</p></div></header><section className="section-block approval-section"><div className="section-heading"><div><h2>Pending reports</h2><p className="muted">{sightings.length} report{sightings.length === 1 ? "" : "s"} waiting for review</p></div></div>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}{loading ? <div className="loading-state">Loading pending reports...</div> : <div className="approval-list">{sightings.map((sighting) => <article className="approval-card" key={sighting._id}><div className="approval-heading"><div><span className="resource-icon">SP</span><div className="approval-title"><h3>{sighting.species?.commonName || "Unknown species"}</h3><p>{sighting.species?.scientificName || "Species details unavailable"}</p></div></div><span className="status status-pending">pending</span></div><div className="approval-details"><span><b>Reported by</b>{sighting.reportedBy?.name || "Unknown reporter"}</span><span><b>Date</b>{new Date(sighting.sightingDate).toLocaleDateString()}</span><span><b>Location</b>{sighting.location}</span><span><b>Animals</b>{sighting.animalCount}</span><span><b>Condition</b>{sighting.condition || "Unknown"}</span></div>{sighting.description && <p className="approval-description">{sighting.description}</p>}<div className="approval-actions"><button className="button button-primary" disabled={busyId === sighting._id} onClick={() => review(sighting, "verified")}>Approve report</button><button className="button button-reject" disabled={busyId === sighting._id} onClick={() => review(sighting, "rejected")}>Reject report</button></div></article>)}{!sightings.length && <div className="empty-state"><strong>All caught up.</strong><p>There are no pending sighting reports to review.</p></div>}</div>}</section></Shell>;
// }

// function SpeciesManagementPage() {
//   const emptyForm = { commonName: "", scientificName: "", family: "", conservationStatus: "Least Concern", population: "", diet: "", behavior: "", physicalDescription: "", habitat: "", distribution: "", threats: "", description: "", images: [] };
//   const [species, setSpecies] = useState([]);
//   const [form, setForm] = useState(emptyForm);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState({ text: "", error: false });
//   const [imageFile, setImageFile] = useState(null);

//   const loadSpecies = async () => {
//     try {
//       const response = await api.get("/species");
//       setSpecies(response.data.species || []);
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not load species.", error: true });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadSpecies(); }, []);

//   const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
//   const resetForm = () => { setForm(emptyForm); setEditingId(null); setImageFile(null); };
//   const editSpecies = (item) => { setEditingId(item._id); setImageFile(null); setForm({ ...item, images: item.images || [], population: item.population ?? "" }); setMessage({ text: "", error: false }); };

//   const submit = async (event) => {
//     event.preventDefault();
//     setSaving(true);
//     setMessage({ text: "", error: false });
//     try {
//       let images = form.images || [];
//       if (imageFile) {
//         const uploadData = new FormData();
//         uploadData.append("image", imageFile);
//         const uploadResponse = await api.post("/species/upload-image", uploadData, {
//           headers: { "Content-Type": "multipart/form-data" }
//         });
//         images = [...images, uploadResponse.data.url];
//       }
//       const body = { ...form, population: form.population === "" ? undefined : Number(form.population), images };
//       if (editingId) {
//         await api.put(`/species/${editingId}`, body);
//         setMessage({ text: "Species updated successfully.", error: false });
//       } else {
//         await api.post("/species", body);
//         setMessage({ text: "Species created successfully and is now available for reports.", error: false });
//       }
//       resetForm();
//       await loadSpecies();
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not save species.", error: true });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const deleteSpecies = async (item) => {
//     if (!window.confirm(`Delete ${item.commonName}? Existing reports may reference this species.`)) return;
//     try {
//       await api.delete(`/species/${item._id}`);
//       setMessage({ text: "Species deleted successfully.", error: false });
//       await loadSpecies();
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not delete species.", error: true });
//     }
//   };

//   return <Shell active="species"><header className="topbar"><div><p className="eyebrow">Administration / master data</p><h1>Species register</h1><p className="lede">Create the active species list used by field officers when submitting sightings.</p></div></header><div className="admin-layout species-layout"><section className="form-panel species-form"><div className="section-heading"><div><h2>{editingId ? "Update species" : "Add species"}</h2><p className="muted">Only active species appear in field report selections.</p></div></div><form onSubmit={submit}><div className="form-grid"><Field label="Common name"><input name="commonName" value={form.commonName} onChange={update} placeholder="Bengal Tiger" required /></Field><Field label="Scientific name"><input name="scientificName" value={form.scientificName} onChange={update} placeholder="Panthera tigris" required /></Field><Field label="Family"><input name="family" value={form.family} onChange={update} placeholder="Felidae" /></Field><Field label="Conservation status"><select name="conservationStatus" value={form.conservationStatus} onChange={update}>{["Least Concern", "Near Threatened", "Vulnerable", "Endangered", "Critically Endangered", "Extinct in the Wild", "Extinct"].map((status) => <option key={status}>{status}</option>)}</select></Field><Field label="Population"><input type="number" min="0" name="population" value={form.population} onChange={update} /></Field><Field label="Diet"><input name="diet" value={form.diet} onChange={update} placeholder="Carnivore" /></Field><Field label="Habitat"><input name="habitat" value={form.habitat} onChange={update} placeholder="Forest" /></Field><Field label="Distribution"><input name="distribution" value={form.distribution} onChange={update} /></Field><Field label="Behavior"><input name="behavior" value={form.behavior} onChange={update} /></Field><Field label="Threats"><input name="threats" value={form.threats} onChange={update} /></Field><Field label="Physical description" wide><textarea name="physicalDescription" value={form.physicalDescription} onChange={update} rows="2" /></Field><Field label="Description" wide><textarea name="description" value={form.description} onChange={update} rows="3" /></Field><Field label="Species photo" wide><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /><small className="field-help">Upload PNG, JPG, WEBP, or GIF up to 5 MB.</small>{form.images?.length > 0 && <small className="field-help">{form.images.length} photo already attached. Uploading another will add it.</small>}</Field></div><div className="form-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? (imageFile ? "Uploading..." : "Saving...") : editingId ? "Save changes" : "Create species"}</button>{editingId && <button className="button button-secondary" type="button" onClick={resetForm}>Cancel</button>}</div></form></section><section className="officer-list species-list"><div className="section-heading"><div><h2>Active species</h2><p className="muted">{species.length} available to field officers</p></div></div>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}{loading ? <div className="loading-state">Loading species...</div> : <div className="table-wrap"><table><thead><tr><th>Species</th><th>Status</th><th>Reference photo</th><th>Actions</th></tr></thead><tbody>{species.map((item) => <tr key={item._id}><td><strong>{item.commonName}</strong><small>{item.scientificName}</small></td><td><span className="status status-active">active</span></td><td>{item.images?.[0] ? <a className="image-link" href={item.images[0]} target="_blank" rel="noreferrer">View photo</a> : <small>No photo</small>}</td><td><div className="action-row"><button className="text-button" onClick={() => editSpecies(item)}>Edit</button><button className="text-button danger-text" onClick={() => deleteSpecies(item)}>Delete</button></div></td></tr>)}{!species.length && <tr><td colSpan="4" className="empty-cell">No active species yet. Add the first species above.</td></tr>}</tbody></table></div>}</section></div></Shell>;
// }

// function ProjectManagementPage() {
//   const emptyForm = { projectName: "", objective: "", description: "", startDate: "", endDate: "", budget: "", location: "", activities: "", assignedFieldOfficers: [], assignedResearchers: [] };
//   const [form, setForm] = useState(emptyForm);
//   const [fieldOfficers, setFieldOfficers] = useState([]);
//   const [researchers, setResearchers] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState({ text: "", error: false });

//   const loadTeam = async () => {
//     try {
//       const [fieldResponse, researcherResponse] = await Promise.all([
//         api.get("/users/field-officers"),
//         api.get("/users/researchers")
//       ]);
//       setFieldOfficers(fieldResponse.data.users || []);
//       setResearchers(researcherResponse.data.users || []);
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not load team members.", error: true });
//     }
//   };

//   useEffect(() => { loadTeam(); }, []);

//   const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
//   const updateMultiSelect = (event, field) => {
//     const selected = Array.from(event.target.selectedOptions, (option) => option.value);
//     setForm({ ...form, [field]: selected });
//   };

//   const submit = async (event) => {
//     event.preventDefault();
//     setSaving(true);
//     setMessage({ text: "", error: false });
//     try {
//       const payload = {
//         ...form,
//         budget: form.budget === "" ? 0 : Number(form.budget),
//         activities: form.activities
//           ? form.activities.split("\n").map((item) => item.trim()).filter(Boolean)
//           : [],
//         location: form.location || "General operational area",
//         assignedFieldOfficers: form.assignedFieldOfficers,
//         assignedResearchers: form.assignedResearchers,
//         status: "planned"
//       };

//       await api.post("/projects", payload);
//       setForm(emptyForm);
//       setMessage({ text: "Project created successfully. Status set to Planned.", error: false });
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not create project.", error: true });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return <Shell active="projects"><header className="topbar"><div><p className="eyebrow">Administration / conservation projects</p><h1>Create conservation project</h1><p className="lede">Plan project activities, assign project members, and save a new conservation initiative with Planned status.</p></div></header>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}<div className="admin-layout species-layout"><section className="form-panel species-form"><div className="section-heading"><div><h2>Create project</h2><p className="muted">Set the project plan, assign project members, and save it as planned.</p></div></div><form onSubmit={submit}><div className="form-grid"><Field label="Project name"><input name="projectName" value={form.projectName} onChange={update} placeholder="Forest Recovery Initiative" required /></Field><Field label="Objective"><input name="objective" value={form.objective} onChange={update} placeholder="Protect endangered habitat" required /></Field><Field label="Start date"><input type="date" name="startDate" value={form.startDate} onChange={update} required /></Field><Field label="End date"><input type="date" name="endDate" value={form.endDate} onChange={update} required /></Field><Field label="Budget"><input type="number" min="0" name="budget" value={form.budget} onChange={update} placeholder="500000" /></Field><Field label="Location"><input name="location" value={form.location} onChange={update} placeholder="Nallamala Forest, Andhra Pradesh" /></Field><Field label="Description" wide><textarea name="description" value={form.description} onChange={update} rows="4" placeholder="Describe the conservation objective and scope." /></Field><Field label="Add project activities" wide><textarea name="activities" value={form.activities} onChange={update} rows="5" placeholder="Monitoring patrols&#10;Habitat restoration&#10;Community awareness" /></Field><Field label="Select researchers" wide><select multiple value={form.assignedResearchers} onChange={(event) => updateMultiSelect(event, "assignedResearchers")}>{researchers.map((user) => <option key={user._id} value={user._id}>{user.name} · {user.email}</option>)}</select><small className="field-help">Select one or more researchers for this project.</small></Field><Field label="Select field officers" wide><select multiple value={form.assignedFieldOfficers} onChange={(event) => updateMultiSelect(event, "assignedFieldOfficers")}>{fieldOfficers.map((user) => <option key={user._id} value={user._id}>{user.name} · {user.email}</option>)}</select><small className="field-help">Select one or more field officers for this project.</small></Field></div><div className="form-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save project"}</button></div></form></section></div></Shell>;
// }

// function FieldOfficersPage() {
//   return <TeamManagementPage role="field_officer" />;
// }

// function ResearchersPage() {
//   return <TeamManagementPage role="researcher" />;
// }

// function TeamManagementPage({ role }) {
//   const isResearcher = role === "researcher";
//   const personLabel = isResearcher ? "researcher" : "field officer";
//   const personLabelPlural = isResearcher ? "Researchers" : "Field officers";
//   const collectionPath = isResearcher ? "/users/researchers" : "/users/field-officers";
//   const emptyForm = { name: "", email: "", phone: "", password: "" };
//   const [officers, setOfficers] = useState([]);
//   const [form, setForm] = useState(emptyForm);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState({ text: "", error: false });

//   const loadOfficers = async () => {
//     try {
//       const response = await api.get(collectionPath);
//       setOfficers(response.data.users || []);
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not load field officers.", error: true });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadOfficers(); }, [collectionPath]);

//   const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
//   const resetForm = () => { setForm(emptyForm); setEditingId(null); };
//   const editOfficer = (officer) => { setEditingId(officer._id || officer.id); setForm({ name: officer.name || "", email: officer.email || "", phone: officer.phone || "", password: "" }); setMessage({ text: "", error: false }); };

//   const submit = async (event) => {
//     event.preventDefault();
//     setSaving(true);
//     setMessage({ text: "", error: false });
//     try {
//       if (editingId) {
//         await api.put(`/users/${editingId}`, { name: form.name, email: form.email, phone: form.phone });
//         setMessage({ text: `${personLabel} updated successfully.`, error: false });
//       } else {
//         await api.post(collectionPath, form);
//         setMessage({ text: `${personLabel} created successfully.`, error: false });
//       }
//       resetForm();
//       await loadOfficers();
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not save field officer.", error: true });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const toggleStatus = async (officer) => {
//     const id = officer._id || officer.id;
//     const nextStatus = officer.status === "active" ? "inactive" : "active";
//     try {
//       await api.patch(`/users/${id}/status`, { status: nextStatus });
//       setMessage({ text: `${personLabel} marked ${nextStatus}.`, error: false });
//       await loadOfficers();
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not change officer status.", error: true });
//     }
//   };

//   const deleteOfficer = async (officer) => {
//     const id = officer._id || officer.id;
//     if (!window.confirm(`Delete ${officer.name}? This cannot be undone.`)) return;
//     try {
//       await api.delete(`/users/${id}`);
//       setMessage({ text: `${personLabel} deleted successfully.`, error: false });
//       await loadOfficers();
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not delete field officer.", error: true });
//     }
//   };

//   return <Shell active={isResearcher ? "researchers" : "officers"}><header className="topbar"><div><p className="eyebrow">Administration / team access</p><h1>{personLabelPlural}</h1><p className="lede">Create and manage the {personLabelPlural.toLowerCase()} who support conservation operations.</p></div></header><div className="admin-layout"><section className="form-panel officer-form"><div className="section-heading"><div><h2>{editingId ? `Update ${personLabel}` : `Create ${personLabel}`}</h2><p className="muted">{editingId ? "Update profile details. Passwords are unchanged." : "New accounts start active."}</p></div></div><form onSubmit={submit}><Field label="Full name"><input name="name" value={form.name} onChange={update} required /></Field><Field label="Email"><input type="email" name="email" value={form.email} onChange={update} required /></Field><Field label="Phone"><input name="phone" value={form.phone} onChange={update} /></Field>{!editingId && <Field label="Temporary password"><input type="password" name="password" value={form.password} onChange={update} minLength="6" required /></Field>}<div className="form-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : `Create ${personLabel}`}</button>{editingId && <button className="button button-secondary" type="button" onClick={resetForm}>Cancel</button>}</div></form></section><section className="officer-list"><div className="section-heading"><div><h2>Team directory</h2><p className="muted">{officers.length} {personLabel}{officers.length === 1 ? "" : "s"}</p></div></div>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}{loading ? <div className="loading-state">Loading {personLabelPlural.toLowerCase()}...</div> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead><tbody>{officers.map((officer) => <tr key={officer._id || officer.id}><td><strong>{officer.name}</strong><small>{personLabel}</small></td><td>{officer.email}<small>{officer.phone || "No phone added"}</small></td><td><span className={`status status-${officer.status}`}>{officer.status}</span></td><td><div className="action-row"><button className="text-button" onClick={() => editOfficer(officer)}>Edit</button><button className="text-button" onClick={() => toggleStatus(officer)}>{officer.status === "active" ? "Deactivate" : "Activate"}</button><button className="text-button danger-text" onClick={() => deleteOfficer(officer)}>Delete</button></div></td></tr>)}{!officers.length && <tr><td colSpan="4" className="empty-cell">No {personLabelPlural.toLowerCase()} yet.</td></tr>}</tbody></table></div>}</section></div></Shell>;
// }
// function HabitatManagementPage() {
//   const emptyForm = { name: "", habitatType: "Forest", location: "", description: "", area: "", areaUnit: "sq_km", associatedSpecies: [], associatedSpeciesNames: "", threats: "", images: [] };
//   const [form, setForm] = useState(emptyForm);
//   const [habitats, setHabitats] = useState([]);
//   const [species, setSpecies] = useState([]);
//   const [imageFile, setImageFile] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState({ text: "", error: false });

//   const loadHabitats = async () => {
//     try {
//       const response = await api.get("/habitats");
//       setHabitats(response.data.habitats || []);
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not load habitats.", error: true });
//     }
//   };

//   const loadSpecies = async () => {
//     try {
//       const response = await api.get("/species");
//       setSpecies(response.data.species || []);
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not load species.", error: true });
//     }
//   };

//   useEffect(() => {
//     loadHabitats();
//     loadSpecies();
//     const refreshTimer = window.setInterval(loadSpecies, 10000);
//     return () => window.clearInterval(refreshTimer);
//   }, []);

//   useEffect(() => {
//     const handleHabitatLocationSelected = (event) => {
//       const selection = event.detail;
//       const coordinates = Array.isArray(selection?.coordinates) ? selection.coordinates : Array.isArray(selection) ? selection : null;
//       const locationLabel = selection?.location || (coordinates ? `Latitude ${coordinates[1].toFixed(6)}, Longitude ${coordinates[0].toFixed(6)}` : "") || "";
//       setForm((currentForm) => ({
//         ...currentForm,
//         ...(locationLabel ? { location: locationLabel } : {})
//       }));
//     };
//     window.addEventListener("habitat-location-selected", handleHabitatLocationSelected);
//     return () => window.removeEventListener("habitat-location-selected", handleHabitatLocationSelected);
//   }, []);

//   const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

//   const submit = async (event) => {
//     event.preventDefault();
//     setSaving(true);
//     setMessage({ text: "", error: false });
//     try {
//       let uploadedImageUrl = "";

//       if (imageFile) {
//         const formData = new FormData();
//         formData.append("image", imageFile);
//         const uploadResponse = await api.post("/habitats/upload-image", formData, {
//           headers: { "Content-Type": "multipart/form-data" }
//         });
//         uploadedImageUrl = uploadResponse.data.url || "";
//       }

//       const payload = {
//         ...form,
//         area: form.area ? Number(form.area) : undefined,
//         associatedSpeciesNames: form.associatedSpeciesNames
//           ? form.associatedSpeciesNames.split(",").map((item) => item.trim()).filter(Boolean)
//           : [],
//         threats: form.threats || undefined,
//         images: uploadedImageUrl ? [uploadedImageUrl] : []
//       };

//       await api.post("/habitats", payload);
//       setForm(emptyForm);
//       setImageFile(null);
//       setMessage({ text: "Habitat created successfully. Status: Active", error: false });
//       await loadHabitats();
//     } catch (requestError) {
//       setMessage({ text: requestError.response?.data?.message || "Could not create habitat.", error: true });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return <Shell active="habitats"><header className="topbar"><div><p className="eyebrow">Administration / habitat register</p><h1>Habitat management</h1><p className="lede">Create active habitats that researchers can select in their observations.</p></div></header>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}<div className="admin-layout habitat-layout"><section className="form-panel officer-form"><div className="section-heading"><div><h2>Add habitat</h2><p className="muted">New habitats are active immediately.</p></div></div><form onSubmit={submit}><Field label="Habitat name"><input name="name" value={form.name} onChange={update} required /></Field><Field label="Habitat type"><select name="habitatType" value={form.habitatType} onChange={update}>{["Forest", "Grassland", "Wetland", "Mangrove", "Desert", "Mountain", "Coastal", "River", "Other"].map((type) => <option key={type}>{type}</option>)}</select></Field><Field label="Location" wide><input name="location" value={form.location} onChange={update} required placeholder="Select a location on the map" /><span>Choose exact location on map</span><ResearchLocationPicker value={null} onChange={(selection) => {
//   const coordinates = Array.isArray(selection?.coordinates) ? selection.coordinates : Array.isArray(selection) ? selection : null;
//   const locationLabel = selection?.location || (coordinates ? `Latitude ${coordinates[1].toFixed(6)}, Longitude ${coordinates[0].toFixed(6)}` : "");
//   window.dispatchEvent(new CustomEvent("habitat-location-selected", { detail: selection }));
//   setForm((currentForm) => ({ ...currentForm, ...(locationLabel ? { location: locationLabel } : {}) }));
// }} /></Field><Field label="Description" wide><textarea name="description" value={form.description} onChange={update} rows="4" /></Field><div className="form-grid"><Field label="Area"><input type="number" min="0" step="any" name="area" value={form.area} onChange={update} /></Field><Field label="Area unit"><select name="areaUnit" value={form.areaUnit} onChange={update}><option value="sq_km">Square kilometres</option><option value="hectare">Hectares</option><option value="acre">Acres</option></select></Field></div><Field label="Threats"><input name="threats" value={form.threats} onChange={update} placeholder="Poaching, deforestation" /></Field><Field label="Habitat image upload" wide><input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /></Field><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save habitat"}</button></form></section><section className="officer-list"><div className="section-heading"><div><h2>Active habitats</h2><p className="muted">{habitats.length} habitat{habitats.length === 1 ? "" : "s"}</p></div></div><div className="resource-list">{habitats.map((habitat) => <article className="resource-item" key={habitat._id}><div className="resource-icon">HB</div><div><strong>{habitat.name}</strong><p>{habitat.habitatType} · {habitat.location}</p></div><span className="status status-active">active</span></article>)}{!habitats.length && <p className="muted">No habitats created yet.</p>}</div></section></div></Shell>;
// }

// function ResourceList({ title, items, type, empty }) { return <section className="resource-panel"><div className="section-heading"><h2>{title}</h2><span className="count-pill">{items.length}</span></div><div className="resource-list">{items.slice(0, 5).map((item) => <article className="resource-item" key={item._id}><div className="resource-icon">{type === "species" ? "SP" : "HB"}</div><div><strong>{type === "species" ? item.commonName : item.name}</strong><p>{type === "species" ? item.scientificName : `${item.habitatType} · ${item.location}`}</p></div><span className="status status-active">active</span></article>)}{!items.length && <p className="muted">{empty}</p>}</div></section>; }

// function ReportPage() { return <Shell active="report"><header className="topbar"><div><p className="eyebrow">Field input</p><h1>Report activity</h1><p className="lede">Submit a sighting or incident directly to the conservation team.</p></div></header><ReportForm /></Shell>; }

// function RegisterPage() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
//   const [error, setError] = useState("");
//   const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
//   const submit = async (event) => { event.preventDefault(); setError(""); try { const response = await api.post("/auth/register", form); login(response.data); navigate("/dashboard"); } catch (requestError) { setError(requestError.response?.data?.message || "Registration failed."); } };
//   return <div className="auth-page"><div className="auth-card"><Link className="brand auth-brand" to="/login"><span className="brand-mark">W</span><span>WildTrace</span></Link><p className="eyebrow">Community access</p><h1>Create your account</h1><p className="lede">Join the conservation network as a public user.</p>{error && <div className="notice error">{error}</div>}<form onSubmit={submit}><Field label="Name"><input name="name" value={form.name} onChange={update} required /></Field><Field label="Email"><input type="email" name="email" value={form.email} onChange={update} required /></Field><Field label="Phone"><input name="phone" value={form.phone} onChange={update} /></Field><Field label="Password"><input type="password" name="password" value={form.password} onChange={update} minLength="6" required /></Field><button className="button button-primary" type="submit">Create account</button></form><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></div></div>;
// }
// function ReportForm() {
//   const [kind, setKind] = useState("sighting");
//   const [species, setSpecies] = useState([]);
//   const [form, setForm] = useState({ species: "", sightingDate: new Date().toISOString().slice(0, 10), location: "", longitude: "", latitude: "", animalCount: 1, condition: "Unknown", incidentType: "other", title: "", description: "", severity: "medium" });
//   const [message, setMessage] = useState({ text: "", error: false });
//   useEffect(() => { api.get("/species").then((response) => setSpecies(response.data.species || [])).catch(() => setSpecies([])); }, []);
//   useEffect(() => {
//     const handleMapLocationSelected = (event) => {
//       const selection = event.detail;
//       const coordinates = selection.coordinates || selection;
//       setForm((currentForm) => ({
//         ...currentForm,
//         longitude: String(coordinates[0]),
//         latitude: String(coordinates[1]),
//         ...(selection.location ? { location: selection.location } : {})
//       }));
//     };
//     window.addEventListener("public-location-selected", handleMapLocationSelected);
//     return () => window.removeEventListener("public-location-selected", handleMapLocationSelected);
//   }, []);
//   const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
//   const submit = async (event) => { event.preventDefault(); setMessage({ text: "", error: false }); const coordinates = [Number(form.longitude), Number(form.latitude)]; const body = kind === "sighting" ? { species: form.species, sightingDate: form.sightingDate, location: form.location, coordinates, animalCount: Number(form.animalCount), condition: form.condition } : { incidentType: form.incidentType, title: form.title, description: form.description, location: form.location, coordinates, severity: form.severity }; try { await api.post(kind === "sighting" ? "/sightings" : "/incidents", body); setMessage({ text: `${kind === "sighting" ? "Sighting" : "Incident"} submitted for review.`, error: false }); } catch (requestError) { setMessage({ text: requestError.response?.data?.message || "Submission failed.", error: true }); } };
//   return <section className="form-panel"><div className="segmented"><button className={kind === "sighting" ? "selected" : ""} onClick={() => setKind("sighting")}>Wildlife sighting</button><button className={kind === "incident" ? "selected" : ""} onClick={() => setKind("incident")}>Conservation incident</button></div><form onSubmit={submit}><div className="form-grid">{kind === "sighting" ? <><Field label="Species"><select name="species" value={form.species} onChange={update} required><option value="">Select species</option>{species.map((item) => <option key={item._id} value={item._id}>{item.commonName}</option>)}</select></Field><Field label="Date"><input type="date" name="sightingDate" value={form.sightingDate} onChange={update} required /></Field><Field label="Animal count"><input type="number" min="1" name="animalCount" value={form.animalCount} onChange={update} required /></Field><Field label="Condition"><select name="condition" value={form.condition} onChange={update}><option>Healthy</option><option>Injured</option><option>Sick</option><option>Dead</option><option>Unknown</option></select></Field></> : <><Field label="Incident type"><select name="incidentType" value={form.incidentType} onChange={update}>{["poaching", "forest_fire", "animal_injury", "illegal_hunting", "animal_death", "habitat_destruction", "human_wildlife_conflict", "other"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Severity"><select name="severity" value={form.severity} onChange={update}><option>low</option><option>medium</option><option>high</option><option>critical</option></select></Field><Field label="Title" wide><input name="title" value={form.title} onChange={update} required /></Field><Field label="Description" wide><textarea name="description" value={form.description} onChange={update} required rows="4" /></Field></>}</div><Field label="Location" wide><input name="location" value={form.location} onChange={update} placeholder="Reserve, village, or landmark" required /></Field><div className="coordinate-grid"><Field label="Longitude"><input type="number" step="any" name="longitude" value={form.longitude} onChange={update} placeholder="78.9629" required /></Field><Field label="Latitude"><input type="number" step="any" name="latitude" value={form.latitude} onChange={update} placeholder="20.5937" required /></Field></div>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}<button className="button button-primary" type="submit">Submit {kind}</button></form></section>;
// }

// function Field({ label, children, wide = false }) {
//   const showResearchMap = label === "Location" && window.location.pathname === "/research";
//   const showPublicMap = label === "Location" && window.location.pathname === "/report";
//   const locationInput = showResearchMap && children?.type === "input"
//     ? cloneElement(children, {
//       onBlur: async (event) => {
//         children.props.onBlur?.(event);
//         if (!event.target.value.trim()) return;
//         try {
//           const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(event.target.value.trim())}`, { headers: { Accept: "application/json" } });
//           const results = await response.json();
//           if (results.length) {
//             window.dispatchEvent(new CustomEvent("research-location-selected", { detail: [Number(results[0].lon), Number(results[0].lat)] }));
//           }
//         } catch { /* Submission performs a second validation if geocoding is unavailable. */ }
//       }
//     })
//     : children;
//   return <label className={wide ? "field wide" : "field"}><span>{label}</span>{locationInput}{(showResearchMap || showPublicMap) && <><span>Choose exact location on map</span><ResearchLocationPicker value={null} onChange={(selection) => window.dispatchEvent(new CustomEvent(showPublicMap ? "public-location-selected" : "research-location-selected", { detail: selection }))} /></>}</label>;
// }

// function ResearchPage() {
//   const emptyForm = { title: "", project: "", species: [], habitats: [], observationDate: new Date().toISOString().slice(0, 10), location: "", coordinates: null, methodology: "", observation: "", findings: "", conclusion: "", recommendations: "" };
//   const [research, setResearch] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [species, setSpecies] = useState([]);
//   const [habitats, setHabitats] = useState([]);
//   const [form, setForm] = useState(emptyForm);
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState({ text: "", error: false });

//   const loadData = async () => {
//     const responses = await Promise.allSettled([api.get("/research/my"), api.get("/species"), api.get("/habitats"), api.get("/projects/my/researcher")]);
//     const [researchResponse, speciesResponse, habitatResponse, projectResponse] = responses;
//     if (researchResponse.status === "fulfilled") setResearch(researchResponse.value.data.research || []);
//     if (speciesResponse.status === "fulfilled") setSpecies(speciesResponse.value.data.species || []);
//     if (habitatResponse.status === "fulfilled") setHabitats(habitatResponse.value.data.habitats || []);
//     if (projectResponse.status === "fulfilled") setProjects(projectResponse.value.data.projects || []);
//     const failedResponse = responses.find((response) => response.status === "rejected");
//     if (failedResponse) setMessage({ text: failedResponse.reason.response?.data?.message || "Could not load all research data. Check that the backend is running.", error: true });
//     setLoading(false);
//   };

//   useEffect(() => {
//     const handleLocationSelected = (event) => {
//       const selection = event.detail;
//       setForm((currentForm) => ({
//         ...currentForm,
//         coordinates: selection.coordinates || selection,
//         ...(selection.location ? { location: selection.location } : {})
//       }));
//     };
//     window.addEventListener("research-location-selected", handleLocationSelected);
//     loadData();
//     const refreshTimer = window.setInterval(loadData, 10000);
//     return () => {
//       window.removeEventListener("research-location-selected", handleLocationSelected);
//       window.clearInterval(refreshTimer);
//     };
//   }, []);

//   const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
//   const updateMultiSelect = (event) => setForm({ ...form, [event.target.name]: Array.from(event.target.selectedOptions, (option) => option.value) });
//   const resetForm = () => { setForm(emptyForm); setFiles([]); };

//   const resolveCoordinates = async () => {
//     if (form.coordinates?.length === 2) {
//       return form.coordinates;
//     }

//     if (!form.location.trim()) {
//       throw new Error("Please enter a location or select one on the map.");
//     }

//     const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(form.location.trim())}`, {
//       headers: { Accept: "application/json" }
//     });
//     const results = await response.json();

//     if (!results.length) {
//       throw new Error("Location was not found. Select the location directly on the map.");
//     }

//     return [Number(results[0].lon), Number(results[0].lat)];
//   };

//   const submit = async (event, status) => {
//     event.preventDefault();
//     setSaving(true);
//     setMessage({ text: "", error: false });
//     try {
//       const coordinates = await resolveCoordinates();
//       const attachments = [];
//       for (const file of files) {
//         if (!file.type.startsWith("image/")) {
//           throw new Error(`${file.name} is not an image file.`);
//         }
//         if (file.size > 5 * 1024 * 1024) {
//           throw new Error(`${file.name} is larger than the 5 MB upload limit.`);
//         }
//         const uploadData = new FormData();
//         uploadData.append("file", file);
//         const response = await api.post("/research/attachments", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
//         attachments.push(response.data.url);
//       }
//       await api.post("/research", { ...form, coordinates, attachments, status });
//       setMessage({ text: `Research observation saved as ${status}.`, error: false });
//       resetForm();
//       await loadData();
//     } catch (requestError) {
//       const failedStep = files.length && requestError.config?.url?.includes("/attachments") ? "upload research photos" : "save this observation";
//       setMessage({ text: requestError.response?.data?.message || requestError.message || `Could not ${failedStep}. Check the backend connection and try again.`, error: true });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return <Shell active="research"><header className="topbar"><div><p className="eyebrow">Research workspace</p><h1>Research log</h1><p className="lede">Select an existing species, document your observation, and attach field photos.</p></div></header>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}<div className="research-layout"><section className="form-panel research-form"><div className="section-heading"><div><h2>New observation</h2><p className="muted">Species records are managed by administrators.</p></div></div><form onSubmit={(event) => submit(event, "draft")}><div className="form-grid"><Field label="Title" wide><input name="title" value={form.title} onChange={update} placeholder="Wetland bird survey" required /></Field><Field label="Species"><select name="species" multiple value={form.species} onChange={updateMultiSelect} required>{species.map((item) => <option key={item._id} value={item._id}>{item.commonName} · {item.scientificName}</option>)}</select><small className="field-help">Use Ctrl/Cmd to select multiple species.</small></Field><Field label="Habitat"><select name="habitats" multiple value={form.habitats} onChange={updateMultiSelect}>{habitats.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></Field><Field label="Observation date"><input type="date" name="observationDate" value={form.observationDate} onChange={update} required /></Field><Field label="Location"><input name="location" value={form.location} onChange={update} placeholder="Reserve or field site" required /></Field><Field label="Methodology" wide><textarea name="methodology" value={form.methodology} onChange={update} rows="3" placeholder="Transect, camera trap, interview..." /></Field><Field label="Observation" wide><textarea name="observation" value={form.observation} onChange={update} rows="4" required /></Field><Field label="Findings"><textarea name="findings" value={form.findings} onChange={update} rows="3" /></Field><Field label="Conclusion"><textarea name="conclusion" value={form.conclusion} onChange={update} rows="3" /></Field><Field label="Recommendations" wide><textarea name="recommendations" value={form.recommendations} onChange={update} rows="3" /></Field><Field label="Research photos" wide><input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} /><small className="field-help">Photos are stored on this research observation and do not change the species record.</small>{files.length > 0 && <span className="file-summary">{files.length} photo{files.length === 1 ? "" : "s"} ready to upload</span>}</Field></div><div className="form-actions research-actions"><button className="button button-secondary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save draft"}</button><button className="button button-primary" type="button" disabled={saving} onClick={(event) => submit(event, "completed")}>{saving ? "Uploading..." : "Complete observation"}</button></div></form></section><section className="section-block research-history"><div className="section-heading"><div><h2>My observations</h2><p className="muted">{research.length} record{research.length === 1 ? "" : "s"}</p></div></div>{loading ? <div className="loading-state">Loading observations...</div> : <div className="project-list">{research.map((item) => <article className="project-row" key={item._id}><div><strong>{item.title}</strong><p>{item.location} · {new Date(item.observationDate).toLocaleDateString()} · {item.species?.map((itemSpecies) => itemSpecies.commonName).join(", ") || "No species"}</p></div><span className={`status status-${item.status}`}>{item.status}</span></article>)}{!research.length && <p className="muted research-empty">No research observations yet. Create the first record above.</p>}</div>}</section></div></Shell>;
// }

// export default App;
import { cloneElement, useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import api from "./services/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Login from "./pages/auth/Login";
import ResearchApprovalsPage from "./pages/admin/ResearchApprovalsPage";
import IncidentApprovalsPage from "./pages/admin/IncidentApprovalsPage";
import WildlifeMap from "./pages/WildlifeMap";
import ResearchLocationPicker from "./components/ResearchLocationPicker";
import FieldWorkPage from "./pages/field/FieldWorkPage";
import ResearchProjectPage from "./pages/research/ResearchProjectPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import Shell from "./components/Shell";

import "./App.css";

const roleLabels = {
  admin: "Administrator",
  field_officer: "Field officer",
  researcher: "Researcher",
  public_user: "Community member",
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route path="/field-officers" element={<FieldOfficersPage />} />
              <Route path="/researchers" element={<ResearchersPage />} />
              <Route path="/species-management" element={<SpeciesManagementPage />} />
              <Route path="/habitat-management" element={<HabitatManagementPage />} />
              <Route path="/project-management" element={<ProjectManagementPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/sighting-approvals" element={<SightingApprovalsPage />} />
              <Route path="/incident-approvals" element={<IncidentApprovalsPage />} />
              <Route path="/research-approvals" element={<ResearchApprovalsPage />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={["field_officer"]} />}>
              <Route path="/field-work" element={<FieldWorkPage />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={["field_officer", "public_user"]} />}>
              <Route path="/report" element={<ReportPage />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={["researcher"]} />}>
              <Route path="/research" element={<ResearchProjectPage />} />
              <Route path="/wildlife-map" element={<WildlifeMap />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ species: [], habitats: [], projects: [], activity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const requests = [api.get("/species"), api.get("/habitats"), api.get("/projects")];
        if (user.role === "admin") requests.push(api.get("/sightings/pending"), api.get("/incidents/pending"));
        else if (user.role === "researcher") requests.push(api.get("/research/my"));
        else requests.push(api.get("/sightings/my"), api.get("/incidents/my"));
        const responses = await Promise.all(requests);
        const [species, habitats, projects, first, second] = responses;
        const activity = user.role === "admin"
          ? [{ label: "Pending sightings", value: first.data.count, tone: "amber" }, { label: "Pending incidents", value: second.data.count, tone: "red" }]
          : user.role === "researcher"
            ? [{ label: "Your observations", value: first.data.count, tone: "green" }]
            : [{ label: "Your sightings", value: first.data.count, tone: "green" }, { label: "Your incidents", value: second.data.count, tone: "red" }];
        setData({ species: species.data.species || [], habitats: habitats.data.habitats || [], projects: projects.data.projects || [], activity });
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load conservation data.");
      } finally { setLoading(false); }
    }
    loadDashboard();
  }, [user]);

  return <Shell><header className="topbar"><div><p className="eyebrow">Field intelligence / {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</p><h1>Good morning, {user.name.split(" ")[0]}.</h1></div>{user.role === "admin" ? <Link className="button button-primary" to="/species-management">+ Add species</Link> : <Link className="button button-primary" to="/report">+ New report</Link>}</header>
    {error && <div className="notice error">{error} Check that the backend is running at <strong>localhost:5000</strong>.</div>}
    <section className="hero-panel"><div><p className="eyebrow">Live conservation picture</p><h2>Evidence turns into action.</h2><p>Track biodiversity, protect habitats, and keep every field report moving toward a decision.</p></div><div className="hero-stat"><strong>{data.species.length || "—"}</strong><span>active species</span></div></section>
      <div className="stats-grid"><Stat label="Protected habitats" value={data.habitats.length} /><Stat label="Active projects" value={data.projects.filter((project) => ["planned", "active"].includes(String(project.status || "").toLowerCase())).length} /><Stat label="Your access" value={roleLabels[user.role]} compact />{data.activity.map((item) => <Stat key={item.label} label={item.label} value={item.value} tone={item.tone} />)}</div>
    {user.role === "admin" && <><Link className="review-banner" to="/sighting-approvals"><span><strong>Review field reports</strong><small>Approve or reject pending wildlife sightings</small></span><b>Open queue →</b></Link><Link className="review-banner" to="/incident-approvals"><span><strong>Review public reports</strong><small>Approve or reject pending conservation incidents</small></span><b>Open queue →</b></Link><Link className="review-banner" to="/research-approvals"><span><strong>Review research reports</strong><small>Approve or reject researcher observations</small></span><b>Open queue →</b></Link></>}
    {loading ? <div className="loading-state">Loading the latest field data...</div> : <><section className="content-grid"><ResourceList title="Species register" items={data.species} type="species" empty="No active species have been added yet." /><ResourceList title="Habitat register" items={data.habitats} type="habitats" empty="No active habitats have been added yet." /></section><section className="section-block"><div className="section-heading"><div><p className="eyebrow">Coordinated work</p><h2>Conservation projects</h2></div><span className="muted">{data.projects.length} total</span></div><div className="project-list">{data.projects.slice(0, 4).map((project) => <article className="project-row" key={project._id}><div><strong>{project.projectName}</strong><p>{project.location} · {project.objective}</p></div><div className="progress-wrap"><span>{project.progress}%</span><div className="progress"><i style={{ width: `${project.progress}%` }} /></div></div><span className={`status status-${project.status}`}>{project.status}</span></article>)}{!data.projects.length && <p className="muted">No projects have been created yet.</p>}</div></section></>}
  </Shell>;
}

function Stat({ label, value, tone = "green", compact = false }) { return <article className={`stat-card ${tone}`}><span>{label}</span><strong className={compact ? "stat-compact" : ""}>{value}</strong></article>; }

function SightingApprovalsPage() {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState({ text: "", error: false });

  const loadPendingSightings = async () => {
    try {
      const response = await api.get("/sightings/pending");
      setSightings(response.data.sightings || []);
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not load pending sighting reports.", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPendingSightings(); }, []);

  const review = async (sighting, verificationStatus) => {
    setBusyId(sighting._id);
    setMessage({ text: "", error: false });
    try {
      await api.patch(`/sightings/${sighting._id}/verify`, { verificationStatus });
      setMessage({ text: `Sighting ${verificationStatus} successfully.`, error: false });
      await loadPendingSightings();
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not review this report.", error: true });
    } finally {
      setBusyId(null);
    }
  };

  return <Shell active="approvals"><header className="topbar"><div><p className="eyebrow">Administration / field review</p><h1>Sighting approvals</h1><p className="lede">Review wildlife reports submitted by field officers and community members.</p></div></header><section className="section-block approval-section"><div className="section-heading"><div><h2>Pending reports</h2><p className="muted">{sightings.length} report{sightings.length === 1 ? "" : "s"} waiting for review</p></div></div>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}{loading ? <div className="loading-state">Loading pending reports...</div> : <div className="approval-list">{sightings.map((sighting) => <article className="approval-card" key={sighting._id}><div className="approval-heading"><div><span className="resource-icon">SP</span><div className="approval-title"><h3>{sighting.species?.commonName || "Unknown species"}</h3><p>{sighting.species?.scientificName || "Species details unavailable"}</p></div></div><span className="status status-pending">pending</span></div><div className="approval-details"><span><b>Reported by</b>{sighting.reportedBy?.name || "Unknown reporter"}</span><span><b>Date</b>{new Date(sighting.sightingDate).toLocaleDateString()}</span><span><b>Location</b>{sighting.location}</span><span><b>Animals</b>{sighting.animalCount}</span><span><b>Condition</b>{sighting.condition || "Unknown"}</span></div>{sighting.description && <p className="approval-description">{sighting.description}</p>}<div className="approval-actions"><button className="button button-primary" disabled={busyId === sighting._id} onClick={() => review(sighting, "verified")}>Approve report</button><button className="button button-reject" disabled={busyId === sighting._id} onClick={() => review(sighting, "rejected")}>Reject report</button></div></article>)}{!sightings.length && <div className="empty-state"><strong>All caught up.</strong><p>There are no pending sighting reports to review.</p></div>}</div>}</section></Shell>;
}

function SpeciesManagementPage() {
  const emptyForm = { commonName: "", scientificName: "", family: "", conservationStatus: "Least Concern", population: "", diet: "", behavior: "", physicalDescription: "", habitat: "", distribution: "", threats: "", description: "", images: [] };
  const [species, setSpecies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });
  const [imageFile, setImageFile] = useState(null);

  const loadSpecies = async () => {
    try {
      const response = await api.get("/species");
      setSpecies(response.data.species || []);
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not load species.", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSpecies(); }, []);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setImageFile(null); };
  const editSpecies = (item) => { setEditingId(item._id); setImageFile(null); setForm({ ...item, images: item.images || [], population: item.population ?? "" }); setMessage({ text: "", error: false }); };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", error: false });
    try {
      let images = form.images || [];
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);
        const uploadResponse = await api.post("/species/upload-image", uploadData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        images = [...images, uploadResponse.data.url];
      }
      const body = { ...form, population: form.population === "" ? undefined : Number(form.population), images };
      if (editingId) {
        await api.put(`/species/${editingId}`, body);
        setMessage({ text: "Species updated successfully.", error: false });
      } else {
        await api.post("/species", body);
        setMessage({ text: "Species created successfully and is now available for reports.", error: false });
      }
      resetForm();
      await loadSpecies();
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not save species.", error: true });
    } finally {
      setSaving(false);
    }
  };

  const deleteSpecies = async (item) => {
    if (!window.confirm(`Delete ${item.commonName}? Existing reports may reference this species.`)) return;
    try {
      await api.delete(`/species/${item._id}`);
      setMessage({ text: "Species deleted successfully.", error: false });
      await loadSpecies();
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not delete species.", error: true });
    }
  };

  return <Shell active="species"><header className="topbar"><div><p className="eyebrow">Administration / master data</p><h1>Species register</h1><p className="lede">Create the active species list used by field officers when submitting sightings.</p></div></header><div className="admin-layout species-layout"><section className="form-panel species-form"><div className="section-heading"><div><h2>{editingId ? "Update species" : "Add species"}</h2><p className="muted">Only active species appear in field report selections.</p></div></div><form onSubmit={submit}><div className="form-grid"><Field label="Common name"><input name="commonName" value={form.commonName} onChange={update} placeholder="Bengal Tiger" required /></Field><Field label="Scientific name"><input name="scientificName" value={form.scientificName} onChange={update} placeholder="Panthera tigris" required /></Field><Field label="Family"><input name="family" value={form.family} onChange={update} placeholder="Felidae" /></Field><Field label="Conservation status"><select name="conservationStatus" value={form.conservationStatus} onChange={update}>{["Least Concern", "Near Threatened", "Vulnerable", "Endangered", "Critically Endangered", "Extinct in the Wild", "Extinct"].map((status) => <option key={status}>{status}</option>)}</select></Field><Field label="Population"><input type="number" min="0" name="population" value={form.population} onChange={update} /></Field><Field label="Diet"><input name="diet" value={form.diet} onChange={update} placeholder="Carnivore" /></Field><Field label="Habitat"><input name="habitat" value={form.habitat} onChange={update} placeholder="Forest" /></Field><Field label="Distribution"><input name="distribution" value={form.distribution} onChange={update} /></Field><Field label="Behavior"><input name="behavior" value={form.behavior} onChange={update} /></Field><Field label="Threats"><input name="threats" value={form.threats} onChange={update} /></Field><Field label="Physical description" wide><textarea name="physicalDescription" value={form.physicalDescription} onChange={update} rows="2" /></Field><Field label="Description" wide><textarea name="description" value={form.description} onChange={update} rows="3" /></Field><Field label="Species photo" wide><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /><small className="field-help">Upload PNG, JPG, WEBP, or GIF up to 5 MB.</small>{form.images?.length > 0 && <small className="field-help">{form.images.length} photo already attached. Uploading another will add it.</small>}</Field></div><div className="form-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? (imageFile ? "Uploading..." : "Saving...") : editingId ? "Save changes" : "Create species"}</button>{editingId && <button className="button button-secondary" type="button" onClick={resetForm}>Cancel</button>}</div></form></section><section className="officer-list species-list"><div className="section-heading"><div><h2>Active species</h2><p className="muted">{species.length} available to field officers</p></div></div>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}{loading ? <div className="loading-state">Loading species...</div> : <div className="table-wrap"><table><thead><tr><th>Species</th><th>Status</th><th>Reference photo</th><th>Actions</th></tr></thead><tbody>{species.map((item) => <tr key={item._id}><td><strong>{item.commonName}</strong><small>{item.scientificName}</small></td><td><span className="status status-active">active</span></td><td>{item.images?.[0] ? <a className="image-link" href={item.images[0]} target="_blank" rel="noreferrer">View photo</a> : <small>No photo</small>}</td><td><div className="action-row"><button className="text-button" onClick={() => editSpecies(item)}>Edit</button><button className="text-button danger-text" onClick={() => deleteSpecies(item)}>Delete</button></div></td></tr>)}{!species.length && <tr><td colSpan="4" className="empty-cell">No active species yet. Add the first species above.</td></tr>}</tbody></table></div>}</section></div></Shell>;
}

function ProjectManagementPage() {
  const emptyForm = { projectName: "", objective: "", description: "", startDate: "", endDate: "", budget: "", location: "", coordinates: null, activities: "", assignedFieldOfficers: [], assignedResearchers: [] };
  const [form, setForm] = useState(emptyForm);
  const [fieldOfficers, setFieldOfficers] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  const loadTeam = async () => {
    try {
      const [fieldResponse, researcherResponse] = await Promise.all([
        api.get("/users/field-officers"),
        api.get("/users/researchers")
      ]);
      setFieldOfficers(fieldResponse.data.users || []);
      setResearchers(researcherResponse.data.users || []);
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not load team members.", error: true });
    }
  };

  useEffect(() => { loadTeam(); }, []);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const selectProjectLocation = (selection) => {
    const coordinates = Array.isArray(selection?.coordinates)
      ? selection.coordinates
      : Array.isArray(selection)
        ? selection
        : null;
    const location = selection?.location || (coordinates
      ? `Latitude ${coordinates[1].toFixed(6)}, Longitude ${coordinates[0].toFixed(6)}`
      : "");

    setForm((currentForm) => ({
      ...currentForm,
      coordinates,
      ...(location ? { location } : {})
    }));
  };
  const updateMultiSelect = (event, field) => {
    const selected = Array.from(event.target.selectedOptions, (option) => option.value);
    setForm({ ...form, [field]: selected });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", error: false });
    try {
      const payload = {
        ...form,
        budget: form.budget === "" ? 0 : Number(form.budget),
        activities: form.activities
          ? form.activities.split("\n").map((item) => item.trim()).filter(Boolean)
          : [],
        location: form.location || "General operational area",
        assignedFieldOfficers: form.assignedFieldOfficers,
        assignedResearchers: form.assignedResearchers,
        status: "planned"
      };

      await api.post("/projects", payload);
      setForm(emptyForm);
      setMessage({ text: "Project created successfully. Status set to Planned.", error: false });
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not create project.", error: true });
    } finally {
      setSaving(false);
    }
  };

  return <Shell active="projects"><header className="topbar"><div><p className="eyebrow">Administration / conservation projects</p><h1>Create conservation project</h1><p className="lede">Plan project activities, assign project members, and save a new conservation initiative with Planned status.</p></div></header>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}<div className="admin-layout species-layout"><section className="form-panel species-form"><div className="section-heading"><div><h2>Create project</h2><p className="muted">Set the project plan, assign project members, and save it as planned.</p></div></div><form onSubmit={submit}><div className="form-grid"><Field label="Project name"><input name="projectName" value={form.projectName} onChange={update} placeholder="Forest Recovery Initiative" required /></Field><Field label="Objective"><input name="objective" value={form.objective} onChange={update} placeholder="Protect endangered habitat" required /></Field><Field label="Start date"><input type="date" name="startDate" value={form.startDate} onChange={update} required /></Field><Field label="End date"><input type="date" name="endDate" value={form.endDate} onChange={update} required /></Field><Field label="Budget"><input type="number" min="0" name="budget" value={form.budget} onChange={update} placeholder="500000" /></Field><Field label="Project location" wide><input name="location" value={form.location} onChange={update} placeholder="Search or select a project location on the map" /><ResearchLocationPicker value={form.coordinates} onChange={selectProjectLocation} /><small className="field-help">Search or click the Leaflet map to fill the project location.</small></Field><Field label="Description" wide><textarea name="description" value={form.description} onChange={update} rows="4" placeholder="Describe the conservation objective and scope." /></Field><Field label="Add project activities" wide><textarea name="activities" value={form.activities} onChange={update} rows="5" placeholder="Monitoring patrols&#10;Habitat restoration&#10;Community awareness" /></Field><Field label="Select researchers" wide><select multiple value={form.assignedResearchers} onChange={(event) => updateMultiSelect(event, "assignedResearchers")}>{researchers.map((user) => <option key={user._id} value={user._id}>{user.name} · {user.email}</option>)}</select><small className="field-help">Select one or more researchers for this project.</small></Field><Field label="Select field officers" wide><select multiple value={form.assignedFieldOfficers} onChange={(event) => updateMultiSelect(event, "assignedFieldOfficers")}>{fieldOfficers.map((user) => <option key={user._id} value={user._id}>{user.name} · {user.email}</option>)}</select><small className="field-help">Select one or more field officers for this project.</small></Field></div><div className="form-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save project"}</button></div></form></section></div></Shell>;
}

function FieldOfficersPage() {
  return <TeamManagementPage role="field_officer" />;
}

function ResearchersPage() {
  return <TeamManagementPage role="researcher" />;
}

function TeamManagementPage({ role }) {
  const isResearcher = role === "researcher";
  const personLabel = isResearcher ? "researcher" : "field officer";
  const personLabelPlural = isResearcher ? "Researchers" : "Field officers";
  const collectionPath = isResearcher ? "/users/researchers" : "/users/field-officers";
  const emptyForm = { name: "", email: "", phone: "", password: "" };
  const [officers, setOfficers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  const loadOfficers = async () => {
    try {
      const response = await api.get(collectionPath);
      setOfficers(response.data.users || []);
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not load field officers.", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOfficers(); }, [collectionPath]);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };
  const editOfficer = (officer) => { setEditingId(officer._id || officer.id); setForm({ name: officer.name || "", email: officer.email || "", phone: officer.phone || "", password: "" }); setMessage({ text: "", error: false }); };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", error: false });
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, { name: form.name, email: form.email, phone: form.phone });
        setMessage({ text: `${personLabel} updated successfully.`, error: false });
      } else {
        await api.post(collectionPath, form);
        setMessage({ text: `${personLabel} created successfully.`, error: false });
      }
      resetForm();
      await loadOfficers();
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not save field officer.", error: true });
    } finally {
      setSaving(false);
    }
  };
  const toggleStatus = async (officer) => {
    const id = officer._id || officer.id;
    const nextStatus = officer.status === "active" ? "inactive" : "active";
    try {
      await api.patch(`/users/${id}/status`, { status: nextStatus });
      setMessage({ text: `${personLabel} marked ${nextStatus}.`, error: false });
      await loadOfficers();
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not change officer status.", error: true });
    }
  };

  const deleteOfficer = async (officer) => {
    const id = officer._id || officer.id;
    if (!window.confirm(`Delete ${officer.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage({ text: `${personLabel} deleted successfully.`, error: false });
      await loadOfficers();
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not delete field officer.", error: true });
    }
  };

  return <Shell active={isResearcher ? "researchers" : "officers"}><header className="topbar"><div><p className="eyebrow">Administration / team access</p><h1>{personLabelPlural}</h1><p className="lede">Create and manage the {personLabelPlural.toLowerCase()} who support conservation operations.</p></div></header><div className="admin-layout"><section className="form-panel officer-form"><div className="section-heading"><div><h2>{editingId ? `Update ${personLabel}` : `Create ${personLabel}`}</h2><p className="muted">{editingId ? "Update profile details. Passwords are unchanged." : "New accounts start active."}</p></div></div><form onSubmit={submit}><Field label="Full name"><input name="name" value={form.name} onChange={update} required /></Field><Field label="Email"><input type="email" name="email" value={form.email} onChange={update} required /></Field><Field label="Phone"><input name="phone" value={form.phone} onChange={update} /></Field>{!editingId && <Field label="Temporary password"><input type="password" name="password" value={form.password} onChange={update} minLength="6" required /></Field>}<div className="form-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : `Create ${personLabel}`}</button>{editingId && <button className="button button-secondary" type="button" onClick={resetForm}>Cancel</button>}</div></form></section><section className="officer-list"><div className="section-heading"><div><h2>Team directory</h2><p className="muted">{officers.length} {personLabel}{officers.length === 1 ? "" : "s"}</p></div></div>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}{loading ? <div className="loading-state">Loading {personLabelPlural.toLowerCase()}...</div> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead><tbody>{officers.map((officer) => <tr key={officer._id || officer.id}><td><strong>{officer.name}</strong><small>{personLabel}</small></td><td>{officer.email}<small>{officer.phone || "No phone added"}</small></td><td><span className={`status status-${officer.status}`}>{officer.status}</span></td><td><div className="action-row"><button className="text-button" onClick={() => editOfficer(officer)}>Edit</button><button className="text-button" onClick={() => toggleStatus(officer)}>{officer.status === "active" ? "Deactivate" : "Activate"}</button><button className="text-button danger-text" onClick={() => deleteOfficer(officer)}>Delete</button></div></td></tr>)}{!officers.length && <tr><td colSpan="4" className="empty-cell">No {personLabelPlural.toLowerCase()} yet.</td></tr>}</tbody></table></div>}</section></div></Shell>;
}
function HabitatManagementPage() {
  const emptyForm = { name: "", habitatType: "Forest", location: "", description: "", area: "", areaUnit: "sq_km", associatedSpecies: [], associatedSpeciesNames: "", threats: "", images: [] };
  const [form, setForm] = useState(emptyForm);
  const [habitats, setHabitats] = useState([]);
  const [species, setSpecies] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  const loadHabitats = async () => {
    try {
      const response = await api.get("/habitats");
      setHabitats(response.data.habitats || []);
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not load habitats.", error: true });
    }
  };

  const loadSpecies = async () => {
    try {
      const response = await api.get("/species");
      setSpecies(response.data.species || []);
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not load species.", error: true });
    }
  };

  useEffect(() => {
    loadHabitats();
    loadSpecies();
    const refreshTimer = window.setInterval(loadSpecies, 10000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    const handleHabitatLocationSelected = (event) => {
      const selection = event.detail;
      const coordinates = Array.isArray(selection?.coordinates) ? selection.coordinates : Array.isArray(selection) ? selection : null;
      const locationLabel = selection?.location || (coordinates ? `Latitude ${coordinates[1].toFixed(6)}, Longitude ${coordinates[0].toFixed(6)}` : "") || "";
      setForm((currentForm) => ({
        ...currentForm,
        ...(locationLabel ? { location: locationLabel } : {})
      }));
    };
    window.addEventListener("habitat-location-selected", handleHabitatLocationSelected);
    return () => window.removeEventListener("habitat-location-selected", handleHabitatLocationSelected);
  }, []);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", error: false });
    try {
      let uploadedImageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadResponse = await api.post("/habitats/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedImageUrl = uploadResponse.data.url || "";
      }

      const payload = {
        ...form,
        area: form.area ? Number(form.area) : undefined,
        associatedSpeciesNames: form.associatedSpeciesNames
          ? form.associatedSpeciesNames.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        threats: form.threats || undefined,
        images: uploadedImageUrl ? [uploadedImageUrl] : []
      };

      await api.post("/habitats", payload);
      setForm(emptyForm);
      setImageFile(null);
      setMessage({ text: "Habitat created successfully. Status: Active", error: false });
      await loadHabitats();
    } catch (requestError) {
      setMessage({ text: requestError.response?.data?.message || "Could not create habitat.", error: true });
    } finally {
      setSaving(false);
    }
  };

  return <Shell active="habitats"><header className="topbar"><div><p className="eyebrow">Administration / habitat register</p><h1>Habitat management</h1><p className="lede">Create active habitats that researchers can select in their observations.</p></div></header>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}<div className="admin-layout habitat-layout"><section className="form-panel officer-form"><div className="section-heading"><div><h2>Add habitat</h2><p className="muted">New habitats are active immediately.</p></div></div><form onSubmit={submit}><Field label="Habitat name"><input name="name" value={form.name} onChange={update} required /></Field><Field label="Habitat type"><select name="habitatType" value={form.habitatType} onChange={update}>{["Forest", "Grassland", "Wetland", "Mangrove", "Desert", "Mountain", "Coastal", "River", "Other"].map((type) => <option key={type}>{type}</option>)}</select></Field><Field label="Location" wide><input name="location" value={form.location} onChange={update} required placeholder="Select a location on the map" /><span>Choose exact location on map</span><ResearchLocationPicker value={null} onChange={(selection) => {
  const coordinates = Array.isArray(selection?.coordinates) ? selection.coordinates : Array.isArray(selection) ? selection : null;
  const locationLabel = selection?.location || (coordinates ? `Latitude ${coordinates[1].toFixed(6)}, Longitude ${coordinates[0].toFixed(6)}` : "");
  window.dispatchEvent(new CustomEvent("habitat-location-selected", { detail: selection }));
  setForm((currentForm) => ({ ...currentForm, ...(locationLabel ? { location: locationLabel } : {}) }));
}} /></Field><Field label="Description" wide><textarea name="description" value={form.description} onChange={update} rows="4" /></Field><div className="form-grid"><Field label="Area"><input type="number" min="0" step="any" name="area" value={form.area} onChange={update} /></Field><Field label="Area unit"><select name="areaUnit" value={form.areaUnit} onChange={update}><option value="sq_km">Square kilometres</option><option value="hectare">Hectares</option><option value="acre">Acres</option></select></Field></div><Field label="Threats"><input name="threats" value={form.threats} onChange={update} placeholder="Poaching, deforestation" /></Field><Field label="Habitat image upload" wide><input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /></Field><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save habitat"}</button></form></section><section className="officer-list"><div className="section-heading"><div><h2>Active habitats</h2><p className="muted">{habitats.length} habitat{habitats.length === 1 ? "" : "s"}</p></div></div><div className="resource-list">{habitats.map((habitat) => <article className="resource-item" key={habitat._id}><div className="resource-icon">HB</div><div><strong>{habitat.name}</strong><p>{habitat.habitatType} · {habitat.location}</p></div><span className="status status-active">active</span></article>)}{!habitats.length && <p className="muted">No habitats created yet.</p>}</div></section></div></Shell>;
}

function ResourceList({ title, items, type, empty }) { return <section className="resource-panel"><div className="section-heading"><h2>{title}</h2><span className="count-pill">{items.length}</span></div><div className="resource-list">{items.slice(0, 5).map((item) => <article className="resource-item" key={item._id}><div className="resource-icon">{type === "species" ? "SP" : "HB"}</div><div><strong>{type === "species" ? item.commonName : item.name}</strong><p>{type === "species" ? item.scientificName : `${item.habitatType} · ${item.location}`}</p></div><span className="status status-active">active</span></article>)}{!items.length && <p className="muted">{empty}</p>}</div></section>; }

function ReportPage() { return <Shell active="report"><header className="topbar"><div><p className="eyebrow">Field input</p><h1>Report activity</h1><p className="lede">Submit a sighting or incident directly to the conservation team.</p></div></header><ReportForm /></Shell>; }

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setError(""); try { const response = await api.post("/auth/register", form); login(response.data); navigate("/dashboard"); } catch (requestError) { setError(requestError.response?.data?.message || "Registration failed."); } };
  return <div className="auth-page"><div className="auth-card"><Link className="brand auth-brand" to="/login"><span className="brand-mark">W</span><span>WildTrace</span></Link><p className="eyebrow">Community access</p><h1>Create your account</h1><p className="lede">Join the conservation network as a public user.</p>{error && <div className="notice error">{error}</div>}<form onSubmit={submit}><Field label="Name"><input name="name" value={form.name} onChange={update} required /></Field><Field label="Email"><input type="email" name="email" value={form.email} onChange={update} required /></Field><Field label="Phone"><input name="phone" value={form.phone} onChange={update} /></Field><Field label="Password"><input type="password" name="password" value={form.password} onChange={update} minLength="6" required /></Field><button className="button button-primary" type="submit">Create account</button></form><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></div></div>;
}
function ReportForm() {
  const [kind, setKind] = useState("sighting");
  const [species, setSpecies] = useState([]);
  const [form, setForm] = useState({ species: "", sightingDate: new Date().toISOString().slice(0, 10), location: "", longitude: "", latitude: "", animalCount: 1, condition: "Unknown", incidentType: "other", title: "", description: "", severity: "medium" });
  const [message, setMessage] = useState({ text: "", error: false });
  useEffect(() => { api.get("/species").then((response) => setSpecies(response.data.species || [])).catch(() => setSpecies([])); }, []);
  useEffect(() => {
    const handleMapLocationSelected = (event) => {
      const selection = event.detail;
      const coordinates = selection.coordinates || selection;
      setForm((currentForm) => ({
        ...currentForm,
        longitude: String(coordinates[0]),
        latitude: String(coordinates[1]),
        ...(selection.location ? { location: selection.location } : {})
      }));
    };
    window.addEventListener("public-location-selected", handleMapLocationSelected);
    return () => window.removeEventListener("public-location-selected", handleMapLocationSelected);
  }, []);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setMessage({ text: "", error: false }); const coordinates = [Number(form.longitude), Number(form.latitude)]; const body = kind === "sighting" ? { species: form.species, sightingDate: form.sightingDate, location: form.location, coordinates, animalCount: Number(form.animalCount), condition: form.condition } : { incidentType: form.incidentType, title: form.title, description: form.description, location: form.location, coordinates, severity: form.severity }; try { await api.post(kind === "sighting" ? "/sightings" : "/incidents", body); setMessage({ text: `${kind === "sighting" ? "Sighting" : "Incident"} submitted for review.`, error: false }); } catch (requestError) { setMessage({ text: requestError.response?.data?.message || "Submission failed.", error: true }); } };
  return <section className="form-panel"><div className="segmented"><button className={kind === "sighting" ? "selected" : ""} onClick={() => setKind("sighting")}>Wildlife sighting</button><button className={kind === "incident" ? "selected" : ""} onClick={() => setKind("incident")}>Conservation incident</button></div><form onSubmit={submit}><div className="form-grid">{kind === "sighting" ? <><Field label="Species"><select name="species" value={form.species} onChange={update} required><option value="">Select species</option>{species.map((item) => <option key={item._id} value={item._id}>{item.commonName}</option>)}</select></Field><Field label="Date"><input type="date" name="sightingDate" value={form.sightingDate} onChange={update} required /></Field><Field label="Animal count"><input type="number" min="1" name="animalCount" value={form.animalCount} onChange={update} required /></Field><Field label="Condition"><select name="condition" value={form.condition} onChange={update}><option>Healthy</option><option>Injured</option><option>Sick</option><option>Dead</option><option>Unknown</option></select></Field></> : <><Field label="Incident type"><select name="incidentType" value={form.incidentType} onChange={update}>{["poaching", "forest_fire", "animal_injury", "illegal_hunting", "animal_death", "habitat_destruction", "human_wildlife_conflict", "other"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Severity"><select name="severity" value={form.severity} onChange={update}><option>low</option><option>medium</option><option>high</option><option>critical</option></select></Field><Field label="Title" wide><input name="title" value={form.title} onChange={update} required /></Field><Field label="Description" wide><textarea name="description" value={form.description} onChange={update} required rows="4" /></Field></>}</div><Field label="Location" wide><input name="location" value={form.location} onChange={update} placeholder="Reserve, village, or landmark" required /></Field><div className="coordinate-grid"><Field label="Longitude"><input type="number" step="any" name="longitude" value={form.longitude} onChange={update} placeholder="78.9629" required /></Field><Field label="Latitude"><input type="number" step="any" name="latitude" value={form.latitude} onChange={update} placeholder="20.5937" required /></Field></div>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}<button className="button button-primary" type="submit">Submit {kind}</button></form></section>;
}

function Field({ label, children, wide = false }) {
  const showResearchMap = label === "Location" && window.location.pathname === "/research";
  const showPublicMap = label === "Location" && window.location.pathname === "/report";
  const locationInput = showResearchMap && children?.type === "input"
    ? cloneElement(children, {
      onBlur: async (event) => {
        children.props.onBlur?.(event);
        if (!event.target.value.trim()) return;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(event.target.value.trim())}`, { headers: { Accept: "application/json" } });
          const results = await response.json();
          if (results.length) {
            window.dispatchEvent(new CustomEvent("research-location-selected", { detail: [Number(results[0].lon), Number(results[0].lat)] }));
          }
        } catch { /* Submission performs a second validation if geocoding is unavailable. */ }
      }
    })
    : children;
  return <label className={wide ? "field wide" : "field"}><span>{label}</span>{locationInput}{(showResearchMap || showPublicMap) && <><span>Choose exact location on map</span><ResearchLocationPicker value={null} onChange={(selection) => window.dispatchEvent(new CustomEvent(showPublicMap ? "public-location-selected" : "research-location-selected", { detail: selection }))} /></>}</label>;
}

function ResearchPage() {
  const emptyForm = { title: "", project: "", species: [], habitats: [], observationDate: new Date().toISOString().slice(0, 10), location: "", coordinates: null, methodology: "", observation: "", findings: "", conclusion: "", recommendations: "" };
  const [research, setResearch] = useState([]);
  const [projects, setProjects] = useState([]);
  const [species, setSpecies] = useState([]);
  const [habitats, setHabitats] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  const loadData = async () => {
    const responses = await Promise.allSettled([api.get("/research/my"), api.get("/species"), api.get("/habitats"), api.get("/projects/my/researcher")]);
    const [researchResponse, speciesResponse, habitatResponse, projectResponse] = responses;
    if (researchResponse.status === "fulfilled") setResearch(researchResponse.value.data.research || []);
    if (speciesResponse.status === "fulfilled") setSpecies(speciesResponse.value.data.species || []);
    if (habitatResponse.status === "fulfilled") setHabitats(habitatResponse.value.data.habitats || []);
    if (projectResponse.status === "fulfilled") setProjects(projectResponse.value.data.projects || []);
    const failedResponse = responses.find((response) => response.status === "rejected");
    if (failedResponse) setMessage({ text: failedResponse.reason.response?.data?.message || "Could not load all research data. Check that the backend is running.", error: true });
    setLoading(false);
  };

  useEffect(() => {
    const handleLocationSelected = (event) => {
      const selection = event.detail;
      setForm((currentForm) => ({
        ...currentForm,
        coordinates: selection.coordinates || selection,
        ...(selection.location ? { location: selection.location } : {})
      }));
    };
    window.addEventListener("research-location-selected", handleLocationSelected);
    loadData();
    const refreshTimer = window.setInterval(loadData, 10000);
    return () => {
      window.removeEventListener("research-location-selected", handleLocationSelected);
      window.clearInterval(refreshTimer);
    };
  }, []);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const updateMultiSelect = (event) => setForm({ ...form, [event.target.name]: Array.from(event.target.selectedOptions, (option) => option.value) });
  const resetForm = () => { setForm(emptyForm); setFiles([]); };

  const resolveCoordinates = async () => {
    if (form.coordinates?.length === 2) {
      return form.coordinates;
    }

    if (!form.location.trim()) {
      throw new Error("Please enter a location or select one on the map.");
    }

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(form.location.trim())}`, {
      headers: { Accept: "application/json" }
    });
    const results = await response.json();

    if (!results.length) {
      throw new Error("Location was not found. Select the location directly on the map.");
    }

    return [Number(results[0].lon), Number(results[0].lat)];
  };

  const submit = async (event, status) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", error: false });
    try {
      const coordinates = await resolveCoordinates();
      const attachments = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file.`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is larger than the 5 MB upload limit.`);
        }
        const uploadData = new FormData();
        uploadData.append("file", file);
        const response = await api.post("/research/attachments", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
        attachments.push(response.data.url);
      }
      await api.post("/research", { ...form, coordinates, attachments, status });
      setMessage({ text: `Research observation saved as ${status}.`, error: false });
      resetForm();
      await loadData();
    } catch (requestError) {
      const failedStep = files.length && requestError.config?.url?.includes("/attachments") ? "upload research photos" : "save this observation";
      setMessage({ text: requestError.response?.data?.message || requestError.message || `Could not ${failedStep}. Check the backend connection and try again.`, error: true });
    } finally {
      setSaving(false);
    }
  };

  return <Shell active="research"><header className="topbar"><div><p className="eyebrow">Research workspace</p><h1>Research log</h1><p className="lede">Select an existing species, document your observation, and attach field photos.</p></div></header>{message.text && <div className={`notice ${message.error ? "error" : "success"}`}>{message.text}</div>}<div className="research-layout"><section className="form-panel research-form"><div className="section-heading"><div><h2>New observation</h2><p className="muted">Species records are managed by administrators.</p></div></div><form onSubmit={(event) => submit(event, "draft")}><div className="form-grid"><Field label="Title" wide><input name="title" value={form.title} onChange={update} placeholder="Wetland bird survey" required /></Field><Field label="Species"><select name="species" multiple value={form.species} onChange={updateMultiSelect} required>{species.map((item) => <option key={item._id} value={item._id}>{item.commonName} · {item.scientificName}</option>)}</select><small className="field-help">Use Ctrl/Cmd to select multiple species.</small></Field><Field label="Habitat"><select name="habitats" multiple value={form.habitats} onChange={updateMultiSelect}>{habitats.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></Field><Field label="Observation date"><input type="date" name="observationDate" value={form.observationDate} onChange={update} required /></Field><Field label="Location"><input name="location" value={form.location} onChange={update} placeholder="Reserve or field site" required /></Field><Field label="Methodology" wide><textarea name="methodology" value={form.methodology} onChange={update} rows="3" placeholder="Transect, camera trap, interview..." /></Field><Field label="Observation" wide><textarea name="observation" value={form.observation} onChange={update} rows="4" required /></Field><Field label="Findings"><textarea name="findings" value={form.findings} onChange={update} rows="3" /></Field><Field label="Conclusion"><textarea name="conclusion" value={form.conclusion} onChange={update} rows="3" /></Field><Field label="Recommendations" wide><textarea name="recommendations" value={form.recommendations} onChange={update} rows="3" /></Field><Field label="Research photos" wide><input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} /><small className="field-help">Photos are stored on this research observation and do not change the species record.</small>{files.length > 0 && <span className="file-summary">{files.length} photo{files.length === 1 ? "" : "s"} ready to upload</span>}</Field></div><div className="form-actions research-actions"><button className="button button-secondary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save draft"}</button><button className="button button-primary" type="button" disabled={saving} onClick={(event) => submit(event, "completed")}>{saving ? "Uploading..." : "Complete observation"}</button></div></form></section><section className="section-block research-history"><div className="section-heading"><div><h2>My observations</h2><p className="muted">{research.length} record{research.length === 1 ? "" : "s"}</p></div></div>{loading ? <div className="loading-state">Loading observations...</div> : <div className="project-list">{research.map((item) => <article className="project-row" key={item._id}><div><strong>{item.title}</strong><p>{item.location} · {new Date(item.observationDate).toLocaleDateString()} · {item.species?.map((itemSpecies) => itemSpecies.commonName).join(", ") || "No species"}</p></div><span className={`status status-${item.status}`}>{item.status}</span></article>)}{!research.length && <p className="muted research-empty">No research observations yet. Create the first record above.</p>}</div>}</section></div></Shell>;
}

export default App;
