import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faShieldAlt,
  faLock,
  faCheckCircle,
  faTimesCircle,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import API_CONFIG from "../../config/api";

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pass) => {
    if (!pass) return 0;

    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[\W_]/.test(pass)) strength += 1;

    return Math.min(5, strength);
  };

  const strength = getStrength(password);
  const strengthLabels = [
    "Very Weak",
    "Weak",
    "Medium",
    "Strong",
    "Very Strong",
  ];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">Password strength:</span>
        <span
          className={`text-xs font-bold ${
            colors[strength - 1]
              ? colors[strength - 1].replace("bg", "text")
              : "text-gray-500"
          }`}
        >
          {strength > 0 ? strengthLabels[strength - 1] : ""}
        </span>
      </div>
      <div className="flex h-1.5 bg-gray-200 rounded-full overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-full flex-1 mx-0.5 rounded-full ${
              i < strength ? colors[i] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const PasswordField = ({
  name,
  label,
  value,
  onChange,
  showPassword,
  toggleVisibility,
  strengthMeter = false,
  confirmMatch = false,
  disabled = false,
}) => {
  const isNewPassword = name === "newPassword";
  const isConfirmPassword = name === "confirmPassword";

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {isConfirmPassword && value && (
          <span
            className={`text-xs font-bold ${
              confirmMatch ? "text-green-600" : "text-red-600"
            }`}
          >
            <FontAwesomeIcon
              icon={confirmMatch ? faCheckCircle : faTimesCircle}
              className="mr-1"
            />
            {confirmMatch ? "Passwords match" : "Passwords don't match"}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-3 border ${
            isConfirmPassword && value && !confirmMatch
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors`}
          required
        />

        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon
            icon={name === "currentPassword" ? faLock : faShieldAlt}
            className={`text-gray-400 ${
              isConfirmPassword && value && !confirmMatch ? "text-red-400" : ""
            }`}
          />
        </div>

        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </button>
      </div>

      {isNewPassword && strengthMeter && (
        <PasswordStrengthIndicator password={value} />
      )}
    </div>
  );
};

const SecuritySettings = () => {
  const { token, user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [lastChanged, setLastChanged] = useState(null);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch last password change date (simulated)
  useEffect(() => {
    // In a real app, this would come from an API
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setLastChanged("2023-10-15T14:30:00Z");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Validate password requirements
  useEffect(() => {
    const { newPassword } = formData;
    setRequirements({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[\W_]/.test(newPassword),
    });
  }, [formData.newPassword]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const { newPassword, confirmPassword, currentPassword } = formData;

      // Enhanced validation
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }

      if (currentPassword === newPassword) {
        toast.error("New password must be different from current password.");
        return;
      }

      if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
      }

      if (
        !requirements.uppercase ||
        !requirements.lowercase ||
        !requirements.number ||
        !requirements.special
      ) {
        toast.error("Password does not meet complexity requirements.");
        return;
      }

      setLoading(true);
      try {
        await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHANGE_PASSWORD}`,
          { currentPassword, newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (isMountedRef.current) {
          toast.success(
            <div>
              <div className="font-bold">Password Changed Successfully!</div>
              <div className="text-sm">Your account is now more secure</div>
            </div>,
            {
              icon: (
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="text-green-500"
                />
              ),
            }
          );
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setLastChanged(new Date().toISOString());
        }
      } catch (error) {
        if (isMountedRef.current) {
          const errorMessage =
            error.response?.data?.error || "Failed to change password.";
          toast.error(errorMessage, {
            icon: (
              <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
            ),
          });
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    },
    [formData, token, requirements]
  );

  const confirmMatch =
    formData.newPassword === formData.confirmPassword &&
    formData.confirmPassword.length > 0;

  const formatDate = (dateString) => {
    if (!dateString) return "Loading...";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-xl mr-4">
              <FontAwesomeIcon icon={faLock} size="2x" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Password & Security</h2>
              <p className="opacity-80">
                Manage your account security settings
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start">
              <FontAwesomeIcon
                icon={faShieldAlt}
                className="text-blue-600 mt-1 mr-3"
              />
              <div>
                <h3 className="font-semibold text-blue-800">Security Status</h3>
                <p className="text-sm text-gray-600">
                  Your account security is{" "}
                  {formData.newPassword.length >= 8 ? "strong" : "good"}.
                  {lastChanged && (
                    <span>
                      {" "}
                      Password last changed: {formatDate(lastChanged)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-6 flex items-center">
            <FontAwesomeIcon icon={faLock} className="mr-3 text-indigo-600" />
            Change Password
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              name="currentPassword"
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              showPassword={passwordVisibility.currentPassword}
              toggleVisibility={() =>
                togglePasswordVisibility("currentPassword")
              }
              disabled={loading}
            />

            <PasswordField
              name="newPassword"
              label="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              showPassword={passwordVisibility.newPassword}
              toggleVisibility={() => togglePasswordVisibility("newPassword")}
              strengthMeter={true}
              disabled={loading}
            />

            <div className="bg-gray-50 p-4 rounded-lg mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Password Requirements
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li
                  className={`flex items-center ${
                    requirements.length ? "text-green-600" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={requirements.length ? faCheckCircle : faTimesCircle}
                    className={`mr-2 ${
                      requirements.length ? "text-green-500" : "text-gray-400"
                    }`}
                    size="xs"
                  />
                  At least 8 characters long
                </li>
                <li
                  className={`flex items-center ${
                    requirements.uppercase ? "text-green-600" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      requirements.uppercase ? faCheckCircle : faTimesCircle
                    }
                    className={`mr-2 ${
                      requirements.uppercase
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    size="xs"
                  />
                  Contains uppercase letters (A-Z)
                </li>
                <li
                  className={`flex items-center ${
                    requirements.lowercase ? "text-green-600" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      requirements.lowercase ? faCheckCircle : faTimesCircle
                    }
                    className={`mr-2 ${
                      requirements.lowercase
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    size="xs"
                  />
                  Contains lowercase letters (a-z)
                </li>
                <li
                  className={`flex items-center ${
                    requirements.number ? "text-green-600" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={requirements.number ? faCheckCircle : faTimesCircle}
                    className={`mr-2 ${
                      requirements.number ? "text-green-500" : "text-gray-400"
                    }`}
                    size="xs"
                  />
                  Contains numbers (0-9)
                </li>
                <li
                  className={`flex items-center ${
                    requirements.special ? "text-green-600" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={requirements.special ? faCheckCircle : faTimesCircle}
                    className={`mr-2 ${
                      requirements.special ? "text-green-500" : "text-gray-400"
                    }`}
                    size="xs"
                  />
                  Contains special characters (!@#$%^&*)
                </li>
              </ul>
            </div>

            <PasswordField
              name="confirmPassword"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              showPassword={passwordVisibility.confirmPassword}
              toggleVisibility={() =>
                togglePasswordVisibility("confirmPassword")
              }
              confirmMatch={confirmMatch}
              disabled={loading}
            />

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 font-bold rounded-xl transition-all transform hover:scale-[1.02] flex items-center ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSyncAlt} spin className="mr-2" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center text-sm text-gray-500">
          <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-gray-400" />
          Your security is our priority. All data is encrypted in transit and at
          rest.
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
