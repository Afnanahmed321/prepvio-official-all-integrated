import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  Briefcase, 
  Type, 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon,
  X,
  ExternalLink,
  Layers,
  Sparkles
} from "lucide-react";

/**
 * INTERNAL COMPONENT: ServiceThumbnail
 * Handles the automatic cycling "animation" for services with multiple images
 */
const ServiceThumbnail = ({ images, icon }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000); // Cycle every 3 seconds
      return () => clearInterval(interval);
    }
  }, [images]);

  if (images && images.length > 0) {
    return (
      <div className="relative w-14 h-14 overflow-hidden rounded-2xl shadow-md border-2 border-white/80 group-hover:shadow-indigo-200/50 transition-all duration-500">
        <img 
          src={images[currentIndex]} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-in-out"
          onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Error"; }}
        />
        {images.length > 1 && (
          <div className="absolute bottom-1 right-1 flex gap-0.5">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-2' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
        {images.length > 1 && (
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-pulse">
            {images.length}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-white group-hover:bg-indigo-50 transition-colors shadow-sm">
      {icon || <ImageIcon className="w-6 h-6 text-slate-300" />}
    </div>
  );
};

/**
 * INTERNAL COMPONENT: Modal
 * Glassy modal overlay for service forms
 */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-md z-50 p-4 animate-in fade-in duration-300">
    <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-8 md:p-10 w-full max-w-xl border border-white/50 transform animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{title}</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
          <X className="w-7 h-7" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

/**
 * MAIN COMPONENT: ServiceManagement
 */
const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentEditItem, setCurrentEditItem] = useState(null);
  
  const [itemData, setItemData] = useState({ 
    title: '', 
    description: '', 
    slug: '',
    image: '',
    images: [],
    icon: ''
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  const API_URL = 'http://localhost:8000/api/services';

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setServices(response.data || []);
    } catch (err) {
      setError('Failed to fetch services. Ensure your backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setCurrentEditItem(item);
    if (item) {
      setItemData({ 
        title: item.title || '', 
        description: item.description || '', 
        slug: item.slug || '',
        image: item.image || '',
        images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
        icon: item.icon || ''
      });
    } else {
      setItemData({ 
        title: '', 
        description: '', 
        slug: '',
        image: '',
        images: [],
        icon: ''
      });
    }
    setNewImageUrl('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentEditItem(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData(prevData => {
      const newData = { ...prevData, [name]: value };
      if (name === 'title') {
        newData.slug = value.toLowerCase().trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '');
      }
      return newData;
    });
  };

  const addImageToArray = () => {
    const url = newImageUrl.trim();
    if (url) {
      if (!url.startsWith('http')) {
        alert("Please enter a valid URL starting with http:// or https://");
        return;
      }
      setItemData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setItemData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!itemData.title.trim()) return;

    setActionLoading(true);
    setError(null);
    try {
      const payload = { ...itemData, image: itemData.images[0] || '' };
      if (modalType === 'add') {
        await axios.post(API_URL, payload);
      } else {
        await axios.put(`${API_URL}/${currentEditItem._id}`, payload);
      }
      handleCloseModal();
      await fetchServices();
    } catch (err) {
      setError(`Failed to ${modalType} service. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent Action: Delete this service?")) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchServices();
    } catch (err) {
      setError('Delete failed. The resource might already be gone.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-slate-100 to-blue-300 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-600 p-4 rounded-[1.5rem] shadow-xl shadow-indigo-200/50 rotate-3">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Service Hub</h1>
              <p className="text-slate-500 font-semibold tracking-wide">Manage agency offerings and visual galleries</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal('add')} 
            className="group flex items-center space-x-2 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all duration-300 font-bold active:scale-95 shadow-xl"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>New Service</span>
          </button>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-white/60 backdrop-blur-md border border-red-200 text-red-600 rounded-3xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            <span className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> {error}</span>
            <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-900 transition-colors">✕</button>
          </div>
        )}

        {/* Main List Card */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/50 p-6 md:p-12">
          {loading && services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
              <p className="text-slate-400 font-black text-xl tracking-tighter animate-pulse uppercase">Syncing Database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200/30">
                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Animated Preview</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Title & Description</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">URL Handle</th>
                    <th className="px-6 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.length > 0 ? (
                    services.map(service => (
                      <tr key={service._id} className="group hover:bg-white/40 transition-all duration-300 rounded-2xl">
                        <td className="px-6 py-8 whitespace-nowrap">
                          <ServiceThumbnail 
                            images={Array.isArray(service.images) ? service.images : (service.image ? [service.image] : [])} 
                            icon={service.icon} 
                          />
                        </td>
                        <td className="px-6 py-8 max-w-sm">
                          <span className="block text-2xl font-black text-slate-800 tracking-tighter group-hover:text-indigo-600 transition-colors">{service.title}</span>
                          <span className="text-sm text-slate-400 font-medium line-clamp-1 mt-1 leading-relaxed italic">{service.description}</span>
                        </td>
                        <td className="px-6 py-8">
                          <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl w-fit border border-white shadow-sm">
                            <LinkIcon className="w-3 h-3 text-indigo-400" />
                            <code className="text-xs text-indigo-600 font-mono font-black tracking-tighter italic">/{service.slug}</code>
                          </div>
                        </td>
                        <td className="px-6 py-8 whitespace-nowrap text-right">
                          <div className="flex justify-end items-center space-x-3">
                            <button 
                              onClick={() => handleOpenModal('edit', service)} 
                              className="p-3.5 bg-white text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-md active:scale-90"
                              title="Edit Details"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(service._id)} 
                              className="p-3.5 bg-white text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-md active:scale-90"
                              title="Delete Service"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-32">
                        <div className="bg-slate-100/50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-white">
                          <Layers className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">No Active Services</h3>
                        <p className="text-slate-400 mt-2 font-bold max-w-xs mx-auto">Start building your agency presence by adding a service above.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Glassy Modal */}
      {modalOpen && (
        <Modal 
          title={modalType === 'add' ? 'Register New Service' : 'Refine Service Profile'} 
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Service Title</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      type="text" 
                      name="title" 
                      value={itemData.title} 
                      onChange={handleChange} 
                      placeholder="e.g. Brand Design"
                      className="w-full border-2 border-slate-100 rounded-[1.25rem] p-4 pl-12 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-slate-50 font-bold" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Symbol (Emoji)</label>
                  <input 
                    type="text" 
                    name="icon" 
                    value={itemData.icon} 
                    onChange={handleChange} 
                    placeholder="✨"
                    className="w-full border-2 border-slate-100 rounded-[1.25rem] p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-slate-50 font-black text-center text-xl" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-slate-300 w-5 h-5" />
                  <textarea 
                    name="description" 
                    value={itemData.description} 
                    onChange={handleChange} 
                    rows="3" 
                    placeholder="Outline your process and value..."
                    className="w-full border-2 border-slate-100 rounded-[1.25rem] p-4 pl-12 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-slate-50 font-medium resize-none leading-relaxed" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Permanent Handle</label>
                <div className="flex items-center gap-2 bg-indigo-50 p-4 rounded-[1.25rem] border-2 border-indigo-100/50 font-mono text-xs text-indigo-400 font-black">
                   <Sparkles size={14} className="animate-pulse" />
                   <span>/services/</span>
                   <span className="text-indigo-700">{itemData.slug || "slug-preview"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Visual Gallery (URLs)</label>
                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" 
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 border-2 border-slate-100 rounded-[1.25rem] p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-slate-50 text-sm font-semibold"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageToArray();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addImageToArray}
                    className="px-8 bg-slate-900 text-white rounded-[1.25rem] font-black hover:bg-indigo-600 transition-all shadow-lg active:scale-95 text-sm"
                  >
                    Add Link
                  </button>
                </div>
                
                {itemData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 bg-slate-100/30 p-5 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
                    {itemData.images.map((img, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img src={img} alt="" className="h-full w-full object-cover rounded-[1.25rem] shadow-sm border border-white" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.75rem] hover:bg-slate-200 transition-all font-black text-sm uppercase tracking-widest active:scale-95"
              >
                Discard
              </button>
              <button 
                type="submit" 
                disabled={actionLoading}
                className="flex-[2] py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-[1.75rem] hover:shadow-2xl hover:shadow-indigo-200 hover:scale-[1.02] transition-all duration-300 font-black text-sm uppercase tracking-widest active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {modalType === 'add' ? 'Confirm Launch' : 'Push Updates'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ServiceManagement;





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
// import Modal from './Modal';

// const ServiceManagement = () => {
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalType, setModalType] = useState('add');
//   const [currentEditItem, setCurrentEditItem] = useState(null);
//   const [itemData, setItemData] = useState({ 
//     title: '', 
//     description: '', 
//     slug: '',
//     image: '',
//     images: [],
//     icon: ''
//   });
//   const [newImageUrl, setNewImageUrl] = useState('');

//   const API_URL = 'http://localhost:8000/api/services';

//   const fetchServices = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(API_URL);
//       setServices(response.data);
//     } catch (err) {
//       setError('Failed to fetch services');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchServices();
//   }, []);

//   const handleOpenModal = (type, item = null) => {
//     setModalType(type);
//     setCurrentEditItem(item);
//     if (item) {
//       setItemData({ 
//         title: item.title, 
//         description: item.description, 
//         slug: item.slug,
//         image: item.image || '',
//         images: item.images || [],
//         icon: item.icon || ''
//       });
//     } else {
//       setItemData({ 
//         title: '', 
//         description: '', 
//         slug: '',
//         image: '',
//         images: [],
//         icon: ''
//       });
//     }
//     setNewImageUrl('');
//     setModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setCurrentEditItem(null);
//     setItemData({ 
//       title: '', 
//       description: '', 
//       slug: '',
//       image: '',
//       images: [],
//       icon: ''
//     });
//     setNewImageUrl('');
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setItemData(prevData => {
//       const newData = { ...prevData, [name]: value };
//       if (name === 'title') {
//         newData.slug = value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
//       }
//       return newData;
//     });
//   };

//   const addImageToArray = () => {
//     if (newImageUrl.trim()) {
//       setItemData(prev => ({
//         ...prev,
//         images: [...prev.images, newImageUrl.trim()]
//       }));
//       setNewImageUrl('');
//     }
//   };

//   const removeImage = (index) => {
//     setItemData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index)
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       if (modalType === 'add') {
//         await axios.post(API_URL, itemData);
//       } else {
//         await axios.put(`${API_URL}/${currentEditItem._id}`, itemData);
//       }
//       handleCloseModal();
//       fetchServices();
//     } catch (err) {
//       setError(`Failed to ${modalType} service`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this service?")) return;
//     setLoading(true);
//     setError(null);
//     try {
//       await axios.delete(`${API_URL}/${id}`);
//       fetchServices();
//     } catch (err) {
//       setError('Failed to delete service');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <p className="text-center text-gray-500">Loading services...</p>;
//   if (error) return <p className="text-center text-red-500">Error: {error}</p>;

//   return (
//     <div>
//       <div className="flex justify-end mb-4">
//         <button 
//           onClick={() => handleOpenModal('add')} 
//           className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
//         >
//           <FaPlus />
//           <span>Add New Service</span>
//         </button>
//       </div>
      
//       <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {services.length > 0 ? (
//               services.map(service => (
//                 <tr key={service._id}>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {service.images && service.images.length > 0 ? (
//                       <div className="flex items-center space-x-1">
//                         <img src={service.images[0]} alt={service.title} className="h-12 w-12 object-cover rounded" />
//                         {service.images.length > 1 && (
//                           <span className="text-xs text-gray-500">+{service.images.length - 1}</span>
//                         )}
//                       </div>
//                     ) : service.image ? (
//                       <img src={service.image} alt={service.title} className="h-12 w-12 object-cover rounded" />
//                     ) : service.icon ? (
//                       <span className="text-2xl">{service.icon}</span>
//                     ) : (
//                       <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.title}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{service.description}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{service.slug}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
//                     <button onClick={() => handleOpenModal('edit', service)} className="text-blue-600 hover:text-blue-900">
//                       <FaEdit />
//                     </button>
//                     <button onClick={() => handleDelete(service._id)} className="text-red-600 hover:text-red-900">
//                       <FaTrash />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="5" className="text-center py-4 text-gray-500">No services found.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {modalOpen && (
//         <Modal title={`${modalType === 'add' ? 'Add' : 'Edit'} Service`} onClose={handleCloseModal}>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Service Title</label>
//               <input 
//                 type="text" 
//                 name="title" 
//                 value={itemData.title} 
//                 onChange={handleChange} 
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" 
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Description</label>
//               <textarea 
//                 name="description" 
//                 value={itemData.description} 
//                 onChange={handleChange} 
//                 rows="3" 
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" 
//                 required
//               ></textarea>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Single Image URL (Optional)</label>
//               <input 
//                 type="text" 
//                 name="image" 
//                 value={itemData.image} 
//                 onChange={handleChange} 
//                 placeholder="https://example.com/image.jpg"
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" 
//               />
//               {itemData.image && (
//                 <div className="mt-2">
//                   <img src={itemData.image} alt="Preview" className="h-24 w-24 object-cover rounded" />
//                 </div>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Multiple Image URLs (For Auto-Rotation)</label>
//               <div className="flex gap-2">
//                 <input 
//                   type="text" 
//                   value={newImageUrl}
//                   onChange={(e) => setNewImageUrl(e.target.value)}
//                   placeholder="https://example.com/image.jpg"
//                   className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter') {
//                       e.preventDefault();
//                       addImageToArray();
//                     }
//                   }}
//                 />
//                 <button
//                   type="button"
//                   onClick={addImageToArray}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                 >
//                   Add
//                 </button>
//               </div>
              
//               {itemData.images.length > 0 && (
//                 <div className="mt-3 space-y-2">
//                   <p className="text-sm text-gray-600">{itemData.images.length} image(s) added:</p>
//                   <div className="grid grid-cols-3 gap-2">
//                     {itemData.images.map((img, index) => (
//                       <div key={index} className="relative group">
//                         <img src={img} alt={`Preview ${index + 1}`} className="h-20 w-full object-cover rounded" />
//                         <button
//                           type="button"
//                           onClick={() => removeImage(index)}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
//                         >
//                           <FaTimes size={10} />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Icon (Optional - e.g., 💼)</label>
//               <input 
//                 type="text" 
//                 name="icon" 
//                 value={itemData.icon} 
//                 onChange={handleChange} 
//                 placeholder="Enter emoji or icon"
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" 
//               />
//             </div>

//             <div className="flex justify-end space-x-2 mt-4">
//               <button 
//                 type="button" 
//                 onClick={handleCloseModal} 
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button 
//                 type="submit" 
//                 disabled={loading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {modalType === 'add' ? 'Add' : 'Update'}
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default ServiceManagement;





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
// import Modal from './Modal';

// const ServiceManagement = () => {
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalType, setModalType] = useState('add');
//   const [currentEditItem, setCurrentEditItem] = useState(null);
//   const [itemData, setItemData] = useState({ title: '', description: '', slug: '' });

//   const API_URL = 'http://localhost:8000/api/services';

//   const fetchServices = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(API_URL);
//       setServices(response.data);
//     } catch (err) {
//       setError('Failed to fetch services');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchServices();
//   }, []);

//   const handleOpenModal = (type, item = null) => {
//     setModalType(type);
//     setCurrentEditItem(item);
//     if (item) {
//       setItemData({ title: item.title, description: item.description, slug: item.slug });
//     } else {
//       setItemData({ title: '', description: '', slug: '' });
//     }
//     setModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setCurrentEditItem(null);
//     setItemData({ title: '', description: '', slug: '' });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setItemData(prevData => {
//       const newData = { ...prevData, [name]: value };
//       if (name === 'title') {
//         newData.slug = value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
//       }
//       return newData;
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       if (modalType === 'add') {
//         await axios.post(API_URL, itemData);
//       } else {
//         await axios.put(`${API_URL}/${currentEditItem._id}`, itemData);
//       }
//       handleCloseModal();
//       fetchServices();
//     } catch (err) {
//       setError(`Failed to ${modalType} service`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this service?")) return;
//     setLoading(true);
//     setError(null);
//     try {
//       await axios.delete(`${API_URL}/${id}`);
//       fetchServices();
//     } catch (err) {
//       setError('Failed to delete service');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <p className="text-center text-gray-500">Loading services...</p>;
//   if (error) return <p className="text-center text-red-500">Error: {error}</p>;

//   return (
//     <div>
//       <div className="flex justify-end mb-4">
//         <button onClick={() => handleOpenModal('add')} className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
//           <FaPlus />
//           <span>Add New Service</span>
//         </button>
//       </div>
//       <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {services.length > 0 ? (
//               services.map(service => (
//                 <tr key={service._id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.title}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{service.description}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{service.slug}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
//                     <button onClick={() => handleOpenModal('edit', service)} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
//                     <button onClick={() => handleDelete(service._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" className="text-center py-4 text-gray-500">No services found.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       {modalOpen && (
//         <Modal title={`${modalType === 'add' ? 'Add' : 'Edit'} Service`} onClose={handleCloseModal}>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Service Title</label>
//               <input type="text" name="title" value={itemData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Description</label>
//               <textarea name="description" value={itemData.description} onChange={handleChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required></textarea>
//             </div>
//             <div className="flex justify-end space-x-2 mt-4">
//               <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">{modalType === 'add' ? 'Add' : 'Update'}</button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default ServiceManagement;
