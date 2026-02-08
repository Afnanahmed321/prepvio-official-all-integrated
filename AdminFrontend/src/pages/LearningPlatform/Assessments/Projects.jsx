import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Edit, Loader2, BookOpen, Clock, Layers, Sparkles, X, ChevronRight, Home, Search, Target, Briefcase, FileText, Filter, AlertCircle, Save, RefreshCw, Server } from "lucide-react";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";

const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [currentEditItem, setCurrentEditItem] = useState(null);
    const [selectedFilterCourse, setSelectedFilterCourse] = useState("all");
    const [connectionError, setConnectionError] = useState(false);

    // Delete Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        difficulty: "Medium",
        estimatedTime: "",
        xp: 0,
        tech: "",
        description: "",
        thumbnail: "",
        unlocks: "",
        rating: 0,
        completionRate: 0,
        impact: "",
        milestones: "",
        color: "",
        order: 0,
        courseId: ""
    });

    const API_URL = "http://localhost:8000/api/projects";
    const COURSES_URL = "http://localhost:8000/api/courses";

    useEffect(() => {
        fetchProjects();
        fetchCourses();
    }, []);

    const fetchProjects = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        setConnectionError(false);

        try {
            const res = await axios.get(API_URL, { timeout: 5000 });
            setProjects(Array.isArray(res.data) ? res.data : []);
            setConnectionError(false);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
                setConnectionError(true);
                setError("Cannot connect to server. Please ensure the backend is running on http://localhost:8000");
            } else {
                setError(err.response?.data?.message || "Failed to fetch projects");
            }
            setProjects([]);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(COURSES_URL, { timeout: 5000 });
            setCourses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch courses:", err);
            setCourses([]);
        }
    };

    const handleRetry = () => {
        fetchProjects();
        fetchCourses();
    };

    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        setCurrentEditItem(item);
        if (item) {
            setFormData({
                title: item.title || "",
                difficulty: item.difficulty || "Medium",
                estimatedTime: item.estimatedTime || "",
                xp: item.xp || 0,
                tech: Array.isArray(item.tech) ? item.tech.join(", ") : "",
                description: item.description || "",
                thumbnail: item.thumbnail || "",
                unlocks: Array.isArray(item.unlocks) ? item.unlocks.join(", ") : "",
                rating: item.rating || 0,
                completionRate: item.completionRate || 0,
                impact: item.impact || "",
                milestones: Array.isArray(item.milestones) ? item.milestones.join("\n") : "",
                color: item.color || "",
                order: item.order || 0,
                courseId: item.courseId || ""
            });
        } else {
            setFormData({
                title: "",
                difficulty: "Medium",
                estimatedTime: "",
                xp: 0,
                tech: "",
                description: "",
                thumbnail: "",
                unlocks: "",
                rating: 0,
                completionRate: 0,
                impact: "",
                milestones: "",
                color: "",
                order: projects.length + 1, // Corrected to use projects.length + 1
                courseId: courses.length > 0 ? courses[0]._id : ""
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentEditItem(null);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        setActionLoading(true);
        setError(null);

        const itemData = {
            ...formData,
            xp: Number(formData.xp),
            rating: Number(formData.rating),
            completionRate: Number(formData.completionRate),
            order: Number(formData.order),
            tech: formData.tech.split(",").map(t => t.trim()).filter(t => t),
            unlocks: formData.unlocks.split(",").map(u => Number(u.trim())).filter(u => !isNaN(u)),
            milestones: formData.milestones.split("\n").map(m => m.trim()).filter(m => m)
        };

        try {
            if (modalType === "add") {
                await axios.post(API_URL, itemData);
            } else {
                await axios.put(`${API_URL}/${currentEditItem._id}`, itemData);
            }
            handleCloseModal();
            await fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${modalType} project`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = (project) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return;
        setIsDeleting(true);
        setError(null);
        try {
            await axios.delete(`${API_URL}/${projectToDelete._id}`);
            await fetchProjects(true);
        } catch (err) {
            setError("Failed to delete project");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };

    const filteredProjects = projects.filter(p =>
        selectedFilterCourse === "all" || p.courseId === selectedFilterCourse
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Project Maps</h1>
                                <p className="text-slate-500 font-medium text-sm mt-1">Manage project-based learning roadmaps</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Filter */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Filter className="w-4 h-4 text-slate-400" />
                                </div>
                                <select
                                    value={selectedFilterCourse}
                                    onChange={(e) => setSelectedFilterCourse(e.target.value)}
                                    className="pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer hover:bg-white"
                                    disabled={connectionError}
                                >
                                    <option value="all">All Courses</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => handleOpenModal("add")}
                                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={connectionError}
                            >
                                <Plus className="w-5 h-5" />
                                <span>New Project</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Notification */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl shadow-sm flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Connection Error State */}
                {connectionError ? (
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="flex flex-col items-center justify-center py-32 gap-6 px-8">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-100">
                                <Server className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-slate-800">Connection Failed</h3>
                                <p className="text-slate-600 font-medium max-w-md">
                                    Unable to connect to the backend server. Please ensure:
                                </p>
                                <ul className="text-sm text-slate-500 space-y-1 mt-4 text-left max-w-md mx-auto">
                                    <li className="flex items-start gap-2">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        <span>The backend server is running on <code className="px-2 py-0.5 bg-slate-100 rounded font-mono text-xs">http://localhost:8000</code></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        <span>CORS is properly configured</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        <span>Database connection is active</span>
                                    </li>
                                </ul>
                            </div>
                            <button
                                onClick={handleRetry}
                                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold active:scale-95 mt-4"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Retry Connection
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Projects Table/List */
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                                <p className="text-slate-500 font-semibold animate-pulse">Loading projects...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Order</th>
                                            <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Project</th>
                                            <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Details</th>
                                            <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Tech Stack</th>
                                            <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {filteredProjects.length > 0 ? (
                                            filteredProjects.map((project) => (
                                                <tr key={project._id} className="group hover:bg-slate-50/80 transition-all duration-200">
                                                    <td className="px-8 py-6 whitespace-nowrap">
                                                        <div className="flex flex-col items-center w-8">
                                                            <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md shadow-slate-200">
                                                                {project.order}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold mt-1 text-center leading-tight">
                                                                of {courses.find(c => c._id === project.courseId)?.totalLevels || "8"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-16 h-16 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                                <img
                                                                    src={project.thumbnail}
                                                                    alt={project.title}
                                                                    className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-100"
                                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Project"; }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="text-base font-bold text-slate-800 line-clamp-1">{project.title}</div>
                                                                <div className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                                                                    <Clock className="w-3 h-3" /> {project.estimatedTime}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 whitespace-nowrap">
                                                        <div className="flex flex-col gap-2 items-start">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${project.difficulty === 'Hard' ? 'bg-orange-500' :
                                                                project.difficulty === 'Expert' ? 'bg-red-500' :
                                                                    project.difficulty === 'Final Boss' ? 'bg-purple-600' : 'bg-emerald-500'
                                                                }`}>
                                                                {project.difficulty}
                                                            </span>
                                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1">
                                                                <Sparkles className="w-3 h-3" /> {project.xp} XP
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm text-slate-600 max-w-xs">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {project.tech && project.tech.map((t, i) => (
                                                                <span key={i} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenModal("edit", project)}
                                                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(project)}
                                                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-20">
                                                    <div className="flex flex-col items-center justify-center opacity-50">
                                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                            <Briefcase className="w-8 h-8 text-slate-400" />
                                                        </div>
                                                        <p className="text-slate-500 font-medium">No projects found.</p>
                                                        <p className="text-slate-400 text-sm">Create a new project map to get started.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 relative shadow-2xl border border-white/50 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {modalType === "add" ? "Create New Project" : "Edit Project Details"}
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">Define the project requirements and rewards.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="admin-input-premium" placeholder="e.g. AI SaaS Platform" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Difficulty</label>
                                            <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="admin-input-premium">
                                                <option>Easy</option>
                                                <option>Medium</option>
                                                <option>Hard</option>
                                                <option>Expert</option>
                                                <option>Final Boss</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                                Level (Total: {courses.find(c => c._id === formData.courseId)?.totalLevels || "8"})
                                            </label>
                                            <input type="number" name="order" value={formData.order} onChange={handleInputChange} className="admin-input-premium" required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Estimated Time</label>
                                            <input type="text" name="estimatedTime" value={formData.estimatedTime} onChange={handleInputChange} className="admin-input-premium" placeholder="e.g. 10-12 hours" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">XP Reward</label>
                                            <input type="number" name="xp" value={formData.xp} onChange={handleInputChange} className="admin-input-premium" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tech Stack</label>
                                        <input type="text" name="tech" value={formData.tech} onChange={handleInputChange} className="admin-input-premium" placeholder="React, Node.js, Typescript" required />
                                        <p className="text-xs text-slate-400 mt-1.5 ml-1">Comma separated technologies.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thumbnail URL</label>
                                        <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleInputChange} className="admin-input-premium" placeholder="https://..." required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Assign to Course</label>
                                        <select name="courseId" value={formData.courseId} onChange={handleInputChange} className="admin-input-premium" required>
                                            <option value="">Select a course</option>
                                            {courses.map(course => (
                                                <option key={course._id} value={course._id}>{course.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="admin-input-premium resize-none" placeholder="Project overview and learning goals..." required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Impact</label>
                                        <input type="text" name="impact" value={formData.impact} onChange={handleInputChange} className="admin-input-premium" placeholder="e.g. High Portfolio Value" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Avg Rating</label>
                                            <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleInputChange} className="admin-input-premium" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Completion %</label>
                                            <input type="number" name="completionRate" value={formData.completionRate} onChange={handleInputChange} className="admin-input-premium" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unlocks Projects (IDs)</label>
                                        <input type="text" name="unlocks" value={formData.unlocks} onChange={handleInputChange} className="admin-input-premium" placeholder="e.g. 4, 5" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Milestones</label>
                                        <textarea name="milestones" value={formData.milestones} onChange={handleInputChange} rows="4" className="admin-input-premium resize-none font-mono text-xs" placeholder="Setup Environment&#10;Build Core API&#10;Implement UI" />
                                        <p className="text-xs text-slate-400 mt-1.5 ml-1">One milestone per line.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200" disabled={actionLoading}>
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {modalType === "add" ? "Create Project" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                .admin-input-premium {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background-color: #f8fafc;
                    border: 2px solid #e2e8f0;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #334155;
                    transition: all 0.2s;
                    outline: none;
                }
                .admin-input-premium:focus {
                    background-color: #ffffff;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    color: #0f172a;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default ProjectManagement;