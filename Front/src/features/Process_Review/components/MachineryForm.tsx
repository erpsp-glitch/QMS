import { useState, useEffect, useRef } from "react";
import type { MachineDTO } from "../../../api/master.api";
import { FiX, FiSave, FiAlertCircle, FiInfo, FiCheck, FiCalendar, FiHash, FiTool } from "react-icons/fi";

interface Props {
  machine: MachineDTO | null;
  onClose: () => void;
  isAdd: boolean;
  onSubmit: (data: MachineDTO, isAddMode: boolean) => void;
}

interface ValidationErrors {
  machineIdentNo?: string;
  machineName?: string;
  yearOfInstallation?: string;
  [key: string]: string | undefined;
}

export default function MachineryForm({ machine, onClose, isAdd, onSubmit }: Props) {
  const [formData, setFormData] = useState<MachineDTO>({
    machineIdentNo: "",
    machineName: "",
    model: "",
    yearOfInstallation: undefined,
    dailyWeeklyChecklistNo: "",
    halfYearlyChecklistNo: "",
    remarks: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    if (machine) {
      setFormData(machine);
    }
  }, [machine]);

  // Focus first input when form opens
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && e.ctrlKey) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validate field on change if it's been touched before
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name: string, value: string | number | undefined) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "machineIdentNo":
        if (!value?.trim()) {
          newErrors.machineIdentNo = "Machine Ident No is required";
        } else if (value.length < 2) {
          newErrors.machineIdentNo = "Ident No must be at least 2 characters";
        } else {
          delete newErrors.machineIdentNo;
        }
        break;
        
      case "machineName":
        if (!value?.trim()) {
          newErrors.machineName = "Machine Name is required";
        } else if (value.length < 3) {
          newErrors.machineName = "Name must be at least 3 characters";
        } else {
          delete newErrors.machineName;
        }
        break;
        
      case "yearOfInstallation":
        if (value) {
          const numValue = parseInt(value, 10);
          const currentYear = new Date().getFullYear();
          if (isNaN(numValue) || numValue < 1900 || numValue > currentYear + 1) {
            newErrors.yearOfInstallation = `Year must be between 1900 and ${currentYear + 1}`;
          } else {
            delete newErrors.yearOfInstallation;
          }
        } else {
          delete newErrors.yearOfInstallation;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers and empty value
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({ ...formData, [name]: value === '' ? undefined : parseInt(value, 10) });
      
      // Validate field if it's been touched before
      if (touched[name]) {
        validateField(name, value === '' ? undefined : parseInt(value, 10));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.machineIdentNo?.trim()) {
      newErrors.machineIdentNo = "Machine Ident No is required";
    } else if (formData.machineIdentNo.length < 2) {
      newErrors.machineIdentNo = "Ident No must be at least 2 characters";
    }
    
    if (!formData.machineName?.trim()) {
      newErrors.machineName = "Machine Name is required";
    } else if (formData.machineName.length < 3) {
      newErrors.machineName = "Name must be at least 3 characters";
    }
    
    if (formData.yearOfInstallation) {
      const currentYear = new Date().getFullYear();
      if (formData.yearOfInstallation < 1900 || formData.yearOfInstallation > currentYear + 1) {
        newErrors.yearOfInstallation = `Year must be between 1900 and ${currentYear + 1}`;
      }
    }
    
    setErrors(newErrors);
    
    // Mark all fields as touched to show errors
    const allFields = [
      "machineIdentNo", 
      "machineName", 
      "yearOfInstallation", 
      "model", 
      "dailyWeeklyChecklistNo", 
      "halfYearlyChecklistNo", 
      "remarks"
    ];
    
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField && formRef.current) {
        const errorInput = formRef.current.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        if (errorInput) errorInput.focus();
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData, isAdd);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-gray-200">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-5 flex justify-between items-center rounded-t-2xl shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FiTool className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">
              {isAdd ? "Add New Machine" : "Edit Machine Details"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-white/10"
            aria-label="Close form"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Machine Ident No */}
            <div className="space-y-2">
              <label htmlFor="machineIdentNo" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <FiHash className="w-4 h-4" />
                Machine Ident No <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={firstInputRef}
                  id="machineIdentNo"
                  name="machineIdentNo"
                  value={formData.machineIdentNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., MACH-001"
                  className={`border ${errors.machineIdentNo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition w-full pl-10`}
                />
                <FiHash className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {!errors.machineIdentNo && formData.machineIdentNo && (
                  <FiCheck className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                )}
              </div>
              {errors.machineIdentNo && (
                <p className="text-red-500 text-sm flex items-center gap-1.5 mt-1.5">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> 
                  <span>{errors.machineIdentNo}</span>
                </p>
              )}
            </div>

            {/* Machine Name */}
            <div className="space-y-2">
              <label htmlFor="machineName" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <FiTool className="w-4 h-4" />
                Machine Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="machineName"
                  name="machineName"
                  value={formData.machineName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., CNC Lathe Machine"
                  className={`border ${errors.machineName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition w-full pl-10`}
                />
                <FiTool className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {!errors.machineName && formData.machineName && (
                  <FiCheck className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                )}
              </div>
              {errors.machineName && (
                <p className="text-red-500 text-sm flex items-center gap-1.5 mt-1.5">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> 
                  <span>{errors.machineName}</span>
                </p>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., XYZ-5000"
                className="border border-gray-300 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-full"
              />
            </div>

            {/* Year of Installation */}
            <div className="space-y-2">
              <label htmlFor="yearOfInstallation" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                Year of Installation
              </label>
              <div className="relative">
                <input
                  id="yearOfInstallation"
                  name="yearOfInstallation"
                  type="number"
                  min="1900"
                  max={getCurrentYear() + 1}
                  value={formData.yearOfInstallation || ''}
                  onChange={handleNumberChange}
                  onBlur={handleBlur}
                  placeholder={`e.g., ${getCurrentYear()}`}
                  className={`border ${errors.yearOfInstallation ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition w-full pl-10`}
                />
                <FiCalendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {!errors.yearOfInstallation && formData.yearOfInstallation && (
                  <FiCheck className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                )}
              </div>
              {errors.yearOfInstallation && (
                <p className="text-red-500 text-sm flex items-center gap-1.5 mt-1.5">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> 
                  <span>{errors.yearOfInstallation}</span>
                </p>
              )}
            </div>

            {/* Daily/Weekly Checklist */}
            <div className="space-y-2">
              <label htmlFor="dailyWeeklyChecklistNo" className="block text-sm font-medium text-gray-700">
                Daily/Weekly Checklist No
              </label>
              <input
                id="dailyWeeklyChecklistNo"
                name="dailyWeeklyChecklistNo"
                value={formData.dailyWeeklyChecklistNo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., DW-CHK-001"
                className="border border-gray-300 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-full"
              />
            </div>

            {/* Half-Yearly Checklist */}
            <div className="space-y-2">
              <label htmlFor="halfYearlyChecklistNo" className="block text-sm font-medium text-gray-700">
                Half-Yearly Checklist No
              </label>
              <input
                id="halfYearlyChecklistNo"
                name="halfYearlyChecklistNo"
                value={formData.halfYearlyChecklistNo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., HY-CHK-001"
                className="border border-gray-300 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-full"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-6">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Additional notes or comments..."
              rows={3}
              className="border border-gray-300 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-full"
            />
          </div>

          {/* Required fields note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <FiInfo className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 text-sm font-medium">Required Fields</p>
              <p className="text-blue-700 text-sm mt-1">Fields marked with <span className="text-red-500">*</span> are required. Please ensure all required information is provided before submitting.</p>
            </div>
          </div>

          {/* Form validation summary */}
          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4" />
                Please fix the following errors before submitting:
              </p>
              <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-800 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              disabled={isSubmitting || hasErrors}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isAdd ? "Adding Machine..." : "Saving Changes..."}
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  {isAdd ? "Add Machine" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity:0; transform: translateY(-10px) scale(0.95); }
          to { opacity:1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}