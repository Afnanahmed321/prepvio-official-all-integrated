import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ---------------- Selection Button (Updated with matching theme) ---------------- */

const SelectionButton = ({
  value,
  options,
  onSelect,
  disabled = false,
  placeholder,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [roleWarning, setRoleWarning] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const displayValue = value || placeholder;

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <motion.button
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          } else {
            setRoleWarning(true);
            setTimeout(() => setRoleWarning(false), 3000);
          }
        }}
        disabled={disabled}
        className={`
          w-full px-6 py-4 rounded-2xl text-left border-2 transition-all font-medium
          ${
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white/90 backdrop-blur-sm text-gray-900 border-gray-200 hover:border-[#D4F478] hover:bg-white shadow-sm hover:shadow-md"
          }
          flex items-center justify-between
        `}
      >
        <span className={!value ? "text-gray-400" : "text-gray-900"}>
          {displayValue}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className={`w-5 h-5 ${disabled ? "text-gray-400" : "text-gray-600"}`} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-gray-100 max-h-64 overflow-y-auto"
          >
            {options.map((option, index) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`px-6 py-3.5 cursor-pointer flex justify-between items-center transition-colors
                  ${
                    value === option
                      ? "bg-[#D4F478]/20 font-bold text-gray-900"
                      : "hover:bg-gray-50 text-gray-700"
                  }
                  ${index === 0 ? "rounded-t-2xl" : ""}
                  ${index === options.length - 1 ? "rounded-b-2xl" : ""}
                `}
              >
                {option}
                {value === option && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="w-5 h-5 text-[#1A1A1A]" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {roleWarning && disabled && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-red-500 font-medium text-center mt-2"
          >
            Please select a Company Type first.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Main Page (Matching Home.js theme) ---------------- */

const SelectRolesAndCompany = ({
  companyType,
  setCompanyType,
  role,
  setRole,
}) => {
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/companies");
        if (Array.isArray(res.data)) setCompanies(res.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!companyType) {
        setRoles([]);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/api/companies/roles/${encodeURIComponent(
            companyType
          )}`
        );

        if (Array.isArray(res.data)) {
          setRoles(res.data.map((r) => (typeof r === "string" ? r : r.name)));
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoles([]);
      }
    };

    fetchRoles();
  }, [companyType]);

  const handleCompanySelect = (type) => {
    setCompanyType(type);
    setRole(null);
  };

  const handleRoleSelect = (selectedRole) => {
    if (companyType) setRole(selectedRole);
  };

  const handleStartInterview = () => {
    if (companyType && role) {
      navigate("/services/check-your-ability/rounds");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] p-6 font-sans selection:bg-[#D4F478] selection:text-black flex items-center justify-center relative overflow-hidden">
      {/* Background decorations matching Home.js */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-t from-pink-50 to-transparent rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-3xl bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-2xl shadow-gray-200/50 p-10 md:p-16 space-y-10 relative overflow-hidden"
      >
        {/* Floating decoration */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-8 -right-8 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"
        />

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-[#D4F478]" />
            </motion.div>
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
              AI-Powered Practice
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
            Check Your Ability
          </h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 100 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-1.5 bg-[#D4F478] mx-auto rounded-full"
          />
          
          <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto font-medium pt-2">
            Choose a company type and role to begin your mock interview experience
          </p>
        </motion.div>

        {/* Selectors */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-stretch gap-5 relative z-10"
        >
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-2 block">
              Company Type
            </label>
            <SelectionButton
              placeholder="Select Company Type"
              value={companyType}
              options={companies}
              onSelect={handleCompanySelect}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-2 block">
              Role
            </label>
            <SelectionButton
              placeholder="Select Role"
              value={role}
              options={roles}
              onSelect={handleRoleSelect}
              disabled={!companyType}
            />
          </div>
        </motion.div>

        {/* CTA matching Home.js button style */}
        <motion.div
          variants={itemVariants}
          className="pt-8 border-t border-gray-200/50 flex justify-center relative z-10"
        >
          <motion.button
            whileHover={companyType && role ? "hover" : {}}
            whileTap={companyType && role ? "tap" : {}}
            onClick={handleStartInterview}
            disabled={!companyType || !role}
            className={`
              flex items-center gap-0 group cursor-pointer
              ${!companyType || !role ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <span
              className={`
                px-10 py-4 rounded-l-full font-bold text-lg shadow-xl z-10 relative
                ${
                  companyType && role
                    ? "bg-[#1A1A1A] text-white shadow-gray-300/50"
                    : "bg-gray-300 text-gray-500"
                }
              `}
            >
              Start Your Interview
            </span>
            <motion.span
              className={`
                w-14 h-[3.75rem] flex items-center justify-center rounded-r-full border-l-2 origin-left
                ${
                  companyType && role
                    ? "bg-[#D4F478] border-[#1A1A1A] group-hover:bg-[#cbf060]"
                    : "bg-gray-200 border-gray-300"
                }
                transition-colors
              `}
              variants={{
                hover: { x: 5 },
                tap: { x: 0 },
              }}
            >
              <ArrowRight
                className={`w-6 h-6 transition-transform duration-300 ${
                  companyType && role
                    ? "text-black group-hover:rotate-[-45deg]"
                    : "text-gray-500"
                }`}
              />
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2 pt-4"
        >
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              companyType ? "bg-[#D4F478]" : "bg-gray-300"
            }`}
          />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Step 1 of 2
            </span>
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SelectRolesAndCompany;



































// -------- Correct actual working code --------

// import React, { useState, useRef, useEffect } from "react";
// import { Check } from "lucide-react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// /* ---------------- Selection Button (LOGIC UNCHANGED) ---------------- */

// const SelectionButton = ({
//   value,
//   options,
//   onSelect,
//   disabled = false,
//   placeholder,
//   className = "",
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [roleWarning, setRoleWarning] = useState(false);
//   const ref = useRef();

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (ref.current && !ref.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   const displayValue = value || placeholder;

//   return (
//     <div
//       className={`relative w-full max-w-md ${className}`}
//       ref={ref}
//     >
//       <button
//         onClick={() => {
//           if (!disabled) {
//             setIsOpen(!isOpen);
//           } else {
//             setRoleWarning(true);
//             setTimeout(() => setRoleWarning(false), 3000);
//           }
//         }}
//         disabled={disabled}
//         className={`
//           w-full px-5 py-4 rounded-xl text-left border transition
//           ${
//             disabled
//               ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
//               : "bg-white/70 backdrop-blur text-gray-800 border-gray-300 hover:bg-white"
//           }
//         `}
//       >
//         <span className={!value ? "text-gray-400" : ""}>
//           {displayValue}
//         </span>
//       </button>

//       {isOpen && options.length > 0 && (
//         <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
//           {options.map((option) => (
//             <div
//               key={option}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onSelect(option);
//                 setIsOpen(false);
//               }}
//               className={`px-5 py-3 cursor-pointer flex justify-between items-center hover:bg-indigo-50
//                 ${value === option ? "bg-indigo-100 font-semibold" : ""}
//               `}
//             >
//               {option}
//               {value === option && (
//                 <Check className="w-4 h-4 text-indigo-600" />
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {roleWarning && disabled && (
//         <p className="text-sm text-red-500 text-center mt-2">
//           Please select a Company Type first.
//         </p>
//       )}
//     </div>
//   );
// };

// /* ---------------- Main Page ---------------- */

// const SelectRolesAndCompany = ({
//   companyType,
//   setCompanyType,
//   role,
//   setRole,
// }) => {
//   const [companies, setCompanies] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchCompanies = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/companies");
//         if (Array.isArray(res.data)) setCompanies(res.data);
//       } catch (error) {
//         console.error("Error fetching companies:", error);
//       }
//     };
//     fetchCompanies();
//   }, []);

//   useEffect(() => {
//     const fetchRoles = async () => {
//       if (!companyType) {
//         setRoles([]);
//         return;
//       }

//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/companies/roles/${encodeURIComponent(
//             companyType
//           )}`
//         );

//         if (Array.isArray(res.data)) {
//           setRoles(res.data.map((r) => (typeof r === "string" ? r : r.name)));
//         }
//       } catch (error) {
//         console.error("Error fetching roles:", error);
//         setRoles([]);
//       }
//     };

//     fetchRoles();
//   }, [companyType]);

//   const handleCompanySelect = (type) => {
//     setCompanyType(type);
//     setRole(null);
//   };

//   const handleRoleSelect = (selectedRole) => {
//     if (companyType) setRole(selectedRole);
//   };

//   const handleStartInterview = () => {
//     if (companyType && role) {
//       navigate("/services/check-your-ability/rounds");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center p-6">
//       <div className="w-full max-w-2xl bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-10 space-y-10">

//         {/* Header */}
//         <div className="text-center space-y-2">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Check Your Ability
//           </h1>
//           <p className="text-gray-600 text-base">
//             Choose a company type and role to begin your mock interview
//           </p>
//         </div>

//         {/* Selectors */}
//         <div className="flex flex-col items-center gap-6">
//           <SelectionButton
//             placeholder="Select Company Type"
//             value={companyType}
//             options={companies}
//             onSelect={handleCompanySelect}
//           />

//           <SelectionButton
//             placeholder="Select Role"
//             value={role}
//             options={roles}
//             onSelect={handleRoleSelect}
//             disabled={!companyType}
//           />
//         </div>

//         {/* CTA */}
//         <div className="pt-6 border-t border-white/50 flex justify-center">
//           <button
//             onClick={handleStartInterview}
//             disabled={!companyType || !role}
//             className={`
//               px-10 py-4 rounded-full text-lg transition
//               ${
//                 companyType && role
//                   ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:scale-[1.03]"
//                   : "bg-gray-200 text-gray-400 cursor-not-allowed"
//               }
//             `}
//           >
//             Start Your Interview
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SelectRolesAndCompany;
