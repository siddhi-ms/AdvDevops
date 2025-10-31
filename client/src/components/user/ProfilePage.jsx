import React, { useState, useEffect } from "react";
import {
  Pencil,
  Star,
  Clock,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
  Trash2,
  Loader,
  Mail,
  BookOpen,
  Edit,
  Crown,
} from "lucide-react";
import MainNavbar from "../../navbar/mainNavbar";
import EditProfile from "./EditProfile";
import Avatar from "./Avatar";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("skills");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "Beginner",
  });

  // Predefined skills list
  const predefinedSkills = [
    "Java",
    "Python", 
    "C/C++",
    "MongoDB",
    "Express",
    "React",
    "Node.js",
  ];
  const [profileData, setProfileData] = useState({
    name: "",
    joinDate: "",
    rating: { average: 0, count: 0 },
    bio: "",
    email: "",
    totalSessions: 0,
    avatar: "",
    isPremium: false,
    skillsOffering: [],
    skillsSeeking: [],
  });

  // Fetch user profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        // Fetch user profile
        const profileResponse = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const profileData = await profileResponse.json();

        // Fetch user skills separately
        const skillsResponse = await fetch(
          "http://localhost:5000/api/skills/my-skills",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        let userSkills = { skillsOffering: [], skillsSeeking: [] };
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          if (skillsData.success) {
            userSkills = skillsData.data;
          }
        }

        if (profileData.success) {
          const user = profileData.user;
          console.log('User data received:', user); // Debug log
          setProfileData({
            name: user.name || "",
            joinDate: user.joinDate
              ? new Date(user.joinDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })
              : "",
            rating: user.rating || { average: 0, count: 0 },
            bio: user.bio || "",
            email: user.email || "",
            totalSessions: user.totalSessions || 0,
            isPremium: user.isPremium || false,
            avatar:
              user.avatar ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
            skillsOffering: userSkills.skillsOffering || [],
            skillsSeeking: userSkills.skillsSeeking || [],
          });
          console.log('isPremium set to:', user.isPremium); // Debug log
        } else {
          setError(profileData.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // If URL contains ?edit=true, open the edit modal
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('edit') === 'true') {
        setShowEditProfile(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch user skills separately for dynamic updates
  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const skillsResponse = await fetch(
        "http://localhost:5000/api/skills/my-skills",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        if (skillsData.success) {
          setProfileData(prev => ({
            ...prev,
            skillsOffering: skillsData.data.skillsOffering || [],
            skillsSeeking: skillsData.data.skillsSeeking || []
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  // Handle add skill form submission
  const handleAddSkill = async (e) => {
    e.preventDefault();

    if (!newSkill.name) {
      alert("Please fill in skill name");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/skills/offering",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newSkill.name,
            level: newSkill.level,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Reset form and close modal
        setNewSkill({ name: "", level: "Beginner" });
        setShowAddSkillModal(false);
        // Refresh skills data dynamically
        await fetchSkills();
        alert("Skill added successfully!");
      } else {
        alert(data.message || "Failed to add skill");
      }
    } catch (err) {
      console.error("Error adding skill:", err);
      alert("Error adding skill");
    }
  };

  // Delete an offering skill
  const deleteOfferingSkill = async (skillId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/skills/offering/${skillId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove the skill from local state
        setProfileData((prev) => ({
          ...prev,
          skillsOffering: prev.skillsOffering.filter((skill) => skill._id !== skillId)
        }));
        alert("Skill deleted successfully!");
      } else {
        console.error("Failed to delete skill:", data.message);
        alert("Failed to delete skill: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  };

  // Delete a seeking skill
  const deleteSeekingSkill = async (skillId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/skills/seeking/${skillId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove the skill from local state
        setProfileData((prev) => ({
          ...prev,
          skillsSeeking: prev.skillsSeeking.filter((skill) => skill._id !== skillId)
        }));
        alert("Skill deleted successfully!");
      } else {
        console.error("Failed to delete skill:", data.message);
        alert("Failed to delete skill: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  };

  // Handle delete confirmation
  const handleDeleteSkill = (skill) => {
    setSkillToDelete(skill);
    setShowDeleteConfirm(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (skillToDelete) {
      if (skillToDelete.isOffering) {
        await deleteOfferingSkill(skillToDelete._id);
      } else if (skillToDelete.isSeeking) {
        await deleteSeekingSkill(skillToDelete._id);
      }
    }
    setShowDeleteConfirm(false);
    setSkillToDelete(null);
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSkillToDelete(null);
  };

  // Handle profile update
  const handleProfileUpdate = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please check if the server is running."
        );
      }

      const data = await response.json();

      if (data.success) {
        // Update local profile data
        setProfileData((prev) => ({
          ...prev,
          name: data.user.name,
          bio: data.user.bio,
          avatar: data.user.avatar,
        }));

        // Update localStorage to reflect changes in navbar
        if (data.user.name) {
          localStorage.setItem("username", data.user.name);
        }
        if (data.user.avatar) {
          localStorage.setItem('userAvatar', data.user.avatar);
        }

        // Dispatch custom event to notify navbar of changes
        window.dispatchEvent(
          new CustomEvent("profileUpdated", {
            detail: {
              name: data.user.name,
              email: data.user.email,
              avatar: data.user.avatar,
            },
          })
        );

      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err; // Re-throw to be handled by EditProfile component
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Expert":
        return "bg-cyan-500";
      case "Advanced":
        return "bg-blue-500";
      case "Intermediate":
        return "bg-cyan-400";
      default:
        return "bg-gray-500";
    }
  };

  const tabs = [
    { id: "skills", label: "Skills" },
    // { id: 'reviews', label: 'Reviews' },
    // { id: 'achievements', label: 'Achievements' },
    { id: "availability", label: "Availability" },
    // { id: 'settings', label: 'Settings' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <MainNavbar />
        <div className="flex items-center gap-3">
          <Loader className="animate-spin text-sky-600" size={24} />
          <span className="text-lg text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <MainNavbar />
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <MainNavbar />
      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 transform transition-all duration-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              {/* Profile Image */}
              <div className="relative group">
                <Avatar
                  src={profileData.avatar}
                  name={profileData.name}
                  size="2xl"
                  className="ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 animate-fade-in">
                    {profileData.name}
                  </h1>
                  {/* Premium Badge */}
                  {profileData.isPremium ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-semibold rounded-full shadow-md animate-fade-in">
                      <Crown size={16} className="fill-white" />
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                      Free
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-3 text-gray-600">
                  {profileData.joinDate && (
                    <div className="flex items-center gap-1 transition-colors duration-200 hover:text-sky-600">
                      <Calendar size={16} />
                      <span className="text-sm">
                        Joined {profileData.joinDate}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${
                          i < Math.floor(profileData.rating.average)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        } transition-all duration-200`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {profileData.rating.average.toFixed(1)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({profileData.rating.count} reviews)
                  </span>
                </div>

                <p className="text-gray-600 mb-4 max-w-3xl leading-relaxed">
                  {profileData.bio || "No bio provided yet."}
                </p>

                <div className="flex items-center gap-6 text-sm">
                  {profileData.email && (
                    <div className="flex items-center gap-2 text-sky-600 transition-all duration-200 hover:text-sky-700">
                      <Mail size={16} />
                      <span>{profileData.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats & Edit Button */}
            <div className="flex flex-col items-end gap-4">
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <Edit size={18} />
                <span className="font-medium">Edit Profile</span>
              </button>

              <div className="text-right space-y-2">
                <div>
                  <div className="text-4xl font-bold text-sky-600">
                    {profileData.totalSessions}
                  </div>
                  <div className="text-sm text-gray-500">Total Sessions</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-500">
                    {profileData.skillsOffering.length}
                  </div>
                  <div className="text-sm text-gray-500">Skills Offering</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
          activeTab === tab.id
            ? "text-sky-600 border-b-2 border-sky-600"
            : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === "skills" && (
          <div className="space-y-8">
            {/* Skills I Teach */}
            <div className="bg-white rounded-2xl shadow-sm p-6 transform transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-sky-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Skills I Offer
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddSkillModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all duration-200 hover:shadow-lg transform hover:scale-105 cursor-pointer"
                >
                  <Plus size={18} />
                  <span className="font-medium">Add Skill</span>
                </button>
              </div>

              {profileData.skillsOffering.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profileData.skillsOffering.map((skill, index) => (
                    <div
                      key={skill._id}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50 transition-all duration-300 hover:shadow-md hover:border-sky-200 animate-slide-in min-w-[280px] flex-shrink-0"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 mb-2">
                            {skill.name}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 ${getLevelColor(
                              skill.offering?.level || "Beginner"
                            )} text-white text-xs font-medium rounded-full`}
                          >
                            {skill.offering?.level || "Beginner"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => handleDeleteSkill(skill)}
                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors duration-200 cursor-pointer"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">
                            {skill.offering?.sessions || 0} sessions
                          </span>
                          <div className="flex items-center gap-1">
                            <Star
                              size={12}
                              className="fill-yellow-400 text-yellow-400"
                            />
                            <span className="font-medium text-gray-900">
                              {skill.offering?.rating || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen
                    size={48}
                    className="mx-auto mb-4 text-gray-300"
                  />
                  <p>No skills offered yet.</p>
                  <p className="text-sm">
                    Add your first skill to start offering expertise!
                  </p>
                </div>
              )}
            </div>

            {/* Skills I'm Learning */}
            <div className="bg-white rounded-2xl shadow-sm p-6 transform transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="text-cyan-500" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Skills I'm Seeking
                </h2>
              </div>

              {profileData.skillsSeeking.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profileData.skillsSeeking.map((skill, index) => (
                    <div
                      key={skill._id}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50 transition-all duration-300 hover:shadow-md hover:border-cyan-200 animate-slide-in min-w-[280px] flex-shrink-0"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {skill.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleDeleteSkill(skill)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors duration-200 cursor-pointer"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {skill.seeking?.currentInstructor && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                              <span className="text-cyan-600 font-semibold text-xs">
                                {typeof skill.seeking.currentInstructor === 'string' 
                                  ? skill.seeking.currentInstructor.charAt(0).toUpperCase()
                                  : skill.seeking.currentInstructor.name?.charAt(0).toUpperCase() || 'I'
                                }
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Instructor</p>
                              <p className="font-medium">
                                {typeof skill.seeking.currentInstructor === 'string'
                                  ? skill.seeking.currentInstructor
                                  : skill.seeking.currentInstructor.name || 'Unknown Instructor'
                                }
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {!skill.seeking?.currentInstructor && (
                          <div className="text-sm text-gray-500 italic">
                            No instructor assigned yet
                          </div>
                        )}

                        {skill.seeking?.preferredSchedule && (
                          <div className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400" />
                            <span>{skill.seeking.preferredSchedule}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen
                    size={48}
                    className="mx-auto mb-4 text-gray-300"
                  />
                  <p>No skills being sought yet.</p>
                  <p className="text-sm">Start your learning journey!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Reviews content coming soon...</p>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Achievements content coming soon...</p>
          </div>
        )}

        {activeTab === "availability" && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Availability content coming soon...</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Settings content coming soon...</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={showEditProfile}
        onClose={() => {
          setShowEditProfile(false);
          try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('edit')) {
              params.delete('edit');
              const base = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
              window.history.replaceState({}, '', base);
            }
          } catch (e) {
            // ignore
          }
        }}
        profileData={profileData}
        onSave={handleProfileUpdate}
      />

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Add Offering Skill
              </h2>
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name *
                </label>
                <select
                  value={newSkill.name}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                >
                  <option value="">Select a skill...</option>
                  {predefinedSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level *
                </label>
                <select
                  value={newSkill.level}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, level: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors duration-200 cursor-pointer"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Skill
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the skill "{skillToDelete?.name}"?
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
