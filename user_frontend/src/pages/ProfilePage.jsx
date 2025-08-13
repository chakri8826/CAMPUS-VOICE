import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import { useSelector, useDispatch } from "react-redux";
import Toast from "../components/Toast";
import { getAvatarUrl } from "../utils/avatarUtils.js";
import { apiFetch } from "../utils/api.js";
import { updateAvatar } from "../features/auth/authSlice.js";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editForm, setEditForm] = useState({ department: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [toast, setToast] = useState(null);

  const { token, user: reduxUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();



  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setToast(null);
      try {
        if (!token || !reduxUser)
          throw new Error("Not authenticated. Please log in.");
        const userId = reduxUser.id || reduxUser._id;
        if (!userId) throw new Error("User ID not found.");

        const res = await apiFetch(`/api/users/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server error: Invalid response.");
        }
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");

        setUser(data.data.user);
        setRecentComplaints(data.data.recentComplaints || []);
        setEditForm({
          department: data.data.user.department || "",
          email: data.data.user.email || "",
        });
        
        // Sync Redux state if it's different from fetched data
        if (data.data.user.avatar !== reduxUser?.avatar) {
          dispatch(updateAvatar(data.data.user.avatar));
        }
      } catch (err) {
        setToast({
          type: "error",
          message: err.message || "Failed to load profile.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, reduxUser]);



  if (loading) {
    return (
      <div
        className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden"
        style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
      >
        <Navbar />
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  // Check if user data is available
  if (!user) {
    return (
      <div
        className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden"
        style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
      >
        <Navbar />
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-lg">Failed to load profile. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-2 sm:px-4 md:px-6 flex flex-1 justify-center py-4 sm:py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-2 sm:p-4">
              <p className="text-white tracking-light text-xl sm:text-2xl md:text-[32px] font-bold leading-tight min-w-0 sm:min-w-72 break-words">
                Profile
              </p>
            </div>

            {/* Profile Header */}
            <div className="p-2 sm:p-4">
              <div className="bg-[#214a3c] rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#019863] rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={getAvatarUrl(user.avatar)}
                        alt="avatar"
                        className="w-16 sm:w-20 h-16 sm:h-20 object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="text-white text-lg sm:text-2xl font-bold"
                      style={{ display: user.avatar ? "none" : "flex" }}
                    >
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words">
                      {user.name}
                    </h2>
                    <p className="text-[#8ecdb7] text-xs sm:text-sm mb-1 break-words">
                      {user.email}
                    </p>
                    <p className="text-[#8ecdb7] text-xs sm:text-sm break-words">
                      {user.department &&
                      [
                        "Computer Science",
                        "Electrical Engineering",
                        "Mechanical Engineering",
                        "Civil Engineering",
                        "Chemical Engineering",
                        "Other",
                      ].includes(user.department)
                        ? user.department
                        : "Other"}
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="p-2 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4">
                  <div className="text-white text-xl sm:text-2xl font-bold">
                    {user.complaintsSubmitted}
                  </div>
                  <div className="text-[#8ecdb7] text-xs sm:text-sm">
                    Complaints Submitted
                  </div>
                </div>
                <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4">
                  <div className="text-white text-xl sm:text-2xl font-bold">
                    {user.complaintsResolved}
                  </div>
                  <div className="text-[#8ecdb7] text-xs sm:text-sm">
                    Complaints Resolved
                  </div>
                </div>

              </div>
            </div>

            {/* Tabs */}
            <div className="p-2 sm:p-4">
              <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-[#214a3c]">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "overview"
                      ? "text-white border-b-2 border-[#019863]"
                      : "text-[#8ecdb7] hover:text-white"
                  }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "settings"
                      ? "text-white border-b-2 border-[#019863]"
                      : "text-[#8ecdb7] hover:text-white"
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-2 sm:p-4">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4">
                    <h3 className="text-white text-base sm:text-lg font-bold mb-3">
                      Recent Activity
                    </h3>
                    <div className="space-y-2">
                      {recentComplaints && recentComplaints.length > 0 ? (
                        recentComplaints.map((complaint) => (
                          <div
                            key={complaint._id}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-[#8ecdb7] text-xs sm:text-sm cursor-pointer hover:text-white transition-colors"
                            onClick={() =>
                              navigate(`/complaints/${complaint._id}`)
                            }
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-2 h-2 bg-[#019863] rounded-full flex-shrink-0"></div>
                              <span className="flex-1 break-words">
                                {complaint.title}
                              </span>
                            </div>
                            <div className="flex gap-2 sm:gap-3 text-xs">
                              <span className="text-xs">
                                {complaint.status
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                              <span className="text-xs">
                                {new Date(
                                  complaint.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[#8ecdb7] text-xs sm:text-sm">
                          No recent activity found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div className="bg-[#214a3c] rounded-lg p-3 sm:p-4">
                    <h3 className="text-white text-base sm:text-lg font-bold mb-4">
                      Account Settings
                    </h3>
                    <div className="space-y-4">
                      {/* Avatar Upload */}
                      <div>
                        <label className="block text-[#8ecdb7] text-xs sm:text-sm font-medium mb-2">
                          Avatar
                        </label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-[#019863] flex items-center justify-center text-lg sm:text-2xl text-white font-bold overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={getAvatarUrl(user.avatar)}
                                alt="avatar"
                                className="w-12 sm:w-16 h-12 sm:h-16 object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <span
                              style={{ display: user.avatar ? "none" : "flex" }}
                            >
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!avatarFile) {
                                setToast({
                                  type: "error",
                                  message: "Please select an image.",
                                });
                                return;
                              } 
                              setAvatarUploading(true);
                              setToast(null);
                              try {
                                const formData = new FormData();
                                formData.append("file", avatarFile);
                                const res = await apiFetch("/api/users/avatar", {
                                  method: "PUT",
                                  headers: { Authorization: `Bearer ${token}` },
                                  body: formData,
                                });
                                const data = await res.json();
                                if (!res.ok)
                                  throw new Error(
                                    data.message || "Failed to update avatar"
                                  );
                                // Normalize the avatar path
                                const normalizedAvatar =
                                  data.data.avatar?.replace(/\\/g, "/");
                                
                                // Update Redux state so Navbar reflects the change
                                dispatch(updateAvatar(normalizedAvatar));
                                
                                // Update local state for immediate UI update
                                setUser((u) => ({
                                  ...u,
                                  avatar: normalizedAvatar,
                                }));
                                
                                setToast({
                                  type: "success",
                                  message: "Avatar updated successfully!",
                                });
                                setAvatarFile(null);
                              } catch (err) {
                                setToast({
                                  type: "error",
                                  message:
                                    err.message || "Failed to update avatar.",
                                });
                              } finally {
                                setAvatarUploading(false);
                              }
                            }}
                            className="flex flex-col sm:flex-row gap-2 sm:gap-3"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setAvatarFile(e.target.files[0])}
                              className="hidden"
                              id="avatar-upload"
                            />
                            <label
                              htmlFor="avatar-upload"
                              className="px-2 sm:px-3 py-2 bg-[#019863] text-white rounded-lg cursor-pointer hover:bg-[#017a4f] transition-colors text-xs sm:text-sm"
                            >
                              {avatarFile ? avatarFile.name : "Choose File"}
                            </label>
                            <button
                              type="submit"
                              className="px-3 sm:px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a4f] transition-colors disabled:opacity-50 text-xs sm:text-sm"
                              disabled={avatarUploading || !avatarFile}
                            >
                              {avatarUploading ? "Uploading..." : "Upload"}
                            </button>
                          </form>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#8ecdb7] text-xs sm:text-sm font-medium mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editForm.email || user.email}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              email: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-[#8ecdb7] text-xs sm:text-sm font-medium mb-2">
                          Department
                        </label>
                        <select
                          value={editForm.department || user.department}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              department: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white text-sm sm:text-base"
                        >
                          <option value="">Select Department</option>
                          <option value="Computer Science">
                            Computer Science
                          </option>
                          <option value="Electrical Engineering">
                            Electrical Engineering
                          </option>
                          <option value="Mechanical Engineering">
                            Mechanical Engineering
                          </option>
                          <option value="Civil Engineering">
                            Civil Engineering
                          </option>
                          <option value="Chemical Engineering">
                            Chemical Engineering
                          </option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {/* Password Change */}
                      <div>
                        <label className="block text-[#8ecdb7] text-xs sm:text-sm font-medium mb-2">
                          Change Password
                        </label>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setPasswordSaving(true);
                            setToast(null);
                            try {
                              if (
                                passwordForm.newPassword !==
                                passwordForm.confirmPassword
                              ) {
                                throw new Error("New passwords do not match.");
                              }
                              const res = await apiFetch(
                                "/api/auth/updatepassword",
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({
                                    currentPassword:
                                      passwordForm.currentPassword,
                                    newPassword: passwordForm.newPassword,
                                  }),
                                }
                              );
                              const data = await res.json();
                              if (!res.ok)
                                throw new Error(
                                  data.message || "Failed to update password"
                                );
                              setToast({
                                type: "success",
                                message: "Password updated successfully!",
                              });
                              setPasswordForm({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                            } catch (err) {
                              setToast({
                                type: "error",
                                message:
                                  err.message || "Failed to update password.",
                              });
                            } finally {
                              setPasswordSaving(false);
                            }
                          }}
                          className="space-y-2"
                        >
                          <input
                            type="password"
                            placeholder="Current Password"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((f) => ({
                                ...f,
                                currentPassword: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white text-sm sm:text-base"
                            required
                          />
                          <input
                            type="password"
                            placeholder="New Password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((f) => ({
                                ...f,
                                newPassword: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white text-sm sm:text-base"
                            required
                          />
                          <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((f) => ({
                                ...f,
                                confirmPassword: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white text-sm sm:text-base"
                            required
                          />
                          <button
                            type="submit"
                            className="px-3 sm:px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a4f] transition-colors disabled:opacity-50 text-xs sm:text-sm"
                            disabled={passwordSaving}
                          >
                            {passwordSaving ? "Saving..." : "Change Password"}
                          </button>
                        </form>
                      </div>
                      <div className="flex gap-3 sm:gap-4">
                        <button
                          className="px-3 sm:px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a4f] transition-colors disabled:opacity-50 text-xs sm:text-sm"
                          disabled={saving}
                          onClick={async (e) => {
                            e.preventDefault();
                            setSaving(true);
                            setToast(null);
                            try {
                              const updateData = {};

                              // Include email if it's different from current
                              if (
                                editForm.email &&
                                editForm.email !== user.email
                              ) {
                                updateData.email = editForm.email;
                              }

                              // Include department if it's different from current
                              if (editForm.department !== undefined)
                                updateData.department = editForm.department;

                              const res = await apiFetch(
                                "/api/auth/updatedetails",
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify(updateData),
                                }
                              );
                              const data = await res.json();
                              if (!res.ok)
                                throw new Error(
                                  data.message || "Failed to update profile"
                                );

                              // Update local state
                              setUser((u) => ({ ...u, ...updateData }));

                              setToast({
                                type: "success",
                                message: "Profile updated successfully!",
                              });
                            } catch (err) {
                              setToast({
                                type: "error",
                                message:
                                  err.message || "Failed to update profile.",
                              });
                            } finally {
                              setSaving(false);
                            }
                          }}
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
